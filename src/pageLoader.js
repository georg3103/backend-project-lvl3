import { promises as fsPromises } from 'fs';
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
      return $(selector).attr()[attr];
    });
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
          const fileDir = makeFileDir(fileUrl, options);
          console.log('fileDir', fileDir);
          return fsPromises.writeFile(fileDir, fileData);
        })),
    ));
};
