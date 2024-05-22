/**
 * Create a string representation of a file/folder size using internal standard
 * @param {number} bytes - The size of an entity
 * @returns {string}
 */
function createSizeString(bytes) {
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    var number = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
    var bytesString = (bytes / Math.pow(1024, Math.floor(number))).toFixed(1);
    return "".concat(bytesString, " ").concat(units[number]);
}
export default createSizeString;
