import { test, expect, beforeAll, afterAll, afterEach } from '@jest/globals';
import nock from 'nock';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import os from 'node:os';

import { get_page, save_page_data } from '../src/download_page.js';

beforeAll(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.enableNetConnect();
});

test('get_page throws error when page returns 500', async () => {
  const url = 'https://example.com/broken';

  nock('https://example.com')
    .get('/broken')
    .reply(500, 'server error');

  await expect(get_page(url)).rejects.toThrow(
    /get_page\(\) failed for https:\/\/example\.com\/broken: 500/,
  );
});

test('save_page_data throws error when image resource returns 500', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  const htmlPath = path.join(tmpDir, 'page.html');
  const pageUrl = 'https://example.com/page';

  await fs.writeFile(
    htmlPath,
    '<html><body><img src="/bad-image.png"></body></html>',
    'utf-8',
  );

  
  nock('https://example.com')
    .get('/bad-image.png')
    .reply(500, 'image server error');

  await expect(save_page_data(htmlPath, pageUrl, tmpDir)).rejects.toThrow(
    /save_page_data\(\) failed for https:\/\/example\.com\/bad-image\.png, status: 500/,
  );
});