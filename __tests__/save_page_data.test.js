import {
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from '@jest/globals';
import nock from 'nock';
import { save_page_data } from '../src/download_page.js';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, '..', '__fixtures__');
const getFixturePath = (fileName) => path.join(fixturesPath, fileName);

const pageUrl = 'https://ru.hexlet.io/courses';
const imageUrl = '/vite/assets/hexlet_ru_og_logo-BTQJlhfA.png';
const filesDirName = 'ru-hexlet-io-courses_files';
const imageFileName = 'ru-hexlet-io-vite-assets-hexlet_ru_og_logo-BTQJlhfA.png';

beforeAll(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.enableNetConnect();
});

const prepareHtmlFile = async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  const htmlPath = path.join(tmpDir, 'save_images.html');

  await fs.copyFile(getFixturePath('save_images.html'), htmlPath);

  return { htmlPath, tmpDir };
};

const mockImageDownload = async () => {
  const imageBody = await fs.readFile(getFixturePath('hexlet_logo.png'));
  const scope = nock('https://ru.hexlet.io')
    .get(imageUrl)
    .reply(200, imageBody, { 'Content-Type': 'image/png' });

  return { imageBody, scope };
};

test('check image saved', async () => {
  const { htmlPath, tmpDir } = await prepareHtmlFile();

  try {
    const { imageBody, scope } = await mockImageDownload();
    await save_page_data(htmlPath, pageUrl, tmpDir);

    const savedImagePath = path.join(tmpDir, filesDirName, imageFileName);
    const savedImage = await fs.readFile(savedImagePath);

    expect(scope.isDone()).toBe(true);
    expect(savedImage).toEqual(imageBody);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});

test('check html replaced', async () => {
  const { htmlPath, tmpDir } = await prepareHtmlFile();

  try {
    const { scope } = await mockImageDownload();
    const html = await save_page_data(htmlPath, pageUrl, tmpDir);
    const expected = await fs.readFile(getFixturePath('save_images_target.html'), 'utf-8');

    expect(scope.isDone()).toBe(true);
    expect(html.text.replaceAll('\\', '/')).toBe(expected);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
