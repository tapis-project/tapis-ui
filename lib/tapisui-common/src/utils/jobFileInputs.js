import { Apps } from '@tapis/tapis-typescript';
export var getIncompleteAppInputs = function (app) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.fileInputs) === null || _b === void 0 ? void 0 : _b.filter(function (fileInput) { return !fileInput.sourceUrl; })) !== null && _c !== void 0 ? _c : []);
};
export var getIncompleteAppInputsOfType = function (app, inputType) {
    return getIncompleteAppInputs(app).filter(function (fileInput) { return fileInput.inputMode === inputType; });
};
export var generateFileInputFromAppInput = function (input) { return ({
    name: input.name,
    sourceUrl: input.sourceUrl,
    targetPath: input.targetPath,
    description: input.description,
    autoMountLocal: input.autoMountLocal,
}); };
export var generateRequiredFileInputsFromApp = function (app) {
    var _a, _b, _c;
    var requiredInputs = (_c = (_b = (_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.fileInputs) === null || _b === void 0 ? void 0 : _b.filter(function (fileInput) { return fileInput.inputMode === Apps.FileInputModeEnum.Required; })) !== null && _c !== void 0 ? _c : [];
    var fileInputs = requiredInputs.map(function (appFileInput) {
        return generateFileInputFromAppInput(appFileInput);
    });
    return fileInputs;
};
export var getAppInputsIncludedByDefault = function (appFileInputs, jobFileInputs) {
    return appFileInputs.filter(function (appFileInput) {
        var includedInJob = jobFileInputs.some(function (jobFileInput) { return jobFileInput.name === appFileInput.name; });
        return (appFileInput.inputMode === Apps.FileInputModeEnum.Required &&
            !!appFileInput.sourceUrl &&
            !includedInJob);
    });
};
/**
 * @param appFileInputs
 * @param jobFileInputs
 * @returns An array of jobFileInputs that are underspecified
 */
export var getIncompleteJobInputs = function (appFileInputs, jobFileInputs) {
    // Get job inputs that are REQUIRED in the app but do not specify sourceUrl
    var incompleteRequiredAppInputs = appFileInputs.filter(function (appFileInput) {
        return appFileInput.inputMode === Apps.FileInputModeEnum.Required &&
            !appFileInput.sourceUrl;
    });
    var incompleteRequiredJobInputs = jobFileInputs.filter(function (jobFileInput) {
        // Is this jobFileInput part of required app inputs?
        var requiredInApp = incompleteRequiredAppInputs.some(function (appInput) { return appInput.name === jobFileInput.name; });
        if (requiredInApp) {
            return !jobFileInput.sourceUrl;
        }
        else {
            return false;
        }
    });
    // Get job inputs that are OPTIONAL in the app but do not specify sourceUrl
    var incompleteOptionalAppInputs = appFileInputs.filter(function (appFileInput) {
        return appFileInput.inputMode === Apps.FileInputModeEnum.Optional &&
            !appFileInput.sourceUrl;
    });
    var incompleteOptionalJobInputs = jobFileInputs.filter(function (jobFileInput) {
        // Is this jobFileInput part of optional app inputs?
        var optionalInApp = incompleteOptionalAppInputs.some(function (appInput) { return appInput.name === jobFileInput.name; });
        if (optionalInApp) {
            return !jobFileInput.sourceUrl;
        }
        else {
            return false;
        }
    });
    // Get job inputs that are neither OPTIONAL or REQUIRED, but are incomplete
    var incompleteUserInputs = jobFileInputs.filter(function (jobFileInput) {
        // Is this jobFileInput neither OPTIONAL or REQUIRED?
        var userInput = !incompleteRequiredAppInputs.some(function (appInput) { return appInput.name === jobFileInput.name; }) &&
            !incompleteOptionalAppInputs.some(function (appInput) { return appInput.name === jobFileInput.name; });
        if (userInput) {
            return !jobFileInput.sourceUrl || !jobFileInput.targetPath;
        }
        else {
            return false;
        }
    });
    return incompleteRequiredJobInputs
        .concat(incompleteOptionalJobInputs)
        .concat(incompleteUserInputs);
};
export var fileInputsComplete = function (app, fileInputs) {
    var _a, _b, _c, _d, _e;
    // Check to make sure job has filled in all REQUIRED app inputs that are missing sourceUrl
    var incompleteRequiredInputs = getIncompleteAppInputsOfType(app, Apps.FileInputModeEnum.Required);
    var hasIncompleteRequiredInput = incompleteRequiredInputs.some(function (requiredInput) {
        // Find JobFileInput with name matching the required input
        var jobFileInput = fileInputs.find(function (jobFileInput) { return jobFileInput.name === requiredInput.name; });
        if (!jobFileInput) {
            // Matching jobFileInput not found, therefore there is an incomplete required input
            return true;
        }
        else {
            // Verify that this input has a sourceUrl specified
            return !jobFileInput.sourceUrl;
        }
    });
    if (hasIncompleteRequiredInput) {
        return false;
    }
    // Check to see if an OPTIONAL input was included but not fully specified
    var optionalAppInputs = getIncompleteAppInputs(app).filter(function (appFileInput) { return !appFileInput.sourceUrl; });
    // get any optional app file input that was included in the job.
    var optionalJobInputs = (_a = fileInputs.filter(function (jobFileInput) {
        return optionalAppInputs.some(function (optionalAppInput) { return jobFileInput.name === optionalAppInput.name; });
    })) !== null && _a !== void 0 ? _a : [];
    var hasIncompleteOptionalInput = !!optionalJobInputs.length &&
        optionalJobInputs.some(function (jobInput) { return !jobInput.sourceUrl; });
    if (hasIncompleteOptionalInput) {
        return false;
    }
    // Check to see if any app inputs that did not exist
    var namedInputs = (_d = (_c = (_b = app.jobAttributes) === null || _b === void 0 ? void 0 : _b.fileInputs) === null || _c === void 0 ? void 0 : _c.map(function (input) { return input.name; })) !== null && _d !== void 0 ? _d : [];
    var otherInputs = (_e = fileInputs.filter(function (jobInput) { return !namedInputs.some(function (name) { return name === jobInput.name; }); })) !== null && _e !== void 0 ? _e : [];
    if (otherInputs.some(function (otherInput) { return !otherInput.sourceUrl || !otherInput.targetPath; })) {
        return false;
    }
    return true;
};
