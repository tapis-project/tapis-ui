import { Apps } from '@tapis/tapis-typescript';
export var generateJobArg = function (argSpec) {
    return {
        arg: argSpec.arg,
        description: argSpec.description,
        include: argSpec.inputMode !== Apps.ArgInputModeEnum.IncludeOnDemand,
        name: argSpec.name,
    };
};
export var getArgMode = function (name, argSpecs) {
    var spec = argSpecs.find(function (argSpec) { return argSpec.name === name; });
    if (!spec) {
        return undefined;
    }
    return spec.inputMode;
};
export var generateJobArgsFromSpec = function (argSpecs) {
    return argSpecs.map(function (argSpec) { return generateJobArg(argSpec); });
};
