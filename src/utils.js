import path from 'path';
import _ from 'lodash';

const makePath = (link, pathToMainFolder = '') => {
  const { hostname } = new URL(link);
  const fileName = hostname
    .replace(/\W+/g, '-');
  return path.join(pathToMainFolder, fileName);
};

export const makePathToHtml = (link, pathToMainFolder = '') => `${makePath(link, pathToMainFolder)}.html`;

export const makePathToFolder = (link, pathToFolder = '') => `${makePath(link, pathToFolder)}_files`;

export const makePathToFile = (pathname, pathToFilesFolder) => {
  const fileName = _
    .chain(pathname)
    .trimStart('/')
    .replace(/\//g, '-')
    .value();
  return path.join(pathToFilesFolder, fileName);
};
