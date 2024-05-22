export var jobRequiredFieldsComplete = function (job) {
    return !!job.name && !!job.appId && !!job.appVersion;
};
