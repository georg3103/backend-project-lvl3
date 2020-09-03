import { promises as fsPromises } from 'fs';
import url from 'url';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';

import {
  makePathToHtml,
  makePathToFile,
  makePathToFolder,
  changePath,
} from './utils';

import 'axios-debug-log';

const log = debug('page-loader');

const tagAttributesMapping = {
  link: 'href',
  img: 'src',
  script: 'src',
};

/**
 * @param {String} html previously loaded html
 * @param {String} pathToFolder path to folder containing loaded resources
 * @param {String} html previously loaded html
 * @returns {Object} return parsed urls and changed html ({ urls, html })
 */
const changeHtml = (html, pathToFolder, parsedUrl) => {
  const $ = cheerio.load(html);
  const urls = [];
  Object.keys(tagAttributesMapping)
    .forEach((tag) => {
      const attr = tagAttributesMapping[tag];
      const selector = `${tag}[${attr}]`;
      $(selector).map((_, el) => {
        const pathToResource = $(el).attr(attr);
        const resPathname = path.normalize(path.join(parsedUrl.pathname, pathToResource));
        const resourceLink = url.format({
          protocol: parsedUrl.protocol,
          hostname: parsedUrl.hostname,
          pathname: resPathname,
        });
        urls.push(resourceLink);
        const newPathToFile = changePath(pathToResource, pathToFolder);
        return $(el).attr(attr, newPathToFile);
      });
    });
  return { urls, html: $.html() };
};

/**
 * @param {String} linkToResource link to resource
 * @param {String} linkToSite link to site
 * @param {String} pathToFilesFolder path to loaded files folder
 */
const downloadResource = (linkToResource, linkToSite, pathToFilesFolder) => axios
  .get(linkToResource, { responseType: 'arraybuffer' })
  .then(({ data: fileData, config: { url: loadedUrl } }) => {
    const fileUrl = loadedUrl.replace(linkToSite, '');
    const pathTofile = makePathToFile(fileUrl, pathToFilesFolder);
    log(pathTofile, 'creating a file');
    return fsPromises.writeFile(pathTofile, fileData);
  });

/**
 * @param {String} linkToSite link to site
 * @param {Array} urls array of resource links
 * @param {String} pathToFilesFolder path to loaded files folder
 * @returns {Array} load tasks
 */
const createLoadTasks = (linkToSite, urls, pathToFilesFolder) => new Listr(
  urls.map((pathname) => ({
    title: `load ${pathname}`,
    task: () => downloadResource(pathname, linkToSite, pathToFilesFolder),
  }), { concurrent: true, exitOnError: false }),
);

/**
 * @param {String} link link to site
 * @param {String} output path to the folder where the downloaded files will be stored
 */
export default (link, output) => {
  const parsedUrl = new URL(link);
  const pathToHtml = makePathToHtml(link, output);
  const pathToFilesFolder = makePathToFolder(link, output);

  let fileLoadTasks = [];

  return axios
    .get(link)
    .then(({ data: html }) => {
      const pathToFolder = makePathToFolder(link);
      const { urls, html: newHtml } = changeHtml(html, pathToFolder, parsedUrl);
      fileLoadTasks = createLoadTasks(link, urls, pathToFilesFolder);
      log(pathToHtml, 'index file is is loading');
      return fsPromises.writeFile(pathToHtml, newHtml);
    })
    .then(() => fsPromises.access(pathToFilesFolder)
      .catch(() => fsPromises.mkdir(pathToFilesFolder, { recursive: true })))
    .then(() => fileLoadTasks.run());
};
