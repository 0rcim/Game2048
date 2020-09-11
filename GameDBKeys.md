## 游戏存储字段名

| key name          | type     | comment                            |
| :---------------- | :------- | :--------------------------------- |
| num_theme_mode    | `number` | `0` 暗色系；`1` 亮色系             |
| str_lang          | `string` | `CN` 中文；`EN` English            |
| current_game_mode | `number` | `0` 普通模式，`1` 无尽模式         |
| sound_volume      | `number` | `0~100`的整数，为`0`表示关闭音效   |
| blocks_color      | `string` | 数字从2~2^16的方块色，以逗号分隔开 |
| prefer_colors     | `string` | 自定义添加的颜色                   |
| ranking_records   | `JSON`   | 排行榜                             |
| saved_player_name | `string`   | 玩家名称（自行修改）               |

```ts
interface ranking_records {
  [player_name: string]: record[];
}
interface record {
  grid_size: 4|5,
  time: number,
  scores: number[] -> string,
  start_timestamp: DateISOString,
  time_stamps: number[] -> string,
  record_timestamp: DateISOString,
}
```

## 游戏导出的.txt文件内容格式

```log
[Preferences]
theme=0
lang="CN"
game_mode=0
sound_volume=80
block_colors=#fff,#ccc,#fdf...
prefer_colors=...

[Record:player="test"]
（玩家名称）

0:scores=0,4,0,8,0,0,0,8... 
0:start_timestamp="2020-09-04T06:02:20.069Z"
0:time_stamps=0,560,1850,4520,9600,1200,...
0:record_timestamp="2020-09-04T06:06:43.288Z"
0:grid_size=5

1:scores=0,4,0,8,0,0,0,8... (每步得分)
1:start_timestamp="2020-09-04T06:02:20.069Z" (开始移动第一步的时间)
1:time_stamps=0,560,1850,4520,9600,1200,... (每步间隔时间，单位毫秒)
1:record_timestamp="2020-09-04T06:06:43.288Z" (纪录创建时间)
1:grid_size=5(该条纪录游戏方格尺寸)


[Record:player="test2",grid_size=4]

0:scores=0,4,0,8,0,0,0,8... 
0:start_timestamp="2020-09-04T06:02:20.069Z"
0:time_stamps=0,560,1850,4520,9600,1200,...
0:record_timestamp="2020-09-04T06:06:43.288Z"
0:grid_size=5

2020-09-04 08:16:56.456
```