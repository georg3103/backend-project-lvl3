import path from 'path';

/**
 * @param {String} link
 * @param {String} pathToMainFolder path to folder containing downloaded resources
 * @returns {String} path to main html file
 */
export function makePathToHtml(link, pathToMainFolder) {
  const { hostname } = new URL(link);
  const fileName = hostname
    .replace(/\W+/g, '-')
    .concat('.html');
  return path.join(pathToMainFolder, fileName);
}

/**
 * @param {String} link
 * @param {String} pathToFolder path to folder containing downloaded resources
 * @returns {String} path to folder containing resouce files (./hostname/test_files)
 */
export function makePathToFolder(link, pathToFolder = '') {
  const { hostname } = new URL(link);
  const fileFolderName = hostname
    .replace(/\W+/g, '-')
    .concat('_files');
  return path.join(pathToFolder, fileFolderName);
}

/**
 * @param {String} pathToFile path to resource file
 * @param {String} pathToFilesFolder path to folder of files containing downloaded resources
 * @returns {String} modified path to file
 */
export function makePathToFile(pathToFile, pathToFilesFolder) {
  const { dir, base } = path.parse(pathToFile);

  if (dir === '/' || !dir.length) {
    return path.join(pathToFilesFolder, base);
  }

  const fileName = dir
    .replace(/\W+/g, '-')
    .concat(`-${base}`);
  return path.join(pathToFilesFolder, fileName);
}

/**
 * @param {String} pathToFile path to resource file
 * @param {String} pathToFolder path to folder containing downloaded resources
 * @returns {String} modified path to file
 */
export function changePath(pathToFile, pathToFolder) {
  const { dir, base } = path.parse(pathToFile);
  const fileName = dir.slice(1).length
    ? dir
      .replace(/\W+/g, '-')
      .concat(`-${base}`)
    : base;
  return path.join(pathToFolder, fileName);
}
