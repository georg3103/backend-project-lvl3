import { test, expect, describe } from '@jest/globals';
import { promises as fsPromises } from 'fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../index';

const link = 'https://test.com';

const pathToHtml = '__tests__/__fixtures__/before/index.html';
const pathToStyle = '__tests__/__fixtures__/before/style.css';
const pathToImage = '__tests__/__fixtures__/before/image.png';
const pathToFolderImage = '__tests__/__fixtures__/before/folder/image.png';
const pathToScript = '__tests__/__fixtures__/before/script.txt';

const htmlPath = '/';
const stylePath = '/style.css';
const imagePath = '/image.png';
const folderImagePath = '/folder/image.png';
const folderAnotherImagePath = '/folder/image1.png';
const scriptPath = '/script.txt';

let html;
let style;
let image;
let folderImage;
let script;
let pathTotempDir;
let options;

beforeAll(async () => {
  console.log('beforeAll');
  html = await fsPromises.readFile(pathToHtml, { encoding: 'utf8' });
  style = await fsPromises.readFile(pathToStyle, { encoding: 'utf8' });
  image = await fsPromises.readFile(pathToImage, { encoding: 'utf8' });
  folderImage = await fsPromises.readFile(pathToFolderImage, { encoding: 'utf8' });
  script = await fsPromises.readFile(pathToScript, { encoding: 'utf8' });

  pathTotempDir = await fsPromises.mkdtemp(
    path.resolve(os.tmpdir(), 'page-loader-'),
  );

  options = {
    output: pathTotempDir,
  };
});

describe('pageLoader functionality', () => {
  test('html is loaded', async () => {
    nock(link)
      .get(htmlPath)
      .reply(200, html)
      .get(stylePath)
      .reply(200, style)
      .get(imagePath)
      .reply(200, image)
      .get(folderImagePath)
      .reply(200, folderImage)
      .get(folderAnotherImagePath)
      .reply(200, folderImage)
      .get(scriptPath)
      .reply(200, script);

    await pageLoader(link, options);
    const fileName = 'test-com.html';
    const dest = path.join(pathTotempDir, fileName);
    const loadedHtml = await fsPromises.readFile(dest, { encoding: 'utf8' });
    expect(loadedHtml).toBe(html);
  });

  test('nested resources have been downloaded', async () => {
    nock(link)
      .get(htmlPath)
      .reply(200, html)
      .get(stylePath)
      .reply(200, style)
      .get(imagePath)
      .reply(200, image)
      .get(folderImagePath)
      .reply(200, folderImage)
      .get(folderAnotherImagePath)
      .reply(200, folderImage)
      .get(scriptPath)
      .reply(200, script);

    const destStyle = path.join(pathTotempDir, stylePath);
    const destImage = path.join(pathTotempDir, imagePath);
    const destFolderImage = path.join(pathTotempDir, folderImagePath);
    const destScript = path.join(pathTotempDir, scriptPath);

    await pageLoader(link, options);

    const loadedStyle = await fsPromises.readFile(destStyle, { encoding: 'utf8' });
    const loadedImage = await fsPromises.readFile(destImage, { encoding: 'utf8' });
    const loadedFolerImage = await fsPromises.readFile(destFolderImage, { encoding: 'utf8' });
    const loadedScript = await fsPromises.readFile(destScript, { encoding: 'utf8' });

    expect(loadedStyle).toBe(style);
    expect(loadedImage).toBe(image);
    expect(loadedFolerImage).toBe(folderImage);
    expect(loadedScript).toBe(script);
  });
});
