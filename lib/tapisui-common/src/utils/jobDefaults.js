import { generateRequiredFileInputsFromApp } from 'utils/jobFileInputs';
import { generateRequiredFileInputArraysFromApp } from 'utils/jobFileInputArrays';
import { generateJobArgsFromSpec } from 'utils/jobArgs';
var generateJobDefaults = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    var app = _a.app, systems = _a.systems;
    if (!app) {
        return {};
    }
    var defaultValues = {
        name: "".concat(app.id, "-").concat(app.version),
        description: app.description,
        appId: app.id,
        appVersion: app.version,
        archiveOnAppError: (_c = (_b = app.jobAttributes) === null || _b === void 0 ? void 0 : _b.archiveOnAppError) !== null && _c !== void 0 ? _c : true,
        archiveSystemId: (_d = app.jobAttributes) === null || _d === void 0 ? void 0 : _d.archiveSystemId,
        archiveSystemDir: (_e = app.jobAttributes) === null || _e === void 0 ? void 0 : _e.archiveSystemDir,
        nodeCount: (_f = app.jobAttributes) === null || _f === void 0 ? void 0 : _f.nodeCount,
        coresPerNode: (_g = app.jobAttributes) === null || _g === void 0 ? void 0 : _g.coresPerNode,
        jobType: app.jobType,
        memoryMB: (_h = app.jobAttributes) === null || _h === void 0 ? void 0 : _h.memoryMB,
        maxMinutes: (_j = app.jobAttributes) === null || _j === void 0 ? void 0 : _j.maxMinutes,
        isMpi: (_k = app.jobAttributes) === null || _k === void 0 ? void 0 : _k.isMpi,
        mpiCmd: (_l = app.jobAttributes) === null || _l === void 0 ? void 0 : _l.mpiCmd,
        cmdPrefix: (_m = app.jobAttributes) === null || _m === void 0 ? void 0 : _m.cmdPrefix,
        fileInputs: generateRequiredFileInputsFromApp(app),
        fileInputArrays: generateRequiredFileInputArraysFromApp(app),
        parameterSet: {
            appArgs: generateJobArgsFromSpec((_q = (_p = (_o = app.jobAttributes) === null || _o === void 0 ? void 0 : _o.parameterSet) === null || _p === void 0 ? void 0 : _p.appArgs) !== null && _q !== void 0 ? _q : []),
            containerArgs: generateJobArgsFromSpec((_t = (_s = (_r = app.jobAttributes) === null || _r === void 0 ? void 0 : _r.parameterSet) === null || _s === void 0 ? void 0 : _s.containerArgs) !== null && _t !== void 0 ? _t : []),
            schedulerOptions: generateJobArgsFromSpec((_w = (_v = (_u = app.jobAttributes) === null || _u === void 0 ? void 0 : _u.parameterSet) === null || _v === void 0 ? void 0 : _v.schedulerOptions) !== null && _w !== void 0 ? _w : []),
            archiveFilter: (_y = (_x = app.jobAttributes) === null || _x === void 0 ? void 0 : _x.parameterSet) === null || _y === void 0 ? void 0 : _y.archiveFilter,
            envVariables: (_0 = (_z = app.jobAttributes) === null || _z === void 0 ? void 0 : _z.parameterSet) === null || _0 === void 0 ? void 0 : _0.envVariables,
        },
    };
    return defaultValues;
};
export default generateJobDefaults;
