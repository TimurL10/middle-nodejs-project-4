import axios from 'axios';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import * as fs from 'fs/promises';
import * as path from 'node:path';
//https://ru.hexlet.io/courses



export function get_page (url) {

  return axios({
        method: 'get',
        url: url,
        responseType: 'text'
    }).then((res) => res.data)

}

export function write_page_to_file (text,file_name,path_to_save) {
    if (!path_to_save)
       path_to_save = process.cwd();

    let new_file_name = file_name.replace('https://','').replace(/\./g,'_').replace(/\//g,'_');
    new_file_name = new_file_name + '.html';
    new_file_name = path.join(path_to_save,new_file_name);

    return fs.writeFile(new_file_name,text, 'utf-8').then(() => new_file_name);
    
}



function main() {
  const rl = readline.createInterface({ input, output });
    console.log("start")
    let _url;

    rl.question('Введите адрес сайта: ')
    .then((url) => {
      _url = url;
      return get_page(url)
    })
    .then((data) => write_page_to_file(data,_url))
    .then((file_path) => console.log(file_path))
    .catch((error) => {
      console.error('Ошибка:', error.message);
    })
    .finally(() => {
      rl.close();
    });;

}

main();