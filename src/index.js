import { promises as fsPromises } from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';

import {
  makePathToHtml,
  makePathToFile,
  makePathToFolder,
} from './utils';

import 'axios-debug-log';

const log = debug('page-loader');

const tagAttributesMapping = {
  link: 'href',
  img: 'src',
  script: 'src',
};

const prepareData = (html, baseDirname, linkUrlObj) => { // rename
  const $ = cheerio.load(html);
  const resources = [];
  Object.entries(tagAttributesMapping)
    .forEach(([tag, attr]) => {
      $(`${tag}[${attr}]`)
        .map((_, el) => ({
          urlObj: new URL($(el).attr(attr), linkUrlObj.href),
          el,
        }))
        .get()
        .filter(({ urlObj }) => urlObj.host === linkUrlObj.host)
        .forEach(({ urlObj, el }) => {
          const newPathToFile = makePathToFile(urlObj.pathname, baseDirname);
          resources.push({ urlObj, newPathToFile });
          const relativePathToFile = makePathToFolder(linkUrlObj.href);
          const changedPathToFile = makePathToFile(urlObj.pathname, relativePathToFile);
          $(el).attr(attr, changedPathToFile);
        });
    });
  return { resources, html: $.html() };
};

const downloadResource = (linkToResource, pathToFile) => axios
  .get(linkToResource.href, { responseType: 'arraybuffer' })
  .then((response) => fsPromises.writeFile(pathToFile, response.data));

const createLoadTasks = (resources) => {
  const tasks = resources.map(({ urlObj: urlObjItem, newPathToFile }) => ({
    title: `loaded ${urlObjItem.href} to ${newPathToFile}`,
    task: () => downloadResource(urlObjItem, newPathToFile),
  }));
  return new Listr(tasks, { concurrent: true, exitOnError: false });
};

export default (link, pathToOutput) => {
  const linkUrlObj = new URL(link);
  const pathToHtml = makePathToHtml(link, pathToOutput);
  const baseDirname = makePathToFolder(link, pathToOutput);

  let data = {};

  return axios
    .get(link)
    .then(({ data: html }) => {
      const { resources, html: newHtml } = prepareData(html, baseDirname, linkUrlObj);
      const fileLoadTasks = createLoadTasks(resources, baseDirname);
      data = { newHtml, fileLoadTasks };
    })
    .then(() => fsPromises.access(baseDirname)
      .catch(() => fsPromises.mkdir(baseDirname, { recursive: true })))
    .then(() => {
      log(pathToHtml, 'index file is loading');
      return fsPromises.writeFile(pathToHtml, data.newHtml);
    })
    .then(() => data.fileLoadTasks.run());
};
