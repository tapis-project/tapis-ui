import { Apps } from '@tapis/tapis-typescript';
/**
 * Computes the default execution system ID that will be used
 *
 * @param app
 * @returns
 */
export var computeDefaultSystem = function (app) {
    var _a, _b;
    if ((_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.execSystemId) {
        return {
            source: 'app',
            systemId: (_b = app.jobAttributes) === null || _b === void 0 ? void 0 : _b.execSystemId,
        };
    }
    return {
        source: undefined,
        systemId: undefined,
    };
};
/**
 * Computes the logical queue that will be used, if the job does not
 * specify one
 *
 * @param job
 * @param app
 * @param systems
 * @returns
 */
export var computeDefaultQueue = function (job, app, systems) {
    var _a, _b, _c;
    // If the app specifies the logical queue, use that
    if ((_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.execSystemLogicalQueue) {
        return {
            source: 'app',
            queue: (_b = app.jobAttributes) === null || _b === void 0 ? void 0 : _b.execSystemLogicalQueue,
        };
    }
    // If the job specifies a system, look for its default logical queue
    if (job.execSystemId) {
        var selectedSystem = systems.find(function (system) { return system.id === job.execSystemId; });
        if (selectedSystem === null || selectedSystem === void 0 ? void 0 : selectedSystem.batchDefaultLogicalQueue) {
            return {
                source: 'system',
                queue: selectedSystem.batchDefaultLogicalQueue,
            };
        }
    }
    // If the app specifies a system, look for its default logical queue
    if ((_c = app.jobAttributes) === null || _c === void 0 ? void 0 : _c.execSystemId) {
        var appSystem = systems.find(function (system) { var _a; return system.id === ((_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.execSystemId); });
        if (appSystem === null || appSystem === void 0 ? void 0 : appSystem.batchDefaultLogicalQueue) {
            return {
                source: 'app system',
                queue: appSystem.batchDefaultLogicalQueue,
            };
        }
    }
    // Return a result that has no computed default logical queue
    return {
        source: undefined,
        queue: undefined,
    };
};
/**
 * Determines the default jobType if one is not specified in the jobType field in a job
 * using the algorithm specified at:
 *
 * https://tapis.readthedocs.io/en/latest/technical/jobs.html#job-type
 *
 * @param job
 * @param app
 * @param systems
 * @returns
 */
export var computeDefaultJobType = function (job, app, systems) {
    var _a;
    if (app.jobType) {
        return {
            source: 'app',
            jobType: app.jobType,
        };
    }
    if (job === null || job === void 0 ? void 0 : job.execSystemId) {
        var selectedSystem = systems.find(function (system) { return system.id === job.execSystemId; });
        if (selectedSystem === null || selectedSystem === void 0 ? void 0 : selectedSystem.canRunBatch) {
            return {
                source: 'system',
                jobType: Apps.JobTypeEnum.Batch,
            };
        }
    }
    if ((_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.execSystemId) {
        var appSystem = systems.find(function (system) { var _a; return system.id === ((_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.execSystemId); });
        if (appSystem === null || appSystem === void 0 ? void 0 : appSystem.canRunBatch) {
            return {
                source: 'app system',
                jobType: Apps.JobTypeEnum.Batch,
            };
        }
    }
    return {
        source: 'tapis',
        jobType: Apps.JobTypeEnum.Fork,
    };
};
export var ValidateExecSystemResult;
(function (ValidateExecSystemResult) {
    ValidateExecSystemResult["Complete"] = "COMPLETE";
    ValidateExecSystemResult["ErrorNoExecSystem"] = "ERROR_NO_EXEC_SYSTEM";
    ValidateExecSystemResult["ErrorExecSystemNotFound"] = "ERROR_EXEC_SYSTEM_NOT_FOUND";
    ValidateExecSystemResult["ErrorExecSystemNoQueues"] = "ERROR_EXEC_SYSTEM_NO_QUEUES";
    ValidateExecSystemResult["ErrorNoQueue"] = "ERROR_NO_QUEUE";
    ValidateExecSystemResult["ErrorQueueNotFound"] = "ERROR_QUEUE_NOT_FOUND";
})(ValidateExecSystemResult || (ValidateExecSystemResult = {}));
export var validateExecSystem = function (job, app, systems) {
    var _a, _b;
    var defaultSystem = computeDefaultSystem(app);
    // Check that an exec system can be computed
    if (!job.execSystemId && !(defaultSystem === null || defaultSystem === void 0 ? void 0 : defaultSystem.systemId)) {
        return ValidateExecSystemResult.ErrorNoExecSystem;
    }
    var computedSystem = systems.find(function (system) { var _a; return system.id === ((_a = job.execSystemId) !== null && _a !== void 0 ? _a : defaultSystem === null || defaultSystem === void 0 ? void 0 : defaultSystem.systemId); });
    if (!computedSystem) {
        return ValidateExecSystemResult.ErrorExecSystemNotFound;
    }
    // If the job will be a FORK job, skip queue validation
    var computedJobType = computeDefaultJobType(job, app, systems);
    if (job.jobType !== Apps.JobTypeEnum.Batch &&
        computedJobType.jobType === Apps.JobTypeEnum.Fork) {
        return ValidateExecSystemResult.Complete;
    }
    // If the job will be a BATCH job, make sure that the selected execution system
    // has queues
    if (!((_a = computedSystem.batchLogicalQueues) === null || _a === void 0 ? void 0 : _a.length)) {
        return ValidateExecSystemResult.ErrorExecSystemNoQueues;
    }
    var defaultQueue = computeDefaultQueue(job, app, systems);
    // If the job type will be a BATCH job, ensure that a queue is specified
    // If no queue exists, there must be a fallback to the app or system default
    if (!job.execSystemLogicalQueue && !defaultQueue.queue) {
        return ValidateExecSystemResult.ErrorNoQueue;
    }
    // Check to see that the logical queue selected exists on the selected system
    var selectedSystem = systems.find(function (system) { var _a; return system.id === ((_a = job.execSystemId) !== null && _a !== void 0 ? _a : defaultSystem === null || defaultSystem === void 0 ? void 0 : defaultSystem.systemId); });
    if (!((_b = selectedSystem === null || selectedSystem === void 0 ? void 0 : selectedSystem.batchLogicalQueues) === null || _b === void 0 ? void 0 : _b.some(function (queue) { var _a; return queue.name === ((_a = job.execSystemLogicalQueue) !== null && _a !== void 0 ? _a : defaultQueue.queue); }))) {
        return ValidateExecSystemResult.ErrorQueueNotFound;
    }
    return ValidateExecSystemResult.Complete;
};
