import { promises as fsPromises } from 'fs';
import path from 'path';
import url from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
import { makeDir, makeFileDir } from './utils';

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
  const { protocol, hostname } = url.parse(link);
  const fileName = makeDir(link, options);
  let mainHtml;

  return axios
    .get(link)
    .then(({ data: html }) => {
      mainHtml = html;
    })
    .then(() => fsPromises.writeFile(fileName, mainHtml))
    .then(console.log(`created main html: ${fileName}`))
    .then(() => getUrls(mainHtml, link))
    .then((urls) => urls
      .map((pathname) => {
        const resourceLink = url.format({ protocol, hostname, pathname });
        console.log('resourceLink', resourceLink);
        return axios
          .get(resourceLink);
      }))
    .then((resRequests) => Promise.all(
      resRequests.map((resRequest) => resRequest
        .then(({ data: fileData, config: { url: fileUrl } }) => {
          const pathTofile = makeFileDir(fileUrl, options);
          const pathTofileFolder = path.dirname(pathTofile);
          return fsPromises.opendir(pathTofileFolder)
            .then(() => {
              console.log(`${pathTofileFolder}: folder exists`);
              return fsPromises.readFile(pathTofile)
                .then(() => {
                  console.log(`${pathTofile}: file exists`);
                })
                .catch(() => fsPromises.writeFile(pathTofile, fileData));
            })
            .catch(() => {
              console.log(`${pathTofileFolder}: folders created`);
              return fsPromises.mkdir(pathTofileFolder, { recursive: true })
                .then(() => fsPromises.readFile(pathTofile)
                  .then(() => {
                    console.log(`${pathTofile}: file exists`);
                  })
                  .catch(() => fsPromises.writeFile(pathTofile, fileData)));
            });
        })),
    ));
};
