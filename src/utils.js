import url from 'url';
import path from 'path';

/**
 * @param {String} link
 * @param {Object} options
 * @returns {String} path to main html file
 */
export function makeDir(link, { output }) {
  const { hostname } = url.parse(link);
  const fileName = hostname
    .replace(/\W+/g, '-')
    .concat('.html');
  return path.join(output, fileName);
}

/**
 * @param {String} link
 * @param {Object} options
 * @returns {String} path to file
 */
export function makeFileDir(link, { output }) {
  const { pathname } = url.parse(link);
  return path.join(output, pathname);
}
