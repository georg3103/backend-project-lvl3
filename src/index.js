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
  makePathToFilesFolder,
  changePath,
  isFolder,
} from './utils';

require('axios-debug-log');

const log = debug('page-loader');

const tags = {
  link: {
    selector: 'link[href]',
    attr: 'href',
  },
  img: {
    selector: 'img[src]',
    attr: 'src',
  },
  script: {
    selector: 'script[src]',
    attr: 'src',
  },
};

/**
 * @param {String} link
 * @param {String} dest
 * @returns {String} html code
 */
const changeHtml = (html, dest) => {
  const $ = cheerio.load(html);
  Object.keys(tags)
    .forEach((key) => {
      const { selector } = tags[key];
      $(selector).map((_, el) => {
        const { attr } = tags[key];
        const pathToFile = $(el).attr(attr);
        const newPathToFile = changePath(pathToFile, dest);
        return $(el).attr(attr, newPathToFile);
      });
    });

  return $.html();
};

/**
 * @param {String} html
 * @returns {Array} parsed urls
 */
const getUrls = (html) => {
  const $ = cheerio.load(html);
  return Object.keys(tags)
    .map((key) => {
      const { selector, attr } = tags[key];
      return $(selector)
        .map((_, el) => $(el).attr(attr))
        .get();
    })
    .flat();
};

/**
 * @param {String} pathToHtml
 * @param {String} newHtml
 */
const downloadIndex = (pathToHtml, newHtml) => fsPromises
  .writeFile(pathToHtml, newHtml)
  .then(() => log(pathToHtml, 'index file is dowloaded'));

/**
 * @param {String} resourceLink
 * @param {String} link
 * @param {String} output
 */
const downloadResource = (resourceLink, link, output) => axios
  .get(resourceLink)
  .then(({ data: fileData, config: { url: loadedUrl } }) => {
    const fileUrl = loadedUrl.replace(link, '');
    const pathTofile = makePathToFile(fileUrl, output);
    return fsPromises.readFile(pathTofile)
      .then(() => log(pathTofile, 'file exists'))
      .catch(() => fsPromises.writeFile(pathTofile, fileData)
        .then(() => log(pathTofile, 'file created')));
  });

/**
 * @param {String} link
 * @param {String} output
 */
export default (link, output) => {
  const { protocol, hostname, pathname: linkPathname } = url.parse(link);

  const pathToHtml = makePathToHtml(link, output);
  const pathToFilesFolder = makePathToFilesFolder(link, output);

  let html;
  let newHtml;

  return isFolder(output)
    .then(() => axios
      .get(link)
      .then(({ data }) => {
        html = data;
      })
      .then(() => {
        const pathToFolder = makePathToFilesFolder(link);
        newHtml = changeHtml(html, pathToFolder);
      })
      .then(() => fsPromises.mkdir(pathToFilesFolder, { recursive: true }))
      .then(log('created folder for files', pathToFilesFolder))
      .then(() => {
        const urls = getUrls(html);
        const fileLoadTasks = new Listr(
          urls.map((pathname) => ({
            title: `load ${pathname}`,
            task: () => {
              const resPathname = path.normalize(path.join(linkPathname, pathname));
              const resourceLink = url.format({
                protocol, hostname, pathname: resPathname,
              });
              return downloadResource(resourceLink, link, pathToFilesFolder);
            },
          })),
        );
        return Promise.all([downloadIndex(pathToHtml, newHtml), fileLoadTasks.run()]);
      }));
};
