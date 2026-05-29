import {
  test,
  expect,
  beforeAll,
  afterAll,
} from '@jest/globals';
import nock from 'nock';
import { write_page_to_file } from '../src/download_page.js';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import os from 'node:os';

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.enableNetConnect();
});

test('writes page content to html file', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  try {
    const pageContent = 'test text';
    const pageUrl = 'https://ru.hexlet.io/courses';
    const expectedPath = path.join(tmpDir, 'ru-hexlet-io-courses.html');
    const actualPath = await write_page_to_file(pageContent, pageUrl, tmpDir);
    const actualContent = await fs.readFile(actualPath, 'utf-8');

    expect(actualPath).toBe(expectedPath);
    expect(actualContent).toBe(pageContent);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
