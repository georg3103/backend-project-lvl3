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

require('axios-debug-log');

const log = debug('page-loader');

const tags = {
  link: 'href',
  img: 'src',
  script: 'src',
};

/**
 * @param {String} html previously loaded html
 * @param {String} pathToFolder path to folder containing loaded resources
 * @returns {String} new html with changed resource paths
 */
const changeHtml = (html, pathToFolder) => {
  const $ = cheerio.load(html);
  Object.keys(tags)
    .forEach((tag) => {
      const attr = tags[tag];
      const selector = `${tag}[${attr}]`;
      $(selector).map((_, el) => {
        const pathToFile = $(el).attr(attr);
        const newPathToFile = changePath(pathToFile, pathToFolder);
        return $(el).attr(attr, newPathToFile);
      });
    });

  return $.html();
};

/**
 * @param {String} html
 * @returns {Array} links to resources
 */
const getUrls = (html) => {
  const $ = cheerio.load(html);
  return Object.keys(tags)
    .map((tag) => {
      const attr = tags[tag];
      const selector = `${tag}[${attr}]`;
      return $(selector)
        .map((_, el) => $(el).attr(attr))
        .get();
    })
    .flat();
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
    return fsPromises.writeFile(pathTofile, fileData)
      .then(() => log(pathTofile, 'file created'));
  });

/**
 * @param {Object} options { link, urls, parsedUrl, pathToFilesFolder }
 * @returns {Array} load tasks
 */
const createLoadTasks = ({
  link, urls, parsedUrl, pathToFilesFolder,
}) => new Listr(
  urls.map((pathname) => ({
    title: `load ${pathname}`,
    task: () => {
      const resPathname = path.normalize(path.join(parsedUrl.pathname, pathname));
      const resourceLink = url.format({
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        pathname: resPathname,
      });
      return downloadResource(resourceLink, link, pathToFilesFolder);
    },
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
      const newHtml = changeHtml(html, pathToFolder);
      const urls = getUrls(html);
      fileLoadTasks = createLoadTasks({
        link, urls, parsedUrl, pathToFilesFolder,
      });
      return fsPromises.writeFile(pathToHtml, newHtml);
    })
    .then(() => log(pathToHtml, 'index file is dowloaded'))
    .then(() => fsPromises.mkdir(pathToFilesFolder, { recursive: true }))
    .then(() => fileLoadTasks.run());
};
