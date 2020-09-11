import { Platform, PermissionsAndroid } from "react-native";

import RNFS, { readDir, readFile } from "react-native-fs";

import { multiQueryStorage } from "./Database";

export const readLocalDir = (path = Platform.OS === "android" ? RNFS.ExternalStorageDirectoryPath : RNFS.MainBundlePath, justCheckAccess=false) => {
  const notHideRegExp = new RegExp("^[^.]");
  const isTextFileRegExp = new RegExp(".txt$");
  let folders = [];
  let textFiles = [];
  return readDir(path)
    .then(result => {
      if (justCheckAccess) return new Promise((resolve) => resolve({accessedStorage: result.length !== 0}));
      let temp_promises = [];
      for (let i=0, l=result.length; i<l; i++) {
        if (!notHideRegExp.test(result[i].name)) continue; // 带点的隐藏文件/夹将被过滤
        if (result[i].isDirectory()) {
          folders[folders.length] = result[i];
          temp_promises[folders.length-1] = new Promise((resolve) => readDir(result[i].path).then(result => resolve(result)));
        };
        if ( result[i].isFile() && isTextFileRegExp.test(result[i].name) ) {
          textFiles[textFiles.length] = result[i];
        }
      }
      return Promise.all(temp_promises).then(resolves => {
        for (let i=0, l=resolves.length; i<l; i++) folders[i].not_hide_items_count = resolves[i].filter(item => notHideRegExp.test(item.name)).length;
        folders.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
        textFiles.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
        console.log(result.length !== 0);
        return new Promise((resolve) => resolve({folders, textFiles, otherFiles_length: result.length - folders.length - textFiles.length, accessedStorage: result.length !== 0}))
      });
    })
};

export const readBackupFileThenParse = (txtFilePath, txtFileItem) => {
  if (txtFileItem.isFile() && txtFileItem.size > 1e6) return new Promise(resolve => resolve({IS_BACKUP_FILES: false, MSG: "暂不支持大文件导入。"}));
  return readFile(txtFilePath, "utf8")
    .then(txtRes => {
      // console.log(result);
      let PREFERENCES = {};
      let RECORDS = {};
      
      var p = /\[\w+:?(\w+="[\s\S]*")*\]/mg;
      var result;
      var config_ranges = [];
      while ((result = p.exec(txtRes)) != null) {
        config_ranges.push({section_header: result[0], last_content_txt_end_at: result.index, content_txt_begin_at: p.lastIndex});
      }
      // console.log("cfg range -->", config_ranges);
      let IS_BACKUP_FILES = config_ranges.length > 0;
      if (!IS_BACKUP_FILES) return new Promise(resolve => resolve({IS_BACKUP_FILES}));
      for (let i=0, l=config_ranges.length; i<l; i++) {
        const txt = config_ranges[i].content_txt = txtRes.slice(config_ranges[i].content_txt_begin_at, (i+1 in config_ranges) ? config_ranges[i+1].last_content_txt_end_at : undefined);
        const pattern = /^(\d*):?([\s\S]+?)=([\s\S]+?)$/;
        // console.info("txt --->", config_ranges[i], txt)
        let lines = txt.split(/[\r\n]+/);
        let temp = [];
        lines.filter(Boolean).forEach(line => {
          if (line.match(pattern)) {
            let [,index, key, value] = line.match(pattern);
            if (!(index in temp)) temp[index] = {};
            temp[index][key] = parseValue(value);
          }
        });
        
        config_ranges[i].parsed = temp;
      }
      // console.log(config_ranges);
      for (let i=0, l=config_ranges.length; i<l; i++) {
        if (config_ranges[i].section_header.includes("Preferences")) {
          var {theme, lang, game_mode, sound_volume, block_colors, prefer_colors}
            = config_ranges[i].parsed[""];
          PREFERENCES = {
            num_theme_mode: theme, 
            str_lang: lang, 
            current_game_mode: game_mode, 
            sound_volume: sound_volume, 
            block_color: block_colors, 
            prefer_color: prefer_colors,
          }
        } else if (config_ranges[i].section_header.includes("Record")) {
          // console.log(config_ranges[i].parsed)
          let [,player_name] = config_ranges[i].section_header.match(/player="([\s\S]*)"/) || [];
          if (!(player_name in RECORDS)) RECORDS[player_name] = config_ranges[i].parsed;
          
        } else {
          IS_BACKUP_FILES = false;
          break;
        }
      }
      return new Promise(resolve => resolve({PREFERENCES, RECORDS, IS_BACKUP_FILES}));
    })
    // .catch(error => {
    //   console.log(error);
    // })
};

export const checkAndroidFSPermissions = async ({ agreed=()=>{}, otherwise=()=>{}, test=()=>{} }) => {
  try {
    const granted = await PermissionsAndroid.requestMultiple(
      [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]/* ,
      {
        title: "Request Read & write External Storage Permissions",
        message: "需要授予设备的读写权限",
        buttonNeutral: "稍后",
        buttonNegative: "取消",
        buttonPositive: "确定",
      } */
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("OK");
      agreed();
    } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
      console.log("DENIED.");
      otherwise();
    } else {
      console.log("NEVER ASK AGAIN.")
      otherwise();
    }
    test();
  } catch (err) {
    console.warn(err);
  }
};

export const GetBackupRelease = (part) => {
  return multiQueryStorage([
    "num_theme_mode",
    "str_lang",
    "current_game_mode",
    "sound_volume",
    "blocks_color",
    "prefer_colors",
    "ranking_records",
  ]).then(valMap => {
    // console.log(valMap);
    const [
      num_theme_mode,
      str_lang,
      current_game_mode,
      sound_volume,
      blocks_color,
      prefer_colors,
      ranking_records,
    ] = valMap.values();
    if (part === "PREFERENCES") {
      return parsePreferences(
        {
          num_theme_mode, str_lang, current_game_mode, 
          sound_volume, blocks_color, prefer_colors
        });
    } else if (part === "RECORDS") {
      return parseRecords(ranking_records);
    } else {
      return Promise.all(
        [parsePreferences(
        {
          num_theme_mode, str_lang, current_game_mode, 
          sound_volume, blocks_color, prefer_colors
        }), parseRecords(ranking_records)]
      ).then(results => {
        return new Promise(resolve => resolve(results.join("\n\n")))
      })
    }
  })
};

const parsePreferences = ({ num_theme_mode, str_lang, current_game_mode, sound_volume, blocks_color, prefer_colors }) => {
  return new Promise(resolve => resolve([
    "[Preferences]",
    null,
    num_theme_mode && `theme=${num_theme_mode}`,
    str_lang && `lang="${str_lang}"`,
    current_game_mode && `game_mode=${current_game_mode}`,
    sound_volume && `sound_volume=${sound_volume}`,
    blocks_color && `block_colors=${blocks_color}`,
    prefer_colors && `prefer_colors=${prefer_colors}`,
  ].filter(Boolean).join("\n")));
};

const parseRecords = (ranking_records) =>{
  const records = JSON.parse(ranking_records);
  let txt = [];
  for (let player_name in records) {
    const record = records[player_name];
    txt.push(`[Record:player="${player_name}"]`, null)
    for (let i=0, l=record.length; i<l; i++) {
      txt.push(
        `${i}:scores=${record[i].scores}`,
        `${i}:start_timestamp="${record[i].start_timestamp}"`,
        `${i}:time_stamps=${record[i].time_stamps}`,
        `${i}:record_timestamp="${record[i].record_timestamp}"`,
        `${i}:grid_size=${record[i].grid_size}`,
        null
      )
    }
  };
  return new Promise(resolve => resolve(txt.join("\n")));
};

const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

export const ByteFormat = (bytes=0, decimal=2) => {
  if (bytes === 0) return "0 B";
  let x = 0, k =1024, bytes_copy = bytes;
  while (bytes_copy >= k) {
    bytes_copy /= k;
    x++;
  }
  return [
    parseFloat((bytes / Math.pow(k, x)).toFixed(decimal)), 
    sizes[x]
  ].join(" ");
};

function parseValue (str) {
  // const 
  // console.info(str);
  if (!str) return null;
  if (str.match(/^"([\s\S]*)"$/)) {
    return str.match(/^"([\s\S]*)"$/)[1]
  } 
  // else if (str.match(/^\d+$/)) {
  //   return parseInt(str);
  // }
  else {
    return str;
  }
}