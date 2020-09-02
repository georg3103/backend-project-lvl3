import {
  test, expect, describe, beforeEach,
} from '@jest/globals';
import { promises as fsPromises } from 'fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import downloadPage from '../src';

const link = 'https://test.com';

const getFixturePath = (fileName) => path.join('__tests__/__fixtures__', fileName);

const readFile = async (pathToFile) => {
  const file = await fsPromises.readFile(pathToFile, { encoding: 'utf8' });
  return file;
};

beforeAll(async () => {
  nock.disableNetConnect();
});

let pathToTempDir;

beforeEach(async () => {
  pathToTempDir = await fsPromises.mkdtemp(
    path.join(os.tmpdir(), 'page-loader-'),
  );
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
    const loadedStyle = await readFile(`${pathToTempDir}/test-com_files/style.css`);
    const loadedScript = await readFile(`${pathToTempDir}/test-com_files/folder-script.txt`);

    expect(changedHtml).toBe(expectedHtml);
    expect(loadedStyle).toBe(expectedStyle);
    expect(loadedScript).toBe(expectedScript);
  });
});

describe('pageLoader error handling', () => {
  test('passed wrong pathToTempDir', async () => {
    const html = await readFile(getFixturePath('index.html'));
    nock(link).get('/').reply(200, html);

    await expect(downloadPage(link, '/wrong/dir')).rejects.toThrowErrorMatchingSnapshot();
  });

  test('passed link to non-existent site', async () => {
    nock(link).get('/').reply(404);

    const notValidLink = 'http://qwertyui12345.com/';

    await expect(downloadPage(notValidLink, pathToTempDir)).rejects.toThrowErrorMatchingSnapshot();
  });
});
