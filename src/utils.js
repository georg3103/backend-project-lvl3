import url from 'url';
import path from 'path';

/**
 * @param {String} link
 * @param {Srring} options
 * @returns {String} path to main html file
 */
export function makePathToHtml(link, output) {
  const { hostname } = url.parse(link);
  const fileName = hostname
    .replace(/\W+/g, '-')
    .concat('.html');
  return path.join(output, fileName);
}

/**
 * @param {String} link
 * @param {Object} options
 * @returns {String} path to files folder
 */
export function makePathToFilesFolder(link, output = '') {
  const { hostname } = url.parse(link);
  const fileFolderName = hostname
    .replace(/\W+/g, '-')
    .concat('_files');
  return path.join(output, fileFolderName);
}

/**
 * @param {String} link
 * @param {String} output
 * @returns {String} path to file
 */
export function makePathToFile(link, output) {
  const { pathname } = url.parse(link);
  const { dir, base } = path.parse(pathname);
  const dirPath = dir.slice(1);
  const fileName = dirPath.length
    ? dirPath
      .replace(/\W+/g, '-')
      .concat(`-${base}`)
    : base;
  return path.join(output, fileName);
}

/**
 * @param {String} link
 * @param {String} output
 * @returns {String} path to file
 */
export function changePath(link, output) {
  const { pathname } = url.parse(link);
  const { dir, base } = path.parse(pathname);
  const dirPath = dir.slice(1);
  const fileName = dirPath.length
    ? dirPath
      .replace(/\W+/g, '-')
      .concat(`-${base}`)
    : base;
  return path.join(output, fileName);
}
