import { promises as fsPromises } from 'fs';
import url from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';

import {
  makePathToHtml,
  makePathToFile,
  makePathToFilesFolder,
  changePath,
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
 * @param {String} link
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
 * @param {String} link
 * @param {Object} options
 */
export default (link, options) => {
  const { output } = options;

  const { protocol, hostname } = url.parse(link);

  if (!protocol || !hostname) {
    throw new Error(`incorrent url ${link}`);
  }

  const pathToHtml = makePathToHtml(link, output);
  const pathToFilesFolder = makePathToFilesFolder(link, output);

  let html;
  let loadedFiles = [];

  return axios
    .get(link)
    .then(({ data }) => {
      html = data;
    })
    .then(() => {
      const pathToFolder = makePathToFilesFolder(link);
      const newHtml = changeHtml(html, pathToFolder);
      return fsPromises.writeFile(pathToHtml, newHtml);
    })
    .then(log('created main html', pathToHtml))
    .then(() => fsPromises.mkdir(pathToFilesFolder, { recursive: true }))
    .then(log('created folder for files', pathToFilesFolder))
    .then(() => {
      const urls = getUrls(html, link);
      const fileLoadTasks = new Listr(
        urls.map((pathname) => ({
          title: pathname,
          task: () => {
            const resourceLink = url.format({ protocol, hostname, pathname });
            return axios
              .get(resourceLink)
              .then(({ data: fileData, config: { url: fileUrl } }) => {
                const loadedResource = { fileData, fileUrl };
                loadedFiles = loadedFiles.concat(loadedResource);
                log('loaded', resourceLink);
              });
          },
        })),
      );
      return fileLoadTasks.run();
    })
    .then(() => {
      const fileTasks = new Listr(
        loadedFiles.map(({ fileData, fileUrl }) => ({
          title: fileUrl,
          task: () => {
            const pathTofile = makePathToFile(fileUrl, pathToFilesFolder);
            return fsPromises.readFile(pathTofile)
              .then(() => log(pathTofile, 'file exists'))
              .catch(() => fsPromises.writeFile(pathTofile, fileData)
                .then(() => log(pathTofile, 'file created')));
          },
        })),
      );
      return fileTasks.run();
    });
};
