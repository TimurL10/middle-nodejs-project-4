import {
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from '@jest/globals';
import nock from 'nock';
import download_page from '../src/download_page.js';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesPath = path.join(__dirname, '..', '__fixtures__');
const getFixturePath = (fileName) => path.join(fixturesPath, fileName);

beforeAll(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.enableNetConnect();
});

test('downloads page with local image resource', async () => {
  const pageUrl = 'https://ru.hexlet.io/courses';
  const pageHtml = await fs.readFile(getFixturePath('save_link_script.html'), 'utf-8');
  const imageBody = await fs.readFile(getFixturePath('hexlet_logo.png'));
  const styleBody = 'body { color: red; }';
  const canonicalPageBody = '<html><body><h1>Courses</h1></body></html>';
  const scriptBody = 'console.log("runtime");';
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

  try {
    const pageScope = nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, pageHtml, { 'Content-Type': 'text/html' });

    const styleScope = nock('https://ru.hexlet.io')
      .get('/assets/application.css')
      .reply(200, styleBody, { 'Content-Type': 'text/css' });

    const canonicalPageScope = nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, canonicalPageBody, { 'Content-Type': 'text/html' });

    const imageScope = nock('https://ru.hexlet.io')
      .get('/assets/professions/nodejs.png')
      .reply(200, imageBody, { 'Content-Type': 'image/png' });

    const scriptScope = nock('https://ru.hexlet.io')
      .get('/packs/js/runtime.js')
      .reply(200, scriptBody, { 'Content-Type': 'application/javascript' });

    const dataDirPath = await download_page(pageUrl, tmpDir);

    const savedHtmlPath = path.join(tmpDir, 'ru-hexlet-io-courses.html');
    const filesDir = path.join(tmpDir, 'ru-hexlet-io-courses_files');
    const savedStylePath = path.join(filesDir, 'ru-hexlet-io-assets-application.css');
    const savedCanonicalPagePath = path.join(filesDir, 'ru-hexlet-io-courses.html');
    const savedImagePath = path.join(filesDir, 'ru-hexlet-io-assets-professions-nodejs.png');
    const savedScriptPath = path.join(filesDir, 'ru-hexlet-io-packs-js-runtime.js');

    const savedHtml = await fs.readFile(savedHtmlPath, 'utf-8');
    const savedStyle = await fs.readFile(savedStylePath, 'utf-8');
    const savedCanonicalPage = await fs.readFile(savedCanonicalPagePath, 'utf-8');
    const savedImage = await fs.readFile(savedImagePath);
    const savedScript = await fs.readFile(savedScriptPath, 'utf-8');

    expect(pageScope.isDone()).toBe(true);
    expect(styleScope.isDone()).toBe(true);
    expect(canonicalPageScope.isDone()).toBe(true);
    expect(imageScope.isDone()).toBe(true);
    expect(scriptScope.isDone()).toBe(true);
    expect(dataDirPath).toBe(filesDir);
    const normalizedHtml = savedHtml.replaceAll('\\', '/');

    expect(normalizedHtml).toContain('href="ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css"');
    expect(normalizedHtml).toContain('href="ru-hexlet-io-courses_files/ru-hexlet-io-courses.html"');
    expect(normalizedHtml).toContain('src="ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png"');
    expect(normalizedHtml).toContain('src="ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js"');
    expect(normalizedHtml).toContain('href="https://cdn2.hexlet.io/assets/menu.css"');
    expect(normalizedHtml).toContain('src="https://js.stripe.com/v3/"');
    expect(normalizedHtml).not.toContain('href="/assets/application.css"');
    expect(normalizedHtml).not.toContain('src="/assets/professions/nodejs.png"');
    expect(savedStyle).toBe(styleBody);
    expect(savedCanonicalPage).toBe(canonicalPageBody);
    expect(savedImage).toEqual(imageBody);
    expect(savedScript).toBe(scriptBody);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
