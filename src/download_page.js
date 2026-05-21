import debug from 'debug';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

require('axios-debug-log/enable');

debug.enable('page-loader,page-loader:*,axios');

const log = debug('page-loader');

const axios = require('axios').default;

//import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as fs from 'fs/promises';
import * as path from 'node:path';
import * as cheerio from 'cheerio';


//https://ru.hexlet.io/courses

//https://ru.hexlet.io/courses


function create_name(file_name) {
  return file_name.replace('https://','').replace(/\./g,'_').replace(/\//g,'_').slice(0,115);
}



export function get_page (url) {

  return axios({
        method: 'get',
        url: url,
        responseType: 'text'
    }).then((res) => res.data)

}

export function write_page_to_file (text,file_name,path_to_save=null) {
    let _path_to_save;
    if (!path_to_save)
        _path_to_save = process.cwd();
    else 
      _path_to_save = path_to_save;

    let new_file_name = create_name(file_name) + '.html';
    new_file_name = path.join(_path_to_save,new_file_name);

    return fs.writeFile(new_file_name,text, 'utf-8').then(() => new_file_name);
    
}

function create_directory(path_to_save,dir_name) {
  if (!dir_name)
    return;

  let new_path = path.join(path_to_save,create_name(dir_name)+'_files');

  return fs.access(new_path)
  .then(() => new_path)
  .catch(() => {
    return fs.mkdir(new_path, { recursive: true })
      .then(() => new_path);
  });
       
}


export function save_page_data(html_path,_url,path_to_save=null) {
  let _path_to_save;
  if (!path_to_save)
       _path_to_save = process.cwd();
  else 
    _path_to_save = path_to_save;

  return fs.readFile(html_path,'utf-8').then((html) => { 
   
    return create_directory(_path_to_save,_url).then((new_dir_name) => {
      const $ = cheerio.load(html);
      const target_host = new URL(_url).hostname;

      const img_src_arr = $('img')
      .map((index, element) => $(element).attr('src'))
      .get()
      .filter(Boolean);

      const links_href_arr = $('link[href]')
      .map((index, element) => $(element).attr('href'))
      .get()
      .filter(Boolean)
      .filter((item) => {
        const source_host = new URL(item, _url).hostname;
        return source_host === target_host
          || source_host.endsWith(`.${target_host}`);
      });     

      const scripts_src_arr = $('script[src]')
      .map((index, element) => $(element).attr('src'))
      .get()
      .filter(Boolean)
      .filter((item) => {
        const source_host = new URL(item, _url).hostname;
        return source_host === target_host
          || source_host.endsWith(`.${target_host}`);
      });      

      let promises1 = links_href_arr.map((item) => {
        const image_url = new URL(item, _url).href;
        const html_dir = path.dirname(html_path);
        const new_file_name = path.join(
          new_dir_name,
          create_name(image_url) + path.extname(new URL(image_url).pathname),
        );
        const relative_file_name = path.relative(html_dir, new_file_name);
        html = html.replace(item,relative_file_name);
        return axios({
            method: 'get',
            url: image_url,
            responseType: 'arraybuffer'
        }).then((res) => {return fs.writeFile(new_file_name,res.data)}).then(() => new_file_name);  
      }) 

      let promises2 = scripts_src_arr.map((item) => {
        const image_url = new URL(item, _url).href;
        const html_dir = path.dirname(html_path);
        const new_file_name = path.join(
          new_dir_name,
          create_name(image_url) + path.extname(new URL(image_url).pathname),
        );
        const relative_file_name = path.relative(html_dir, new_file_name);
        html = html.replace(item,relative_file_name);
        return axios({
            method: 'get',
            url: image_url,
            responseType: 'arraybuffer'
        }).then((res) => {return fs.writeFile(new_file_name,res.data)}).then(() => new_file_name);  
      })

      let promises = img_src_arr.map((item) => {
        const image_url = new URL(item, _url).href;
        const html_dir = path.dirname(html_path);
        const new_file_name = path.join(
          new_dir_name,
          create_name(image_url) + path.extname(new URL(image_url).pathname),
        );
        const relative_file_name = path.relative(html_dir, new_file_name);
        html = html.replace(item,relative_file_name);
        return axios({
            method: 'get',
            url: image_url,
            responseType: 'arraybuffer'
        }).then((res) => {return fs.writeFile(new_file_name,res.data)}).then(() => new_file_name);  
      })
      let all_promises = [...promises,...promises1,...promises2 ];    
      return Promise.all(all_promises).then(() => ({text:html,f_path:html_path}));
    }) 
  }).catch((error) => {console.error('Ошибка при сохранении изображений:', error.message); throw error});
}



//  https://ru.hexlet.io/courses

export function main(url) {
  //const rl = readline.createInterface({ input, output });
    log('start download_page.js');    
    /*rl.question('Введите адрес сайта: ')
    .then((url) => {
      _url = url;
      return get_page(url)
    })*/

  if (!url) {
    return Promise.reject(new Error('Usage: page_loader <url>'));
  }
     let _url = url;
   return  get_page(url)
    .then((data) => write_page_to_file(data,_url))
    .then((html_path) => {return save_page_data(html_path,_url)})
    .then((html) => {return fs.writeFile(html.f_path,html.text, 'utf-8')})   
    .catch((error) => {console.error('Ошибка:', error);throw error;})
    .finally(() => {
      log('end download_page.js');   
      //rl.close();
    });
}



