var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useEffect, useState } from 'react';
import { Apps } from '@tapis/tapis-typescript';
import { useJobLauncher, StepSummaryField } from '../components';
import { FormikInput, FormikCheck, FormikSelect, FormikTapisFile, } from 'ui-formik/FieldWrapperFormik';
import { useFormikContext } from 'formik';
import { Collapse } from 'ui';
import { computeDefaultQueue, computeDefaultSystem, computeDefaultJobType, validateExecSystem, ValidateExecSystemResult, } from 'utils/jobExecSystem';
import { capitalize } from './utils';
import * as Yup from 'yup';
import fieldArrayStyles from '../FieldArray.module.scss';
var getLogicalQueues = function (system) { var _a; return (_a = system === null || system === void 0 ? void 0 : system.batchLogicalQueues) !== null && _a !== void 0 ? _a : []; };
var getSystem = function (systems, systemId) {
    return !!systemId ? systems.find(function (system) { return system.id === systemId; }) : undefined;
};
var SystemSelector = function () {
    var _a = useFormikContext(), setFieldValue = _a.setFieldValue, values = _a.values;
    var _b = useJobLauncher(), job = _b.job, app = _b.app, systems = _b.systems;
    var _c = useState(getLogicalQueues(getSystem(systems, job.execSystemId))), queues = _c[0], setQueues = _c[1];
    var _d = useState(systems), selectableSystems = _d[0], setSelectableSystems = _d[1];
    var _e = useMemo(function () {
        // Compute labels for when undefined values are selected for systems, queues or jobType
        var _a = computeDefaultSystem(app), systemSource = _a.source, systemId = _a.systemId;
        var defaultSystemLabel = systemSource
            ? "App default (".concat(systemId, ")")
            : 'Please select a system';
        var _b = computeDefaultQueue(values, app, systems), queueSource = _b.source, queue = _b.queue;
        var defaultQueueLabel = queueSource
            ? "".concat(capitalize(queueSource), " default (").concat(queue, ")")
            : 'Please select a queue';
        var _c = computeDefaultJobType(values, app, systems), jobTypeSource = _c.source, jobType = _c.jobType;
        var defaultJobTypeLabel = "".concat(capitalize(jobTypeSource), " default (").concat(jobType, ")");
        var isBatch = (values === null || values === void 0 ? void 0 : values.jobType) === Apps.JobTypeEnum.Batch ||
            jobType === Apps.JobTypeEnum.Batch;
        var selectedSystem = values === null || values === void 0 ? void 0 : values.execSystemId;
        return {
            defaultSystemLabel: defaultSystemLabel,
            defaultQueueLabel: defaultQueueLabel,
            defaultJobTypeLabel: defaultJobTypeLabel,
            isBatch: isBatch,
            selectedSystem: selectedSystem,
        };
    }, [values, app, systems]), defaultSystemLabel = _e.defaultSystemLabel, defaultQueueLabel = _e.defaultQueueLabel, defaultJobTypeLabel = _e.defaultJobTypeLabel, isBatch = _e.isBatch, selectedSystem = _e.selectedSystem;
    useEffect(function () {
        var _a;
        // Handle changes to selectable execSystems and execSystemLogicalQueues
        var validSystems = isBatch
            ? systems.filter(function (system) { var _a; return !!((_a = system.batchLogicalQueues) === null || _a === void 0 ? void 0 : _a.length); })
            : systems;
        setSelectableSystems(validSystems);
        if (!validSystems.some(function (system) { return system.id === selectedSystem; })) {
            // If current system is invalid (like a system with no logical queues for a batch job)
            // then use the application default
            setFieldValue('execSystemId', undefined);
        }
        if (!isBatch) {
            setFieldValue('execSystemLogicalQueue', undefined);
        }
        var system = getSystem(validSystems, selectedSystem !== null && selectedSystem !== void 0 ? selectedSystem : (_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.execSystemId);
        var queues = getLogicalQueues(system);
        setQueues(queues);
        setFieldValue('execSystemLogicalQueue', undefined);
    }, [
        systems,
        isBatch,
        app,
        selectedSystem,
        setFieldValue,
        setSelectableSystems,
        setQueues,
    ]);
    return (_jsxs("div", __assign({ className: fieldArrayStyles.item }, { children: [_jsxs(FormikSelect, __assign({ name: "execSystemId", description: "The execution system for this job", label: "Execution System", required: true, "data-testid": "execSystemId" }, { children: [_jsx("option", { value: undefined, label: defaultSystemLabel }), selectableSystems.map(function (system) { return (_jsx("option", { value: system.id, label: system.id, "data-testid": "execSystemId-".concat(system.id) }, "execsystem-select-".concat(system.id))); })] })), _jsxs(FormikSelect, __assign({ name: "jobType", label: "Job Type", description: "Jobs can either be Batch or Fork", required: true, "data-testid": "jobType" }, { children: [_jsx("option", { value: undefined, label: defaultJobTypeLabel }), _jsx("option", { value: Apps.JobTypeEnum.Batch, label: "Batch" }), _jsx("option", { value: Apps.JobTypeEnum.Fork, label: "Fork" })] })), isBatch && (_jsxs(FormikSelect, __assign({ name: "execSystemLogicalQueue", description: "The batch queue on this execution system", label: "Batch Logical Queue", required: false, disabled: queues.length === 0, "data-testid": "execSystemLogicalQueue" }, { children: [_jsx("option", { value: undefined, label: defaultQueueLabel }), queues.map(function (queue) { return (_jsx("option", { value: queue.name, label: queue.name }, "queue-select-".concat(queue.name))); })] })))] })));
};
var ExecSystemDirs = function () {
    var values = useFormikContext().values;
    var execSystemId = useMemo(function () { return values.execSystemId; }, [values]);
    return (_jsxs(Collapse, __assign({ title: "Execution System Directories" }, { children: [_jsx(FormikTapisFile, { allowSystemChange: false, systemId: execSystemId, disabled: !execSystemId, name: "execSystemExecDir", label: "Execution System Execution Directory", description: "The directory on the selected selection system for execution files", required: false, files: false, dirs: true }), _jsx(FormikTapisFile, { allowSystemChange: false, systemId: execSystemId, disabled: !execSystemId, name: "execSystemInputDir", label: "Execution System Input Directory", description: "The directory on the selected selection system for input files", required: false, files: false, dirs: true }), _jsx(FormikTapisFile, { allowSystemChange: false, systemId: execSystemId, disabled: !execSystemId, name: "execSystemOutputDir", label: "Execution System Output Directory", description: "The directory on the selected selection system for output files", required: false, files: false, dirs: true })] })));
};
var ExecSystemQueueOptions = function () {
    var errors = useFormikContext().errors;
    var queueErrors = errors;
    var hasErrors = queueErrors.coresPerNode ||
        queueErrors.maxMinutes ||
        queueErrors.memoryMB ||
        queueErrors.nodeCount;
    return (_jsxs(Collapse, __assign({ title: "Queue Parameters", isCollapsable: !hasErrors }, { children: [_jsx(FormikInput, { name: "nodeCount", label: "Node Count", description: "The number of nodes to use for this job", required: false, type: "number" }), _jsx(FormikInput, { name: "coresPerNode", label: "Cores Per Node", description: "The number of cores to use per node", required: false, type: "number" }), _jsx(FormikInput, { name: "memoryMB", label: "Memory, in Megabytes", description: "The amount of memory to use per node in megabytes", required: false, type: "number" }), _jsx(FormikInput, { name: "maxMinutes", label: "Maximum Minutes", description: "The maximum amount of time in minutes for this job", required: false, type: "number" })] })));
};
var MPIOptions = function () {
    var values = useFormikContext().values;
    var isMpi = useMemo(function () { return values.isMpi; }, [values]);
    return (_jsxs(Collapse, __assign({ title: "MPI Options" }, { children: [_jsx(FormikCheck, { name: "isMpi", label: "Is MPI?", description: "If checked, this job will be run as an MPI job", required: false }), _jsx(FormikInput, { name: "mpiCmd", label: "MPI Command", description: "If this is an MPI job, you may specify the MPI command", required: false, disabled: !isMpi }), _jsx(FormikInput, { name: "cmdPrefix", label: "Command Prefix", description: "If this is not an MPI job, you may specify a command prefix", required: false, disabled: !!isMpi })] })));
};
export var ExecOptions = function () {
    var values = useFormikContext().values;
    var isBatch = useMemo(function () { return (values === null || values === void 0 ? void 0 : values.jobType) === Apps.JobTypeEnum.Batch; }, [values]);
    return (_jsxs("div", { children: [_jsx("h2", { children: "Execution Options" }), _jsx(SystemSelector, {}), isBatch && _jsx(ExecSystemQueueOptions, {}), _jsx(MPIOptions, {}), _jsx(ExecSystemDirs, {})] }));
};
export var ExecOptionsSummary = function () {
    var _a = useJobLauncher(), job = _a.job, app = _a.app, systems = _a.systems;
    var isMpi = job.isMpi, mpiCmd = job.mpiCmd, cmdPrefix = job.cmdPrefix;
    var _b = useMemo(function () {
        var _a, _b, _c;
        var execSystemLogicalQueue = job.execSystemLogicalQueue, execSystemId = job.execSystemId, jobType = job.jobType;
        var computedSystem = execSystemId !== null && execSystemId !== void 0 ? execSystemId : (_a = computeDefaultSystem(app)) === null || _a === void 0 ? void 0 : _a.systemId;
        var computedQueue = execSystemLogicalQueue !== null && execSystemLogicalQueue !== void 0 ? execSystemLogicalQueue : (_b = computeDefaultQueue(job, app, systems)) === null || _b === void 0 ? void 0 : _b.queue;
        var computedJobType = jobType !== null && jobType !== void 0 ? jobType : (_c = computeDefaultJobType(job, app, systems)) === null || _c === void 0 ? void 0 : _c.jobType;
        return {
            computedSystem: computedSystem,
            computedQueue: computedQueue,
            computedJobType: computedJobType,
        };
    }, [job, app, systems]), computedSystem = _b.computedSystem, computedQueue = _b.computedQueue, computedJobType = _b.computedJobType;
    return (_jsxs("div", { children: [_jsx(StepSummaryField, { field: computedSystem, error: "An execution system is required" }, "execution-system-id-summary"), computedJobType === Apps.JobTypeEnum.Batch && (_jsx(StepSummaryField, { field: computedQueue, error: "A logical queue is required" }, "execution-system-queue-summary")), _jsx(StepSummaryField, { field: "".concat(isMpi
                    ? "MPI Command: ".concat(mpiCmd !== null && mpiCmd !== void 0 ? mpiCmd : 'system default')
                    : "Command Prefix: ".concat(cmdPrefix !== null && cmdPrefix !== void 0 ? cmdPrefix : 'system default')) }, "execution-mpi-summary")] }));
};
var validationSchema = Yup.object({
    execSystemId: Yup.string(),
    execSystemLogicalQueue: Yup.string(),
    execSystemExecDir: Yup.string(),
    execSystemInputDir: Yup.string(),
    execSystemOutputDir: Yup.string(),
    jobType: Yup.string(),
    nodeCount: Yup.number(),
    coresPerNode: Yup.number(),
    memoryMB: Yup.number(),
    maxMinutes: Yup.number(),
    isMpi: Yup.boolean(),
    mpiCmd: Yup.string(),
    cmdPrefix: Yup.string(),
});
var validateThunk = function (_a) {
    var app = _a.app, systems = _a.systems;
    return function (values) {
        var _a, _b, _c;
        var execSystemId = values.execSystemId, execSystemLogicalQueue = values.execSystemLogicalQueue, nodeCount = values.nodeCount, coresPerNode = values.coresPerNode, memoryMB = values.memoryMB, maxMinutes = values.maxMinutes, jobType = values.jobType;
        var errors = {};
        var validation = validateExecSystem(values, app, systems);
        if (validation === ValidateExecSystemResult.ErrorNoExecSystem) {
            errors.execSystemId = "This app does not have a default execution system. You must specify one for this job";
        }
        if (validation === ValidateExecSystemResult.ErrorExecSystemNotFound) {
            errors.execSystemId = "The specified exec system cannot be found";
        }
        if (validation === ValidateExecSystemResult.ErrorExecSystemNoQueues) {
            errors.execSystemId = "The specified exec system is not capable of batch jobs";
        }
        if (validation === ValidateExecSystemResult.ErrorNoQueue) {
            errors.execSystemLogicalQueue = "Neither the application nor the selected system specifies a default queue. You must specify one for this job";
        }
        if (validation === ValidateExecSystemResult.ErrorQueueNotFound) {
            errors.execSystemLogicalQueue = "The specified queue cannot be found on the selected system";
        }
        // Skip queue validation if the job is a FORK job
        if (jobType === Apps.JobTypeEnum.Fork ||
            ((_a = computeDefaultJobType(values, app, systems)) === null || _a === void 0 ? void 0 : _a.jobType) === Apps.JobTypeEnum.Fork) {
            return errors;
        }
        var computedExecSystem = computeDefaultSystem(app);
        var computedLogicalQueue = computeDefaultQueue(values, app, systems);
        var selectedSystem = systems.find(function (system) { return system.id === (execSystemId !== null && execSystemId !== void 0 ? execSystemId : computedExecSystem.systemId); });
        if (!((_b = selectedSystem === null || selectedSystem === void 0 ? void 0 : selectedSystem.batchLogicalQueues) === null || _b === void 0 ? void 0 : _b.length)) {
            errors.execSystemLogicalQueue = "The selected system does not have any batch logical queues";
            return errors;
        }
        var queue = (_c = selectedSystem === null || selectedSystem === void 0 ? void 0 : selectedSystem.batchLogicalQueues) === null || _c === void 0 ? void 0 : _c.find(function (queue) {
            return queue.name === (execSystemLogicalQueue !== null && execSystemLogicalQueue !== void 0 ? execSystemLogicalQueue : computedLogicalQueue === null || computedLogicalQueue === void 0 ? void 0 : computedLogicalQueue.queue);
        });
        if (!queue) {
            errors.execSystemLogicalQueue = "The specified queue does not exist on the selected execution system";
            return errors;
        }
        if (!!nodeCount) {
            if ((queue === null || queue === void 0 ? void 0 : queue.maxNodeCount) && nodeCount > (queue === null || queue === void 0 ? void 0 : queue.maxNodeCount)) {
                errors.nodeCount = "The maximum number of nodes for this queue is ".concat(queue === null || queue === void 0 ? void 0 : queue.maxNodeCount);
            }
            if ((queue === null || queue === void 0 ? void 0 : queue.minNodeCount) && nodeCount < (queue === null || queue === void 0 ? void 0 : queue.minNodeCount)) {
                errors.nodeCount = "The minimum number of nodes for this queue is ".concat(queue === null || queue === void 0 ? void 0 : queue.minNodeCount);
            }
        }
        if (!!coresPerNode) {
            if ((queue === null || queue === void 0 ? void 0 : queue.maxCoresPerNode) && coresPerNode > (queue === null || queue === void 0 ? void 0 : queue.maxCoresPerNode)) {
                errors.coresPerNode = "The maximum number of cores per node for this queue is ".concat(queue === null || queue === void 0 ? void 0 : queue.maxCoresPerNode);
            }
            if ((queue === null || queue === void 0 ? void 0 : queue.minCoresPerNode) && coresPerNode < (queue === null || queue === void 0 ? void 0 : queue.minCoresPerNode)) {
                errors.coresPerNode = "The minimum number of cores per node for this queue is ".concat(queue === null || queue === void 0 ? void 0 : queue.minCoresPerNode);
            }
        }
        if (!!memoryMB) {
            if ((queue === null || queue === void 0 ? void 0 : queue.maxMemoryMB) && memoryMB > (queue === null || queue === void 0 ? void 0 : queue.maxMemoryMB)) {
                errors.memoryMB = "The maximum amount of memory for this queue is ".concat(queue === null || queue === void 0 ? void 0 : queue.maxMemoryMB, " megabytes");
            }
            if ((queue === null || queue === void 0 ? void 0 : queue.minMemoryMB) && memoryMB < (queue === null || queue === void 0 ? void 0 : queue.minMemoryMB)) {
                errors.memoryMB = "The minimum amount of memory for this queue is ".concat(queue === null || queue === void 0 ? void 0 : queue.minMemoryMB, " megabytes");
            }
        }
        if (!!maxMinutes) {
            if ((queue === null || queue === void 0 ? void 0 : queue.maxMinutes) && maxMinutes > (queue === null || queue === void 0 ? void 0 : queue.maxMinutes)) {
                errors.maxMinutes = "The maximum number of minutes for a job on this queue is ".concat(queue === null || queue === void 0 ? void 0 : queue.maxMinutes);
            }
            if ((queue === null || queue === void 0 ? void 0 : queue.minMinutes) && maxMinutes < (queue === null || queue === void 0 ? void 0 : queue.minMinutes)) {
                errors.maxMinutes = "The minimum number of minutes for a job on this queue is ".concat(queue === null || queue === void 0 ? void 0 : queue.minMinutes);
            }
        }
        return errors;
    };
};
var generateInitialValues = function (_a) {
    var job = _a.job, app = _a.app, systems = _a.systems;
    return ({
        execSystemId: job.execSystemId,
        execSystemLogicalQueue: job.execSystemLogicalQueue,
        jobType: job.jobType,
        execSystemExecDir: job.execSystemExecDir,
        execSystemInputDir: job.execSystemInputDir,
        execSystemOutputDir: job.execSystemOutputDir,
        nodeCount: job.nodeCount,
        coresPerNode: job.coresPerNode,
        memoryMB: job.memoryMB,
        maxMinutes: job.maxMinutes,
        isMpi: job.isMpi,
        mpiCmd: job.mpiCmd,
        cmdPrefix: job.cmdPrefix,
    });
};
var step = {
    id: 'execution',
    name: 'Execution Options',
    render: _jsx(ExecOptions, {}),
    summary: _jsx(ExecOptionsSummary, {}),
    generateInitialValues: generateInitialValues,
    validateThunk: validateThunk,
    validationSchema: validationSchema,
};
export default step;
