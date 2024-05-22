var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
export var upperCaseFirstLetter = function (str) {
    var lower = str.toLowerCase();
    return "".concat(lower.slice(0, 1).toUpperCase()).concat(lower.slice(1));
};
export var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
export var reduceRecord = function (record) {
    var id = record.id, contents = __rest(record, ["id"]);
    return Object.values(contents).reduce(function (prev, current) { return (prev + current); }, '');
};
