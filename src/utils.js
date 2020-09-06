import path from 'path';

/**
 * @param {String} link
 * @param {String} pathToFolder path to folder
 * @returns {String} resolved path
 */
const makePath = (link, pathToMainFolder = '') => {
  const { hostname } = new URL(link);
  const fileName = hostname
    .replace(/\W+/g, '-');
  return path.join(pathToMainFolder, fileName);
};

/**
 * @param {String} link
 * @param {String} pathToMainFolder path to folder containing downloaded resources
 * @returns {String} path to main html file
 */
export const makePathToHtml = (link, pathToMainFolder = '') => `${makePath(link, pathToMainFolder)}.html`;

/**
 * @param {String} link
 * @param {String} pathToFolder path to folder containing downloaded resources
 * @returns {String} path to folder containing resouce files (./hostname/test_files)
 */
export const makePathToFolder = (link, pathToFolder = '') => `${makePath(link, pathToFolder)}_files`;

/**
 * @param {String} pathToFile path to resource file
 * @param {String} pathToFilesFolder path to folder of files containing downloaded resources
 * @returns {String} modified path to file
 */
export const makePathToFile = (pathToFile, pathToFilesFolder) => {
  const { dir, base } = path.parse(pathToFile);

  if (dir === '/' || !dir.length) {
    return path.join(pathToFilesFolder, base);
  }

  const fileName = dir
    .replace(/\W+/g, '-')
    .concat(`-${base}`);
  return path.join(pathToFilesFolder, fileName);
};

/**
 * @param {String} pathToFile path to resource file
 * @param {String} pathToFolder path to folder containing downloaded resources
 * @returns {String} modified path to file
 */
export const changePath = (pathToFile, pathToFolder) => {
  const { dir, base } = path.parse(pathToFile);
  const fileName = dir.slice(1).length
    ? dir
      .replace(/\W+/g, '-')
      .concat(`-${base}`)
    : base;
  return path.join(pathToFolder, fileName);
};
