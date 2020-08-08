import { describe, test, expect } from '@jest/globals';
import {
  makePathToHtml,
  makePathToFilesFolder,
  makePathToFile,
  changePath,
} from '../src/utils';

const link = 'https://test.com';
const output = '/tmp/page-loader-Q4W6aZ';
const pathToFilesFolder = '/tmp/page-loader-Q4W6aZ/test-com_files';

describe('utils', () => {
  test('makePathToHtml', () => {
    const pathToHtml = '/tmp/page-loader-Q4W6aZ/test-com.html';
    expect(makePathToHtml(link, output)).toEqual(pathToHtml);
  });

  test('makePathToFilesFolder', () => {
    expect(makePathToFilesFolder(link, output)).toEqual(pathToFilesFolder);
  });

  test('makePathToFile', () => {
    const fileUrl = 'https://test.com/script.txt';
    const pathToFile = '/tmp/page-loader-Q4W6aZ/test-com_files/script.txt';
    expect(makePathToFile(fileUrl, pathToFilesFolder)).toEqual(pathToFile);
  });

  test('changePath', async () => {
    const pathToTestFilesFolder = 'test-com_files';
    const fileUrl = '/folder/image.png';
    const changedPath = 'test-com_files/folder-image.png';
    expect(changePath(fileUrl, pathToTestFilesFolder)).toBe(changedPath);
  });
});
