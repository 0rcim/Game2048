# Game 2048

A mobile game built with React Native. 

一个简单的2048游戏：在游戏界面上下左右滑动操作，相邻且相同的数字方块会合并为两倍值的新方块并加上相应数值分数。同时，在每次滑动后，会随机生成一个“2方块”，当游戏方格被填满且无相邻相同的数字方块时，游戏结束。

[下载Release版本/apk安装包等](https://github.com/0rcim/Game2048/releases)

## Screenshot

![2048 Game](https://raw.githubusercontent.com/0rcim/Game2048/master/screenshots/PRO6_PLUS_2560x1440.jpg?raw=true)

## Features

* 支持切换游戏明、暗两种主题
* 方块颜色自定义/编辑功能
* 支持游戏重置；支持游戏偏好、排行纪录以.txt文件形式导入/导出
* 4x4、5x5两种游戏模式
* 支持游戏音效，音量大小调节
* 排行榜

## Dependencies

* [react-native-community_async-storage](https://github.com/reason-react-native/async-storage)、[react-native-community_checkbox](https://github.com/react-native-community/react-native-checkbox)、[react-native-community_slider](https://github.com/react-native-community/react-native-slider)
* [react-native-fs](https://github.com/itinance/react-native-fs)
* [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler)
* [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated)
* [react-native-sound](https://github.com/zmxv/react-native-sound)
* [react-native-splash-screen](https://github.com/crazycodeboy/react-native-splash-screen)
* [react-native-svg](https://github.com/react-native-community/react-native-svg)
* [react-navigation](https://github.com/react-navigation/react-navigation)
* ……

## Scripts

```sh
# build
npm run release
```