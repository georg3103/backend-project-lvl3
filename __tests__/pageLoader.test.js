import {
  test, expect, describe, beforeEach,
} from '@jest/globals';
import { promises as fsPromises } from 'fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import downloadPage from '../index';

const link = 'https://test.com';

const pathToFixtures = '__tests__/__fixtures__';

let pathTotempDir;

beforeAll(async () => {
  nock.disableNetConnect();
});

beforeEach(async () => {
  pathTotempDir = await fsPromises.mkdtemp(
    path.resolve(os.tmpdir(), 'page-loader-'),
  );
});

describe('pageLoader functionality', () => {
  test('link with subpath nested resources have been downloaded', async () => {
    const html = await fsPromises.readFile(path.join(pathToFixtures, 'index.html'), { encoding: 'utf8' });
    const expectedHtml = await fsPromises.readFile(path.join(pathToFixtures, 'changedIndex.html'), { encoding: 'utf8' });
    const expectedStyle = await fsPromises.readFile(path.join(pathToFixtures, 'style.css'), { encoding: 'utf8' });
    const expectedImage = await fsPromises.readFile(path.join(pathToFixtures, 'image.png'), { encoding: 'utf8' });
    const expectedScript = await fsPromises.readFile(path.join(pathToFixtures, 'script.txt'), { encoding: 'utf8' });

    nock(`${link}/tests/`)
      .get('/')
      .reply(200, html)
      .get('/style.css')
      .reply(200, expectedStyle)
      .get('/image.png')
      .reply(200, expectedImage)
      .get('/folder/image.png')
      .reply(200, expectedImage)
      .get('/script.txt')
      .reply(200, expectedScript);

    const pathToChangedHtml = `${pathTotempDir}/test-com.html`;
    const pathToLoadedStyle = `${pathTotempDir}/test-com_files/style.css`;
    const pathToLoadedImage = `${pathTotempDir}/test-com_files/image.png`;
    const pathToFolderLoadedImage = `${pathTotempDir}/test-com_files/folder-image.png`;
    const pathToLoadedScript = `${pathTotempDir}/test-com_files/script.txt`;

    await downloadPage(`${link}/tests/`, pathTotempDir);

    const changedHtml = await fsPromises.readFile(pathToChangedHtml, { encoding: 'utf8' });
    const loadedStyle = await fsPromises.readFile(pathToLoadedStyle, { encoding: 'utf8' });
    const loadedImage = await fsPromises.readFile(pathToLoadedImage, { encoding: 'utf8' });
    const loadedFolerImage = await fsPromises.readFile(pathToFolderLoadedImage, { encoding: 'utf8' });
    const loadedScript = await fsPromises.readFile(pathToLoadedScript, { encoding: 'utf8' });

    expect(changedHtml).toBe(expectedHtml);
    expect(loadedStyle).toBe(expectedStyle);
    expect(loadedImage).toBe(expectedImage);
    expect(loadedFolerImage).toBe(expectedImage);
    expect(loadedScript).toBe(expectedScript);
  });
});

describe('pageLoader error handling', () => {
  test('passed wrong pathTotempDir', async () => {
    const html = await fsPromises.readFile(path.join(pathToFixtures, 'index.html'), { encoding: 'utf8' });
    nock(link).get('/').reply(200, html);

    await expect(downloadPage(link, '/wrong/dir')).rejects.toThrowErrorMatchingSnapshot();
  });

  test('passed link to non-existent site', async () => {
    nock(link).get('/').reply(404);

    const notValidLink = 'http://qwertyui12345.com/';

    await expect(downloadPage(notValidLink, pathTotempDir)).rejects.toThrowErrorMatchingSnapshot();
  });
});
