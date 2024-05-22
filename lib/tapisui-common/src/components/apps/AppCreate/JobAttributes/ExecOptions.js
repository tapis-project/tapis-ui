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
import { FormikInput, FormikCheck, FormikSelect, FormikTapisFile, } from 'ui-formik/FieldWrapperFormik';
import { useFormikContext } from 'formik';
import { Collapse } from 'ui';
import fieldArrayStyles from './FieldArray.module.scss';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { ListTypeEnum } from '@tapis/tapis-typescript-systems';
import { JobTypeEnum } from '@tapis/tapis-typescript-apps';
var ExecSystemDirs = function () {
    var values = useFormikContext().values;
    var execSystemId = useMemo(function () { var _a; return (_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.execSystemId; }, [values]);
    return (_jsxs(Collapse, __assign({ title: "Execution System Directories" }, { children: [_jsx(FormikTapisFile, { allowSystemChange: false, systemId: execSystemId, disabled: !execSystemId, name: "jobAttributes.execSystemExecDir", label: "Execution System Execution Directory", description: "The directory on the selected selection system for execution files", required: false, files: false, dirs: true }), _jsx(FormikTapisFile, { allowSystemChange: false, systemId: execSystemId, disabled: !execSystemId, name: "jobAttributes.execSystemInputDir", label: "Execution System Input Directory", description: "The directory on the selected selection system for input files", required: false, files: false, dirs: true }), _jsx(FormikTapisFile, { allowSystemChange: false, systemId: execSystemId, disabled: !execSystemId, name: "jobAttributes.execSystemOutputDir", label: "Execution System Output Directory", description: "The directory on the selected selection system for output files", required: false, files: false, dirs: true })] })));
};
var ExecSystemQueueOptions = function () {
    var errors = useFormikContext().errors;
    var queueErrors = errors;
    var hasErrors = queueErrors.coresPerNode ||
        queueErrors.maxMinutes ||
        queueErrors.memoryMB ||
        queueErrors.nodeCount;
    return (_jsxs(Collapse, __assign({ title: "Queue Parameters", isCollapsable: !hasErrors }, { children: [_jsx(FormikInput, { name: "jobAttributes.nodeCount", label: "Node Count", description: "The number of nodes to use for this job", required: false, type: "number" }), _jsx(FormikInput, { name: "jobAttributes.coresPerNode", label: "Cores Per Node", description: "The number of cores to use per node", required: false, type: "number" }), _jsx(FormikInput, { name: "jobAttributes.memoryMB", label: "Memory, in Megabytes", description: "The amount of memory to use per node in megabytes", required: false, type: "number" }), _jsx(FormikInput, { name: "jobAttributes.maxMinutes", label: "Maximum Minutes", description: "The maximum amount of time in minutes for this job", required: false, type: "number" })] })));
};
var MPIOptions = function () {
    var values = useFormikContext().values;
    var isMpi = useMemo(function () { var _a; return (_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.isMpi; }, [values]);
    return (_jsxs(Collapse, __assign({ title: "MPI Options" }, { children: [_jsx(FormikCheck, { name: "jobAttributes.isMpi", label: "Is MPI?", description: "If checked, this job will be run as an MPI job", required: false }), _jsx(FormikInput, { name: "jobAttributes.mpiCmd", label: "MPI Command", description: "If this is an MPI job, you may specify the MPI command", required: false, disabled: !isMpi }), _jsx(FormikInput, { name: "jobAttributes.cmdPrefix", label: "Command Prefix", description: "If this is not an MPI job, you may specify a command prefix", required: false, disabled: !!isMpi })] })));
};
export var ExecOptions = function () {
    var _a, _b;
    var _c = useFormikContext(), values = _c.values, setFieldValue = _c.setFieldValue;
    var isBatch = useMemo(function () { return (values === null || values === void 0 ? void 0 : values.jobType) === JobTypeEnum.Batch; }, [values === null || values === void 0 ? void 0 : values.jobType]);
    var _d = Hooks.useList({
        listType: ListTypeEnum.All,
        select: 'allAttributes',
    }), data = _d.data, isLoading = _d.isLoading, isError = _d.isError;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    var _e = useState(null), selectedSystem = _e[0], setSelectedSystem = _e[1];
    var _f = useState([]), queues = _f[0], setQueues = _f[1];
    var getLogicalQueues = function (system) { var _a; return (_a = system === null || system === void 0 ? void 0 : system.batchLogicalQueues) !== null && _a !== void 0 ? _a : []; };
    useEffect(function () {
        var _a, _b;
        var systemId = (_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.execSystemId;
        var system = ((_b = data === null || data === void 0 ? void 0 : data.result) === null || _b === void 0 ? void 0 : _b.find(function (sys) { return sys.id === systemId; })) || null;
        setSelectedSystem(system);
        if (system) {
            var newQueues = getLogicalQueues(system);
            setQueues(newQueues);
        }
        else {
            setQueues([]);
        }
        if (!isBatch) {
            setFieldValue('jobAttributes.execSystemLogicalQueue', undefined);
        }
    }, [
        data === null || data === void 0 ? void 0 : data.result,
        (_a = values.jobAttributes) === null || _a === void 0 ? void 0 : _a.execSystemId,
        setFieldValue,
        isBatch,
    ]);
    if (isLoading)
        return _jsx("div", { children: "Loading systems..." });
    if (isError)
        return _jsx("div", { children: "Error fetching systems." });
    return (_jsxs("div", { children: [_jsxs("div", __assign({ className: fieldArrayStyles.item }, { children: [_jsxs(FormikSelect, __assign({ name: "jobAttributes.execSystemId", label: "Execution System", required: true, description: '' }, { children: [_jsx("option", __assign({ value: "" }, { children: "Please select a system" })), (_b = data === null || data === void 0 ? void 0 : data.result) === null || _b === void 0 ? void 0 : _b.map(function (system) { return (_jsx("option", __assign({ value: system.id }, { children: system.id }), system.id)); })] })), _jsxs(FormikSelect, __assign({ name: "jobType", label: "Job Type", required: true, description: '' }, { children: [_jsx("option", __assign({ value: "" }, { children: "Please select a job type" })), _jsx("option", __assign({ value: JobTypeEnum.Batch }, { children: "Batch" })), _jsx("option", __assign({ value: JobTypeEnum.Fork }, { children: "Fork" }))] })), isBatch && (_jsxs(FormikSelect, __assign({ name: "jobAttributes.execSystemLogicalQueue", label: "Batch Logical Queue", required: false, description: '' }, { children: [_jsx("option", __assign({ value: "" }, { children: "Please select a queue" })), queues.map(function (queue) { return (_jsx("option", __assign({ value: queue.name }, { children: queue.name }), queue.name)); })] })))] })), _jsx(ExecSystemDirs, {}), isBatch && _jsx(ExecSystemQueueOptions, {}), _jsx(MPIOptions, {})] }));
};
export default _jsx(ExecOptions, {});
