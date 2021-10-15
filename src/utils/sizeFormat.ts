/**
 * Create a string representation of a file/folder size using internal standard
 * @param {number} bytes - The size of an entity
 * @returns {string}
 */
function createSizeString(bytes: number): string {
  const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
  const number = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
  const bytesString = (bytes / 1024 ** Math.floor(number)).toFixed(1);

  return `${bytesString} ${units[number]}`;
}

export default createSizeString;
