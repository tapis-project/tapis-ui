import { Apps } from '@tapis/tapis-typescript';
export var getIncompleteAppInputArrays = function (app) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.fileInputArrays) === null || _b === void 0 ? void 0 : _b.filter(function (fileInput) { return !fileInput.sourceUrls; })) !== null && _c !== void 0 ? _c : []);
};
export var getIncompleteAppInputArraysOfType = function (app, inputType) {
    return getIncompleteAppInputArrays(app).filter(function (fileInput) { return fileInput.inputMode === inputType; });
};
export var generateFileInputArrayFromAppInput = function (input) {
    var _a;
    return ({
        name: input.name,
        sourceUrls: (_a = input.sourceUrls) !== null && _a !== void 0 ? _a : [],
        targetDir: input.targetDir,
        description: input.description,
    });
};
export var generateRequiredFileInputArraysFromApp = function (app) {
    var _a, _b, _c;
    var requiredInputArrays = (_c = (_b = (_a = app.jobAttributes) === null || _a === void 0 ? void 0 : _a.fileInputArrays) === null || _b === void 0 ? void 0 : _b.filter(function (fileInput) { return fileInput.inputMode === Apps.FileInputModeEnum.Required; })) !== null && _c !== void 0 ? _c : [];
    var fileInputs = requiredInputArrays.map(function (appFileInputArray) {
        return generateFileInputArrayFromAppInput(appFileInputArray);
    });
    return fileInputs;
};
export var getAppInputArraysIncludedByDefault = function (appFileInputArrays, jobFileInputArrays) {
    return appFileInputArrays.filter(function (appFileInputArray) {
        var includedInJob = jobFileInputArrays.some(function (jobFileInputArray) { return jobFileInputArray.name === appFileInputArray.name; });
        return (appFileInputArray.inputMode === Apps.FileInputModeEnum.Required &&
            !!appFileInputArray.sourceUrls &&
            !includedInJob);
    });
};
/**
 * @param appFileInputsArrays
 * @param jobFileInputsArrays
 * @returns An array of JobFileInputArrays that are underspecified
 */
export var getIncompleteJobInputArrays = function (appFileInputArrays, jobFileInputArrays) {
    // Get job input arrays that are REQUIRED in the app but do not specify sourceUrl
    var incompleteRequiredAppInputArrays = appFileInputArrays.filter(function (appFileInputArray) {
        return appFileInputArray.inputMode === Apps.FileInputModeEnum.Required &&
            !appFileInputArray.sourceUrls;
    });
    var incompleteRequiredJobInputArrays = jobFileInputArrays.filter(function (jobFileInputArray) {
        // Is this jobFileInputArray part of required app input arrays?
        var requiredInApp = incompleteRequiredAppInputArrays.some(function (appInputArray) { return appInputArray.name === jobFileInputArray.name; });
        if (requiredInApp) {
            return (!jobFileInputArray.sourceUrls || !jobFileInputArray.sourceUrls.length);
        }
        else {
            return false;
        }
    });
    // Get job input arrays that are OPTIONAL in the app but do not specify sourceUrl
    var incompleteOptionalAppInputArrays = appFileInputArrays.filter(function (appFileInputArray) {
        return appFileInputArray.inputMode === Apps.FileInputModeEnum.Optional &&
            !appFileInputArray.sourceUrls;
    });
    var incompleteOptionalJobInputArrays = jobFileInputArrays.filter(function (jobFileInputArray) {
        // Is this jobFileInputArray part of optional app input arrays?
        var optionalInApp = incompleteOptionalAppInputArrays.some(function (appInputArray) { return appInputArray.name === jobFileInputArray.name; });
        if (optionalInApp) {
            return (!jobFileInputArray.sourceUrls || !jobFileInputArray.sourceUrls.length);
        }
        else {
            return false;
        }
    });
    // Get job input arrays that are neither OPTIONAL or REQUIRED, but are incomplete
    var incompleteUserInputArrays = jobFileInputArrays.filter(function (jobFileInputArray) {
        // Is this jobFileInputArray neither OPTIONAL or REQUIRED?
        var userInput = !incompleteRequiredAppInputArrays.some(function (appInputArray) { return appInputArray.name === jobFileInputArray.name; }) &&
            !incompleteOptionalAppInputArrays.some(function (appInputArray) { return appInputArray.name === jobFileInputArray.name; });
        if (userInput) {
            return (!jobFileInputArray.sourceUrls ||
                !jobFileInputArray.sourceUrls.length ||
                !jobFileInputArray.targetDir);
        }
        else {
            return false;
        }
    });
    return incompleteRequiredJobInputArrays
        .concat(incompleteOptionalJobInputArrays)
        .concat(incompleteUserInputArrays);
};
export var fileInputArraysComplete = function (app, fileInputArrays) {
    var _a, _b, _c, _d, _e;
    // Check to make sure job has filled in all REQUIRED app inputs that are missing sourceUrl
    var incompleteRequiredInputs = getIncompleteAppInputArraysOfType(app, Apps.FileInputModeEnum.Required);
    var hasIncompleteRequiredInput = incompleteRequiredInputs.some(function (requiredInputArray) {
        // Find JobFileInputArray with name matching the required input
        var jobFileInputArray = fileInputArrays.find(function (jobFileInputArray) {
            return jobFileInputArray.name === requiredInputArray.name;
        });
        if (!jobFileInputArray) {
            // Matching jobFileInput not found, therefore there is an incomplete required input
            return true;
        }
        else {
            // Verify that this input has a sourceUrl specified
            return (!jobFileInputArray.sourceUrls || !jobFileInputArray.sourceUrls.length);
        }
    });
    if (hasIncompleteRequiredInput) {
        return false;
    }
    // Check to see if an OPTIONAL input was included but not fully specified
    var optionalAppInputArrays = getIncompleteAppInputArrays(app).filter(function (appFileInput) { return !appFileInput.sourceUrls; });
    // get any optional app file input that was included in the job.
    var optionalJobInputArrays = (_a = fileInputArrays.filter(function (jobFileInputArray) {
        return optionalAppInputArrays.some(function (optionalAppInputArray) {
            return jobFileInputArray.name === optionalAppInputArray.name;
        });
    })) !== null && _a !== void 0 ? _a : [];
    var hasIncompleteOptionalInputArray = !!optionalJobInputArrays.length &&
        optionalJobInputArrays.some(function (jobInput) { return !jobInput.sourceUrls; });
    if (hasIncompleteOptionalInputArray) {
        return false;
    }
    // Check to see if any app inputs that did not exist
    var namedInputs = (_d = (_c = (_b = app.jobAttributes) === null || _b === void 0 ? void 0 : _b.fileInputArrays) === null || _c === void 0 ? void 0 : _c.map(function (input) { return input.name; })) !== null && _d !== void 0 ? _d : [];
    var otherInputArrays = (_e = fileInputArrays.filter(function (jobInputArray) {
        return !namedInputs.some(function (name) { return name === jobInputArray.name; });
    })) !== null && _e !== void 0 ? _e : [];
    if (otherInputArrays.some(function (otherInputArray) {
        return !otherInputArray.sourceUrls || !otherInputArray.targetDir;
    })) {
        return false;
    }
    return true;
};
