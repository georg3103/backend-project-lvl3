import _ from 'lodash';

const makePath = (link) => {
  const { hostname } = new URL(link);
  const fileName = hostname
    .replace(/\W+/g, '-');
  return fileName;
};

export const makePathToHtml = (link) => `${makePath(link)}.html`;

export const makePathToResources = (link) => `${makePath(link)}_files`;

export const makePathToResource = (link) => {
  const { pathname } = new URL(link);
  const fileName = _
    .chain(pathname)
    .trimStart('/')
    .replace(/\//g, '-')
    .value();
  return fileName;
};
