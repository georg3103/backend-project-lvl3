import url from 'url';
import path from 'path';

/**
 * @param {String} link
 * @param {String} pathToMainFolder path to folder containing downloaded resources
 * @returns {String} path to main html file
 */
export function makePathToHtml(link, pathToMainFolder) {
  const { hostname } = url.parse(link);
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
  const { hostname } = url.parse(link);
  const fileFolderName = hostname
    .replace(/\W+/g, '-')
    .concat('_files');
  return path.join(pathToFolder, fileFolderName);
}

/**
 * @param {String} link
 * @param {String} pathToFilesFolder path to folder of files containing downloaded resources
 * @returns {String} modified path to file
 */
export function makePathToFile(link, pathToFilesFolder) {
  const { pathname } = url.parse(link);
  const { dir, base } = path.parse(pathname);

  if (dir === '/' || !dir.length) {
    return path.join(pathToFilesFolder, base);
  }

  const fileName = dir
    .replace(/\W+/g, '-')
    .concat(`-${base}`);
  return path.join(pathToFilesFolder, fileName);
}

/**
 * @param {String} link
 * @param {String} pathToFolder path to folder containing downloaded resources
 * @returns {String} modified path to file
 */
export function changePath(link, pathToFolder) {
  const { pathname } = url.parse(link);
  const { dir, base } = path.parse(pathname);
  const fileName = dir.slice(1).length
    ? dir
      .replace(/\W+/g, '-')
      .concat(`-${base}`)
    : base;
  return path.join(pathToFolder, fileName);
}
