import path from 'path';
import trimStart from 'lodash/trimStart';
import flow from 'lodash/flow';

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
 * @param {String} pathname resource pathname
 * @param {String} pathToFilesFolder path to folder of files containing downloaded resources
 * @returns {String} modified path to file
 */
export const makePathToFile = (pathname, pathToFilesFolder) => flow([
  trimStart,
  (pathToFile) => pathToFile.replace(/\//g, '-'),
  (fileName) => path.join(pathToFilesFolder, fileName),
])(pathname, '/');
