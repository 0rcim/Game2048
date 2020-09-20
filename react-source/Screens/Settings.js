import React, { useContext, useState, useEffect, useRef } from "react";
import { View, Text, SafeAreaView, ScrollView, ToastAndroid, PixelRatio, StyleSheet, Animated, Linking } from "react-native";
import { useTheme, DefaultTheme, DarkTheme, useNavigation } from "@react-navigation/native";
import { PageHeader, ListItem, OptionOverlay, NotificationBtn, StyledSlider, SuccessBtn, IconListItem } from "../components";

import CheckBox from "@react-native-community/checkbox";

import { IconDropDown, IconChevron, IconSound, IconImport, IconOutput, IconEmpty2048 } from "../Icons";

import { GlobalSettingsContext } from "../GlobalContext";
import Langs, { useLang } from "../I18n";

import { multiQueryStorage, setStorage } from "../plugins/Database";
import { readLocalDir, checkAndroidFSPermissions } from "../plugins/FS";
import { MAIN_FONT_NAME, soundClick, playSound } from "../plugins";
import { Easing } from "react-native-reanimated";
import AsyncStorage from "@react-native-community/async-storage";

const px = 1 / PixelRatio.get();

export const Settings = ({ navigation }) => {
  const { colors, dark } = useTheme();
  const { PAGE_SETTINGS: lang } = useLang();
  const {
    THEME: [CurrentTheme, ChangeGlobalTheme],
    LANG: [CurrentLang, ChangeCurrentLang],
    GAME_MODE: [CurrentGameMode, ChangeCurrentGameMode],
    SOUND_VOLUME: [CurrentSoundVolume, ChangeCurrentSoundVolume],
  } = useContext(GlobalSettingsContext);
  const [optionList, setOptionList] = useState([]);
  const [optionOverlayVisibility, setOptionOverlayVisibility] = useState(false);
  const [optionOverlayMainTitle, setOptionOverlayMainTitle] = useState("");
  const [optionOverlayBody, setOptionOverlayBody] = useState(<></>);
  const [optionOverlayCaption, setOptionOverlayCaption] = useState("");
  const [boolScreenBlurred, setBoolScreenBlurred] = useState(true);
  const [ currentPressedItemCaption, setCurrentPressedItemCaption ] = useState("");
  // 防止发生对上一页的误操作
  useEffect(() => navigation.addListener("blur", () => setBoolScreenBlurred(true)), [navigation]);
  useEffect(() => navigation.addListener("focus", () => setBoolScreenBlurred(false)), [navigation]);
  const releaseOptionOverlay =() => {
    setOptionList([]);
    setOptionOverlayMainTitle("");
    setOptionOverlayBody(<></>);
    setOptionOverlayCaption("");
    setCurrentPressedItemCaption("");
  };
  const handlePressedIn = (item_name) => () => {
    console.log(item_name)
    setCurrentPressedItemCaption(item_name);
  };
  const onPressOut = () => {

  };
  return (
    <>
    <OptionOverlay
      visibility={optionOverlayVisibility}
      optionList={optionList}
      mainTitle={optionOverlayMainTitle}
      Body={optionOverlayBody}
      caption={optionOverlayCaption}
      fullDisappearedDialogCallBack={() => releaseOptionOverlay()}
      selectedCallBack={(caption, item) => {
        // console.log("selectedItem-->", item, caption)
        switch (caption) {
          case "THEME": {
            setStorage("num_theme_mode", item.value)
              .then(f => {
                ChangeGlobalTheme(item.value);
                setOptionOverlayVisibility(false);
              })
              .catch(err => {
                console.log(err)
              })
            break;
          }
          case "LANG": {
            setStorage("str_lang", item.value)
              .then(f => {
                ChangeCurrentLang(item.value);
                setOptionOverlayVisibility(false);
              })
              .catch(err => {
                console.log(err)
              })
            break;
          }
          case "GAME_MODE": {
            setStorage("current_game_mode", item.value)
              .then(f => {
                ChangeCurrentGameMode(item.value);
                setOptionOverlayVisibility(false);
              })
              .catch(err => {
                console.log(err)
              });
            break;
          }
          default:
            setOptionOverlayVisibility(false);
            break;
        }
      }}
    />
    <SafeAreaView style={{flex: 1}}>
      <PageHeader navigation={navigation} name={lang.HEADER_SETTINGS} />
      <ScrollView
        fadingEdgeLength={60}
        persistentScrollbar={true}
      >
        {/* =======Theme======= */}
        <ListItem disabled={boolScreenBlurred} onPressIn={handlePressedIn("THEME")} title={lang.LIST_ITEM_CHOOSE_A_THEME} subtitle={dark ? lang.DARK_MODE : lang.LIGHT_MODE}
          onPress={() => {
            if ("THEME" !== currentPressedItemCaption) return;
            console.info("theme list item touched!!")
            multiQueryStorage(["num_theme_mode", "str_lang"])
              .then(valMap => {
                let lang = Langs[valMap.get("str_lang") || CurrentLang].PAGE_SETTINGS ;
                const optTheme = [
                  {title: lang.DARK_MODE, subtitle: "", value: 0},
                  {title: lang.LIGHT_MODE, subtitle: "", value: 1},
                ];
                let optList = optTheme.map(item => Object.assign({}, item, {
                  selected: (valMap.get("num_theme_mode") || CurrentTheme).toString() === item.value.toString()
                }));
                setOptionOverlayMainTitle(lang.LIST_ITEM_CHOOSE_A_THEME);
                setOptionList(optList);
                setOptionOverlayVisibility(true);
                setOptionOverlayCaption("THEME");
              })
          }}
        >
          <IconDropDown width={24} height={24} fill={colors.text} />
        </ListItem>
        {/* =======Language======= */}
        <ListItem disabled={boolScreenBlurred} onPressIn={handlePressedIn("LANG")} title={lang.LIST_ITEM_LANGUAGE} subtitle={Langs[CurrentLang].NAME_LANGUAGE}
          onPress={() => {
            if ("LANG" !== currentPressedItemCaption) return;
            console.info("lang list item touched!!")
            multiQueryStorage(["str_lang"])
              .then(valMap => {
                // console.log(CurrentLang);
                let lang = Langs[valMap.get("str_lang") || CurrentLang].PAGE_SETTINGS ;
                const optLang = [
                  {title: Langs.CN.NAME_LANGUAGE, subtitle: "", value: "CN"},
                  {title: Langs.EN.NAME_LANGUAGE, subtitle: "", value: "EN"},
                ];
                let optList = optLang.map(item => Object.assign({}, item, {
                  selected: (valMap.get("str_lang") || CurrentLang) === item.value.toString()
                }));
                setOptionOverlayMainTitle(lang.LIST_ITEM_LANGUAGE);
                setOptionList(optList);
                setOptionOverlayVisibility(true);
                setOptionOverlayCaption("LANG");
              })
          }}
        >
          <IconDropDown width={24} height={24} fill={colors.text} />
        </ListItem>
        {/* =======Game Mode======= */}
        <ListItem disabled={boolScreenBlurred} onPressIn={handlePressedIn("GAME_MODE")} title={lang.LIST_ITEM_GAME_MODE} subtitle={
            CurrentGameMode === 0 ? Langs[CurrentLang].PAGE_SETTINGS.SUBTITLE_GAME_MODE_CURRENT_DEFAULT_MODE : 
              Langs[CurrentLang].PAGE_SETTINGS.SUBTITLE_GAME_MODE_CURRENT_ENDLESS_MODE
          }
          onPress={() => {
            if ("GAME_MODE" !== currentPressedItemCaption) return;
            console.info("mode list item touched!!")
            multiQueryStorage(["current_game_mode", "str_lang"])
              .then(valMap => {
                let lang = Langs[valMap.get("str_lang") || CurrentLang].PAGE_SETTINGS ;
                const optGameMode = [
                  {title: lang.DEFAULT_MODE, subtitle: lang.SUBTITLE_GAME_MODE_DEFAULT_MODE, value: 0},
                  {title: lang.ENDLESS_MODE, subtitle: lang.SUBTITLE_GAME_MODE_ENDLESS_MODE, value: 1},
                ];
                let optList = optGameMode.map(item => Object.assign({}, item, {
                  selected: (valMap.get("current_game_mode") || CurrentGameMode).toString() === item.value.toString()
                }));
                setOptionOverlayMainTitle(lang.LIST_ITEM_GAME_MODE);
                setOptionList(optList);
                setOptionOverlayVisibility(true);
                setOptionOverlayCaption("GAME_MODE");
              })
          }}
        >
          <IconDropDown width={24} height={24} fill={colors.text} />
        </ListItem>
        {/* =======Sound Volume======= */}
        <ListItem disabled={boolScreenBlurred} onPressIn={handlePressedIn("SOUND_VOLUME")} title={lang.LIST_ITEM_SOUND_VOLUME} subtitle={CurrentSoundVolume*100 + "%"}
          onPress={() => {
            if ("SOUND_VOLUME" !== currentPressedItemCaption) return;
            console.info("volume list item touched!!")
            multiQueryStorage(["sound_volume", "str_lang"])
              .then(valMap => {
                let lang = Langs[valMap.get("str_lang") || CurrentLang].PAGE_SETTINGS ;
                setOptionOverlayMainTitle(lang.LIST_ITEM_SOUND_VOLUME);
                setOptionOverlayVisibility(true);
                setOptionOverlayCaption("SOUND_VOLUME");
                setOptionOverlayBody(<GameSoundVolume />)
              })
          }}
        >
          <IconDropDown width={24} height={24} fill={colors.text} />
        </ListItem>
        {/* =======Blocks color editor screen======= */}
        <ListItem disabled={boolScreenBlurred} onPressIn={handlePressedIn("NAVIGATE_TO_BLOCK_COLOR_EDITOR_SCREEN")} title={lang.LIST_ITEM_BLOCKS_COLOR_EDITOR}
          onPress={() => {
            if ("NAVIGATE_TO_BLOCK_COLOR_EDITOR_SCREEN" !== currentPressedItemCaption) return;
            console.info("B list item touched!!")
            navigation.navigate({name: "BlocksColorEditorScreen", key: "BLOCKS_COLOR_EDITOR"});
          }}
        >
          <IconChevron chevronDirection="right" fill={colors.text} width={24} height={24} />
        </ListItem>
        <ListSectionTitle content={lang.SECTION_TITLE_OTHERS} />
        {/* =======Game backup & import======= */}
        <ListItem onPressIn={handlePressedIn("GAME_BACKUP_IMPORT")} title="备份和导入" subtitle="（需要设备的读写权限）排行纪录、偏好设置等导入导出" disabled={boolScreenBlurred} 
          onPress={() => {
            if ("GAME_BACKUP_IMPORT" !== currentPressedItemCaption) return;
            setOptionOverlayVisibility(true);
            setOptionOverlayMainTitle("选择操作");
            setOptionOverlayCaption("GAME_BACKUP_IMPORT");
            setOptionOverlayBody(
              <GameBackupImportFragment navigation={navigation} />
            );
          }}
        >
          <IconDropDown width={24} height={24} fill={colors.text} />
        </ListItem>
        {/* =======Game reset======= */}
        <ListItem onPressIn={handlePressedIn("GAME_RESET")} disabled={boolScreenBlurred} title={lang.GAME_RESET} subtitle={lang.RESET_GAME_CACHE_AND_RECORDS} 
          onPress={() => {
            if ("GAME_RESET" !== currentPressedItemCaption) return;
            setOptionOverlayMainTitle(lang.GAME_RESET);
            setOptionOverlayVisibility(true);
            setOptionOverlayCaption("GAME_RESET");
            setOptionOverlayBody(
              <GameResetFragment {...{setOptionOverlayVisibility}} />
            );
          }}
        />
        {/* =======Open source license======= */}
        <ListItem onPressIn={handlePressedIn("ABOUT")} disabled={boolScreenBlurred} title={lang.OPEN_SOURCE_LICENSES} subtitle="v0.20.09"
          onPress={() => {
            if ("ABOUT" !== currentPressedItemCaption) return;
            setOptionOverlayMainTitle("开源相关");
            setOptionOverlayVisibility(true);
            setOptionOverlayCaption("ABOUT");
            setOptionOverlayBody(
              <GameAboutFragment {...{setOptionOverlayVisibility}} />
            );
          }}
        >
          <IconDropDown width={24} height={24} fill={colors.text} />
        </ListItem>
      </ScrollView>
    </SafeAreaView>
    </>
  )
};

const GameAboutFragment = () => {
  const {colors, dark} = useTheme();
  return (
    <>
      <View style={{alignItems: "center", marginTop: 12}}>
        <IconEmpty2048 />
      </View>
      <ListItem title="Source Code" subtitle="GitHub @0rcim/Game2048"
        onPress={() => {
          Linking.openURL("https://github.com/0rcim/Game2048");
        }}
      />
      <ListItem title="Version" subtitle="v0.20.09" />
      <ListItem title="Email" subtitle="jiangzheng4321@gmail.com"
        onPress={() => {
          Linking.openURL("mailto:jiangzheng4321@gmail.com");
        }}
      />
      <ListItem title="GitHub" subtitle="© 2020 Orcim"
        onPress={() => {
          Linking.openURL("https://github.com/0rcim");
        }}
      />
    </>
  )
}

function GameBackupImportFragment({ navigation }) {
  const {colors, dark} = useTheme();
  return (
    <View style={{paddingBottom: 12}}>
      <IconListItem title="导入" subtitle="从.txt文本进行导入" FrontIconVar={IconImport} 
        onPress={() => checkBeforeNavigate2FileExplorerScreen(
          navigation, 
          {
            name: "FileExplorer", 
            key: "FILE_EXPLORER", 
            params: { action: "IMPORT" }
          }
        )} />
      <IconListItem title="导出" subtitle="导出游戏设置和纪录" FrontIconVar={IconOutput} 
        onPress={() => checkBeforeNavigate2FileExplorerScreen(
          navigation, 
          {
            name: "FileExplorer", 
            key: "FILE_EXPLORER", 
            params: { action: "OUTPUT" }
          }
        )} />
    </View>
  )
};

function checkBeforeNavigate2FileExplorerScreen ( navigation, nav_config ) {
  checkAndroidFSPermissions({
    test() {
      readLocalDir(undefined, true)
        .then(results => {
          console.log("results ==>", results.accessedStorage);
          // if (results.accessedStorage) navigation.navigate("FileExplorer");
          // else ToastAndroid.show("需要在设备系统设置中授予软件读/写权限。", ToastAndroid.LONG);
          if (results.accessedStorage) {
            navigation.navigate(nav_config);
          } else {
            ToastAndroid.show("需要在设备系统设置中授予软件读/写权限。", ToastAndroid.LONG);
          }
        })
        .catch(error => {
          console.error(error);
          ToastAndroid.show("需要在设备系统设置中授予软件读/写权限。", ToastAndroid.LONG);
        })
    }
  });
}

function GameSoundVolume () {
  const {colors, dark} = useTheme();
  const {
    SOUND_VOLUME: [CurrentSoundVolume, ChangeCurrentSoundVolume]
  } = useContext(GlobalSettingsContext);
  const { SOUND_VOLUME } = useContext(GlobalSettingsContext);
  const [soundVolume, setSoundVolume] = useState(CurrentSoundVolume*100);
  const [onSlidingCompleteVal, setOnSlidingComplete] = useState(CurrentSoundVolume*100);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(.56)).current;
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };
  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: .56,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };
  const zoomIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };
  const zoomOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 50,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };
  const saveVolume = (val) => {
    setStorage("sound_volume", val)
      .then(f => {

      })
      .catch(error => {
        console.error(error)
      })
  };
  useEffect(() => {
    console.log("slide end", onSlidingCompleteVal);
    soundClick.setVolume(onSlidingCompleteVal/100);
    soundClick.play();
    // playSound(soundClick, SOUND_VOLUME);
    if (onSlidingCompleteVal === 0) {
      zoomIn();
      fadeOut();
    } else if (onSlidingCompleteVal > 0) {
      zoomOut();
      fadeIn();
    };
    ChangeCurrentSoundVolume(onSlidingCompleteVal/100);
    setSoundVolume(onSlidingCompleteVal);
    saveVolume(onSlidingCompleteVal);
  }, [onSlidingCompleteVal]);
  return (
    <View style={styles.optionOverlayContainer}>
      <View style={{alignItems: "center", flexDirection: "row", justifyContent: "center", marginBottom: 16}}>
        <StyledSlider 
          labelArray={[
            (
              <Animated.View style={{width: 32, height: 32, overflow: "hidden", justifyContent: "center", alignItems: "center", position: "relative", opacity: fadeAnim}}>
                <IconSound width={25} height={25} fill={colors.text} />
                <Animated.View style={[StyleSheet.absoluteFill, {width: "100%", height: "100%", justifyContent: "center", rotation: 45, scaleX: scaleAnim, scaleY: scaleAnim}]}>
                  <View style={{width: "100%", height: 2.5, backgroundColor: dark ? "#222325" : "#fff"}} />
                  <View style={{width: "100%", height: 2, backgroundColor: colors.text}} />
                </Animated.View>
              </Animated.View>
            )
          ]}
          value={soundVolume} 
          steps={[1]} 
          onSlidingComplete={setOnSlidingComplete}
          minimumValues={[0]} 
          maximumValues={[100]}
          index={0} />
      </View>
      <SuccessBtn title="重置" onPress={() => {
        setSoundVolume(80);
        setOnSlidingComplete(80);
        ChangeCurrentSoundVolume(80/100);
        saveVolume(80);
      }} />
    </View>
    
  )
};

function GameResetFragment ({ setOptionOverlayVisibility=()=>{} }) {
  const {colors, dark} = useTheme();
  const [clearSettingsChecked, setClearSettingsChecked] = useState(false);
  const [clearRecordsChecked, setClearRecordsChecked] = useState(false);
  return (
    <>
      {/* <View style={styles.optionOverlayContainer}>
        <Text style={[styles.optionOverlayParagraph, {color: colors.text, alignSelf: "center"}]}>选择要重置或清除的项</Text>
      </View> */}
      <View style={{paddingTop: 12}}>
        <ListItem title="游戏设置" subtitle="游戏设置将会重置" onPress={() => setClearSettingsChecked(!clearSettingsChecked)}>
          <CheckBox /* tintColor={colors.text} */ value={clearSettingsChecked} tintColors={{true: colors.text, false: "grey"}}
            /* lineWidth={2}
            boxType={'circle'}
            tintColor={'#9E663C'}
            onCheckColor={'#6F763F'}
            onFillColor={'#4DABEC'}
            onTintColor={'#F4DCF8'}
            disabled={false}
            onAnimationType={'bounce'}
            offAnimationType={'stroke'} *//>
        </ListItem>
        <ListItem title="排行纪录" subtitle="清空游戏排行数据" onPress={() => setClearRecordsChecked(!clearRecordsChecked)}>
          <CheckBox tintColor={colors.text} value={clearRecordsChecked} tintColors={{true: colors.text, false: "grey"}} />
        </ListItem>
      </View>
      <View style={[styles.optionOverlayContainer, {paddingTop: 0}]}>
        <NotificationBtn  title="删除已选项" onPress={(() => {
          setOptionOverlayVisibility(false);
          let todo = [];
          clearSettingsChecked && todo.push(
            AsyncStorage.multiRemove([
              "num_theme_mode", "str_lang",
              "current_game_mode", "sound_volume",
              "blocks_color", "prefer_colors", 
              "saved_player_name"
          ]));
          clearRecordsChecked && todo.push(
            AsyncStorage.removeItem("ranking_records")
          );
          Promise.all(todo)
            .then(f => {
              console.log("Done...")
              ToastAndroid.show(`操作成功${clearSettingsChecked ? "，部分设置将在游戏重启后生效" : ""}。`, ToastAndroid.LONG);
            })
            .catch(err => {
              console.err(err);
            });

        })} />
      </View>
    </>
  )
}

function ListSectionTitle({ content="Section title" }) {
  const {colors, dark} = useTheme();
  return (
    <View style={{borderBottomColor: dark ? "grey" : "#bbb", marginHorizontal: 16, marginTop: 48, paddingBottom: 4, borderBottomWidth: px}}>
      <Text style={{color: dark ? "grey" : "#aaa", fontFamily: MAIN_FONT_NAME, textTransform: "capitalize", fontSize: 16}}>{content}</Text>
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