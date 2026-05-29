import {
  test,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from '@jest/globals';
import nock from 'nock';
import { get_page } from '../src/download_page.js';

beforeAll(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.enableNetConnect();
});

test('downloads html page', async () => {
  const url = 'https://ru.hexlet.io/courses';
  const html = '<html><body><h1>Courses</h1></body></html>';
  const scope = nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, html, {
      'Content-Type': 'text/html',
    });

  const data = await get_page(url);

  expect(scope.isDone()).toBe(true);
  expect(data).toBe(html);
});
