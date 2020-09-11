import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView, View, Text, SectionList, ActivityIndicator, BackHandler, Animated, TouchableHighlight, StyleSheet, ToastAndroid } from "react-native";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import RNFS from "react-native-fs";

import { PageHeader, IconListItem, OptionOverlay, PlainBtn, SuccessBtn, NotificationBtn } from "../components";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { IconTextFile, IconDropDown, IconChevron, IconOutput, IconPreferences, IconRecords } from "../Icons";
import { dateFormat } from "../plugins/Time";
import { checkAndroidFSPermissions, readLocalDir, GetBackupRelease, ByteFormat, readBackupFileThenParse } from "../plugins/FS";
import { multiQueryStorage, setStorage } from "../plugins/Database";

import AsyncStorage from "@react-native-community/async-storage";

dateFormat();

export const FileExplorer = ({ navigation, route }) => {
  const { colors, dark } = useTheme();
  const [folderItems, setFolderItems] = useState([]);
  const [textFileItems, setTextFileItems] = useState([]);
  const [listLoaded, setListLoaded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentLocalPath, setCurrentLocalPath] = useState(RNFS.ExternalStorageDirectoryPath);
  // const [pageHeaderName, setPageHeaderName] = useState("");
  const [othersFileHeader, setOthersFileHeader] = useState("其他");
  
  const [optionOverlayVisibility, setOptionOverlayVisibility] = useState(false);
  const [optionOverlayMainTitle, setOptionOverlayMainTitle] = useState("");
  const [optionOverlayBody, setOptionOverlayBody] = useState(<></>);
  const [optionOverlayCaption, setOptionOverlayCaption] = useState("");
  const [ crumbs, setCrumbs ] = useState([]);
  useEffect(() => {
    // console.log(route.params)
    // checkAndroidFSPermissions({test() {
    //   readLocalDir()
    //     .then(results => {
    //       // console.log("results ==>", results);
    //       setFolderItems(results.folders);
    //       setTextFileItems(results.textFiles);
    //       setListLoaded(true);
    //     })
    //     .catch(error => {
    //       console.error(error);
    //     })
    // }});
  }, []);
  const handleListItemPressed = (item) => () => {
    if (item.isDirectory()) {
      setCurrentLocalPath(item.path);
      // setPageHeaderName(item.name);
    } 
    if (route.params?.action === "OUTPUT") return;
    if (item.isFile()) {
      setIsRunning(true);
      readBackupFileThenParse(item.path, item)
        .then(({IS_BACKUP_FILES, PREFERENCES, RECORDS, MSG}) => {
          setIsRunning(false);
          if (IS_BACKUP_FILES) {
            setOptionOverlayMainTitle("选择操作");
            setOptionOverlayBody(
              <View style={styles.optionOverlayContainer}>
                <Text style={[styles.optionOverlayParagraph, {color: colors.text, marginBottom: 12}]}>检测到游戏备份，请选择下一步要进行的操作。</Text>
                <PlainBtn title="导入偏好设置" onPress={() => {
                  setOptionOverlayVisibility(false);
                  setIsRunning(true);
                  GamePreferencesImport(PREFERENCES)
                    .then(f => {
                      setIsRunning(false);
                      ToastAndroid.show("偏好设置导入成功，重启生效。", ToastAndroid.SHORT);
                    })
                    .catch(error => {
                      setIsRunning(false);
                      console.error(error);
                    })
                }} />
                <PlainBtn title="导入游戏纪录" onPress={() => {
                  setOptionOverlayVisibility(false);
                  setIsRunning(true);
                  GameRecordsImport(RECORDS)
                    .then(f => {
                      setIsRunning(false);
                      ToastAndroid.show(`游戏纪录导入成功，排行榜已更新。\n导入${Object.values(RECORDS).flat().length}条纪录`, ToastAndroid.SHORT);
                    })
                    .catch(error => {
                      setIsRunning(false);
                      console.error(error)
                    })
                }} />
                <PlainBtn title="导入全部" onPress={() => {
                  setIsRunning(false);
                  setIsRunning(true);
                  setOptionOverlayVisibility(false);
                  GameRecordsImport(RECORDS)
                    .then(() => {
                      ToastAndroid.show("偏好设置导入成功，重启生效。", ToastAndroid.SHORT);
                      return GamePreferencesImport(PREFERENCES)
                    })
                    .then(() => {
                      setIsRunning(false);
                      ToastAndroid.show(`游戏纪录导入成功，排行榜已更新。\n导入${Object.values(RECORDS).flat().length}条纪录`, ToastAndroid.SHORT);
                    })
                    .catch(error => {
                      setIsRunning(false);
                      console.error(error)
                    })
                }} />
                <NotificationBtn title="取消" onPress={() => {
                  setOptionOverlayVisibility(false);
                  setIsRunning(false);
                }} />
              </View>
            )
            // console.log( "preferences --->", PREFERENCES )
            // console.log( "records --->", RECORDS )
          } else {
            setOptionOverlayMainTitle("提示");
            setOptionOverlayBody(
              <View style={styles.optionOverlayContainer}>
                <Text style={[styles.optionOverlayParagraph, {color: colors.text, marginBottom: 12, textAlign: "center"}]}>{MSG || "这不是一个有效的游戏备份文件。"}</Text>
                <PlainBtn title="取消" onPress={() => {
                  setOptionOverlayVisibility(false);
                  setIsRunning(false);
                }} />
              </View>
            )
          }
        })
      setOptionOverlayVisibility(true);
      setOptionOverlayMainTitle("请稍后");
      setOptionOverlayBody(
        <View style={styles.optionOverlayContainer}>
          <Text style={[styles.optionOverlayParagraph, {color: colors.text, marginBottom: 12, textAlign: "center"}]}>检测中…</Text>
          <PlainBtn title="取消" onPress={() => {
            setOptionOverlayVisibility(false);
            setIsRunning(false);
          }} />
        </View>
      )
    }
  };
  const readCurrentPathThenDisplay = (currentLocalPath) => {
    setListLoaded(false);
    readLocalDir(currentLocalPath)
      .then(results => {
        setFolderItems(results.folders);
        setTextFileItems(results.textFiles);
        setOthersFileHeader("其他 " + results.otherFiles_length);
        setListLoaded(true);
      })
      .catch(error => {
        console.error(error);
      });
  }
  useEffect(() => {
    readCurrentPathThenDisplay(currentLocalPath);
  }, [currentLocalPath]);
  const handleClickOutputBtn = () => {
    setOptionOverlayMainTitle("导出到…");
    setOptionOverlayVisibility(true);
    setOptionOverlayBody(<GameOutputFragment {...{setOptionOverlayVisibility, readCurrentPathThenDisplay, currentLocalPath, setIsRunning}} />);
  };
  
  const onBackPress = () => {
    const isStorageRootPath = crumbs.length === 0;
    if (!isStorageRootPath) {
      const n_crumbs = crumbs.slice(0,-1);
      setCurrentLocalPath(
        `${RNFS.ExternalStorageDirectoryPath}/` +
        n_crumbs.reduce((p,c) => [...p,c], []).join("/")
      );
    }
    console.log("crumbs--->", crumbs);
    console.log("currentLocalPath===>", currentLocalPath);
    if (isStorageRootPath) navigation.goBack();
    return true;
  };
  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress)
    })
  );
  return (
    <>
      <OptionOverlay
        visibility={optionOverlayVisibility}
        mainTitle={optionOverlayMainTitle}
        Body={optionOverlayBody}
        caption={optionOverlayCaption}
      />
      <SafeAreaView style={{flex: 1}}>
        <PageHeader navigation={navigation} handleTouchBackIconButton={onBackPress} name={route.params?.action === "OUTPUT" ? "导出" : "请选择要导入的.txt文本文件"} actionBtn={(() => {
          if (isRunning) {
            return (
              <View style={{flexDirection: "row", justifyContent: "flex-end", alignItems: "center"}}>
                <ActivityIndicator animating={isRunning} size={24} color={colors.primary} />
              </View>
            )
          } else {
              return route.params?.action === "OUTPUT" ? (
                <TouchableHighlight disabled={!listLoaded} style={{padding: 20, borderRadius: 34, opacity: listLoaded ? 1 : .25}} underlayColor="grey" onPress={handleClickOutputBtn}>
                  <IconOutput width={28} height={28} />
                </TouchableHighlight>
              ) : <></>
          }
        })()} 
        />
        <Breadcrumbs {...{/* setPageHeaderName, */ currentLocalPath, setCurrentLocalPath, crumbs, setCrumbs}} isLoading={!listLoaded} />
        {
          listLoaded ? (
            <SectionList
              stickySectionHeadersEnabled
              keyExtractor={({ name }) => name}
              renderItem={
                ({ item, index }) => item.isDirectory() ? (
                  <IconListItem key={"folder"+index} title={item.name} subtitle={`${item.not_hide_items_count} 项内容, ${item.mtime.format("yyyy-MM-dd hh:mm")}`} 
                    onPress={handleListItemPressed(item)}
                  />
                ) : (
                  <IconListItem key={"text_file"+index} title={item.name} subtitle={`${ByteFormat(item.size)}, ${item.mtime.format("yyyy-MM-dd hh:mm")}`} FrontIconVar={IconTextFile} EndIconVar={IconDropDown} 
                    onPress={handleListItemPressed(item)}
                  />
                )
              }
              renderSectionHeader={ ( {section: {title}, } ) => listLoaded ? <SectionHeader title={title} /> : <></>
              }
              sections={[
                {
                  title: "文本文件 " + textFileItems.length,
                  data: textFileItems
                },
                {
                  title: "文件夹 " + folderItems.length,
                  data: folderItems
                },
                {
                  title: othersFileHeader,
                  data: []
                }
              ]}
            />
          ) : <SectionList sections={[]} />
        }
      </SafeAreaView>
    </>
  )
};

const GamePreferencesImport = async (PREFERENCES) => {
  // console.log("handle --> PREFERENCES", PREFERENCES)
  // console.log("handled --> PREFERENCES", Object.entries(PREFERENCES).filter(entry => Boolean(entry[1])));
  try {
    await AsyncStorage.multiSet(
      Object.entries(PREFERENCES)
        .filter(entry => Boolean(entry[1]))
    )
  } catch (err) {
    console.error(err);
  }
}

function GameRecordsImport (RECORDS) {
  // console.log("handle --> RECORDS", RECORDS);
  return multiQueryStorage(["ranking_records"])
  .then(valMap => {
    // console.log(RECORDS);
    const ranking_records = JSON.parse(valMap.get("ranking_records")) || {};
    let updated_records = {};
    for (let player_name in RECORDS) {
      if (player_name in ranking_records) {
        updated_records[player_name] = [];
        for (let j=0, k=RECORDS[player_name].length; j<k; j++) {
          let copy = JSON.parse(JSON.stringify(RECORDS[player_name][j]));
          // console.log("length -->", RECORDS[player_name].length)
          for (let i=0, l=ranking_records[player_name].length; i<l; i++) {
            // console.log("player_name -->", RECORDS[player_name])
            // console.log("player_name j -->", j)
            // console.log("player_name j item -->", RECORDS[player_name][j])
            if (
              ranking_records[player_name][i].start_timestamp === copy.start_timestamp &&
              ranking_records[player_name][i].record_timestamp === copy.record_timestamp &&
              ranking_records[player_name][i].grid_size === copy.grid_size
            ) {
              RECORDS[player_name][j] = null;
            }
          }
        }
        updated_records[player_name] = RECORDS[player_name].concat(ranking_records[player_name]).filter(Boolean);
      } else {
        updated_records[player_name] = RECORDS[player_name];
      }
    }
    // console.log(updated_records)
    // console.log("updated records =>", updated_records);
    return setStorage("ranking_records", JSON.stringify(updated_records));
  })
}

function GameOutputFragment({ setOptionOverlayVisibility=()=>{}, readCurrentPathThenDisplay=()=>{}, currentLocalPath, setIsRunning=()=>{} }) {
  const {colors, dark} = useTheme();
  const [date, setDate] = useState(null);
  useEffect(() => {
    setDate(new Date());
  }, []);
  return (
    <>
      {
        date ? (
          <>
            <Text style={{color: colors.text, paddingHorizontal: 12, textAlign: "center"}}>{currentLocalPath}/</Text>
            <Text style={{color: colors.text, paddingHorizontal: 12, textAlign: "center", fontWeight: "bold", fontSize: 15, lineHeight: 24}}>{`backup_${date.format("yyyyMMdd[hhmmss-S]")}.txt`}</Text>
          </>
        ) : <></>
      }
      <View style={{marginVertical: 8}}>
        <IconListItem onPress={() => {
          handleBackupExport({
            part: "PREFERENCES", 
            currentLocalPath, date,
            setIsRunning, setOptionOverlayVisibility, readCurrentPathThenDisplay
          }, {
            onSuccess(txtFilePath) { ToastAndroid.show("成功导出偏好到：\n" + txtFilePath, ToastAndroid.LONG) },
            onError(err) { console.error(err) }
          });
        }} FrontIconVar={IconPreferences} title="导出游戏设置" subtitle="设置偏好、自定义的方块颜色" />
        <IconListItem onPress={() => {
          handleBackupExport({
            part: "RECORDS", 
            currentLocalPath, date,
            setIsRunning, setOptionOverlayVisibility, readCurrentPathThenDisplay
          }, {
            onSuccess(txtFilePath) { ToastAndroid.show("成功导出纪录到：\n" + txtFilePath, ToastAndroid.LONG) },
            onError(err) { console.error(err) }
          });
        }} FrontIconVar={IconRecords} title="导出纪录" subtitle="游戏4×4、5×5排行榜纪录" />
      </View>
      <View style={[styles.optionOverlayContainer, {paddingTop: 0, flexDirection: "row", alignItems: "center", justifyContent: "center"}]}>
        <PlainBtn onPress={() => {
          handleBackupExport({
            part: "ALL", 
            currentLocalPath, date,
            setIsRunning, setOptionOverlayVisibility, readCurrentPathThenDisplay
          }, {
            onSuccess(txtFilePath) { ToastAndroid.show("游戏数据成功备份到：\n" + txtFilePath, ToastAndroid.LONG) },
            onError(err) { console.error(err) }
          })
        }} title="导出全部" />
        <NotificationBtn title="稍后" onPress={() => setOptionOverlayVisibility(false)} />
      </View>
    </>
  )
};

function handleBackupExport({
  part, setIsRunning=()=>{}, setOptionOverlayVisibility=()=>{},
  currentLocalPath, date, readCurrentPathThenDisplay
}, {onSuccess, onError}) {
  setIsRunning(true);
  setOptionOverlayVisibility(false);
  ToastAndroid.show("正在导出…", ToastAndroid.SHORT);
  GetBackupRelease(part)
    .then(backups => {
      const txtFilePath = currentLocalPath + `/backup_${date.format("yyyyMMdd[hhmmss-S]")}.txt`;
      RNFS.writeFile(txtFilePath, backups, "utf8")
        .then(success => {
          onSuccess(txtFilePath, success);
          setIsRunning(false);
          readCurrentPathThenDisplay(currentLocalPath);
        })
        .catch(error => {
          onError(error);
          ToastAndroid.show("导出失败…", ToastAndroid.SHORT)
          setIsRunning(false);
        });
    })
    .catch(err => { onError(err) })
}

function SectionHeader({ title }) {
  const { colors, dark } = useTheme();
  return (
    <View style={{backgroundColor: dark ? "#131311" : "#ececee", paddingVertical: 8, paddingHorizontal: 16, justifyContent: "center"}}>
      <Text style={{color: colors.text, fontSize: 12, fontWeight: "bold"}}>{title}</Text>
    </View>
  )
}

const ESDP = new RegExp("^" + RNFS.ExternalStorageDirectoryPath);
function Breadcrumbs ({ currentLocalPath="", setCurrentLocalPath=()=>{}, crumbs=[], setCrumbs=()=>{}, isLoading=true, /* setPageHeaderName=()=>{} */ }) {
  const { colors, dark } = useTheme();
  useEffect(() => {
    setCrumbs(currentLocalPath.replace(ESDP, "").split("/").filter(Boolean));
  }, [currentLocalPath]);
  return (
    <View style={{height: 28, backgroundColor: dark ? "#131311" : "#ececee"}}>
      <ScrollView horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={{paddingHorizontal: 16, alignItems: "center"}}
        fadingEdgeLength={40}
      >
        <TouchableOpacity activeOpacity={.4} onPress={() => {
          setCurrentLocalPath(RNFS.ExternalStorageDirectoryPath);
        }}>
          <Text style={{color: colors.text, fontWeight: crumbs.length === 0 ? "bold" : "normal", fontSize: 14}}>内部存储</Text>
        </TouchableOpacity>
        {
          crumbs.map((item, index, arr) => (
            <React.Fragment key={item + index}>
              <IconChevron width={14} height={14} chevronDirection="right" fill={colors.text} style={{marginHorizontal: 4}} />
              <TouchableOpacity activeOpacity={.4} onPress={() => {
                setCurrentLocalPath(
                  `${RNFS.ExternalStorageDirectoryPath}/` +
                  crumbs.reduce((p,c,i) => index >= i ? [...p,c] : p, []).join("/")
                );
              }}>
                <Text style={{color: colors.text, fontSize: 14, fontWeight: arr.length - 1 === index ? "bold" : "normal"}}>{item}</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))
        }
        {
          isLoading ? (
            <View style={{paddingLeft: 4}}>
              <ActivityIndicator animating={isLoading} color="grey" size={12} />
            </View>
          ) : <></>
        }
      </ScrollView>
    </View>
  )
};

const styles = StyleSheet.create({
  optionOverlayContainer: {
    paddingVertical: 14, paddingHorizontal: 24
  },
  optionOverlayParagraph: {
    fontSize: 16, fontWeight: "bold", lineHeight: 25
  },
})