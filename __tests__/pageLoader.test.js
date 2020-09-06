import {
  test, expect, describe, beforeEach,
} from '@jest/globals';
import { promises as fsPromises } from 'fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import downloadPage from '../src';

const link = 'https://test.com';
const resourcesFolder = 'test-com_files';
let pathToTempDir;
let pathToResources;

const getFixturePath = (fileName) => path.join('__tests__/__fixtures__', fileName);

const readFile = async (pathToFile) => {
  const file = await fsPromises.readFile(pathToFile, { encoding: 'utf8' });
  return file;
};

beforeAll(() => nock.disableNetConnect());

beforeEach(async () => {
  pathToTempDir = await fsPromises.mkdtemp(
    path.join(os.tmpdir(), 'page-loader-'),
  );
  pathToResources = `${pathToTempDir}/${resourcesFolder}`;
});

describe('pageLoader functionality', () => {
  test('link with subpath nested resources has been downloaded', async () => {
    const html = await readFile(getFixturePath('index.html'));
    const expectedHtml = await readFile(getFixturePath('changedIndex.html'));
    const expectedStyle = 'a { color: red }';
    const expectedScript = 'console.log("Hello world!")';

    nock(`${link}/tests/`)
      .get('/')
      .reply(200, html)
      .get('/style.css')
      .reply(200, expectedStyle)
      .get('/folder/script.txt')
      .reply(200, expectedScript);

    await downloadPage(`${link}/tests/`, pathToTempDir);

    const changedHtml = await readFile(`${pathToTempDir}/test-com.html`);
    const loadedStyle = await readFile(`${pathToResources}/style.css`);
    const loadedScript = await readFile(`${pathToResources}/folder-script.txt`);

    expect(changedHtml).toBe(expectedHtml);
    expect(loadedStyle).toBe(expectedStyle);
    expect(loadedScript).toBe(expectedScript);
  });
});

describe('pageLoader error handling', () => {
  test('passed link to non-existent site', async () => {
    const notValidLink = 'http://qwertyui12345.com/';

    nock(notValidLink).get('/').reply(404);

    await expect(downloadPage(notValidLink, pathToTempDir)).rejects.toThrowErrorMatchingSnapshot();
  });
});
