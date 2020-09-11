import React, { useState, useContext, useRef, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, StyleSheet, useWindowDimensions, PixelRatio, Animated, Pressable, TouchableOpacity, ActivityIndicator, ToastAndroid } from "react-native";
import { useTheme, CommonActions } from "@react-navigation/native";

import { PageHeader, Grid, GridPropsContext, Button, SuccessBtn, NotificationBtn, PlainBtn, ColorGridScrollList, BlockTypesMap, Block } from "../components";
import { NamedColorsMaps, NamedColors, ColorUtils } from "../plugins";
import { IconChevron, IconRainbow, IconRestore, IconCoffee } from "../Icons";
import { useLang } from "../I18n";
import { TouchableHighlight } from "react-native-gesture-handler";

import { multiQueryStorage, setStorage } from "../plugins/Database";

const px = 1 / PixelRatio.get();

let storeBlockColors = [];
let storePreferColors = [];

export const BlocksColorEditorPage = ({ navigation, route }) => {
  const { colors, dark } = useTheme();
  const { PAGE_BLOCKS_COLOR_EDITOR: lang, PAGE_SETTINGS: lang_SETTINGS } = useLang();
  const blockNumPerScreen = 3;
  const [{size, gapRate}] = useState({
    size: 128, gapRate: .2,
  });
  const scrollX = useRef(new Animated.Value(.64)).current;
  const [pageWindowWidth, setPageWindowWidth] = useState(0);
  useEffect(() => {
    setPageWidth(pageWindowWidth / blockNumPerScreen);
  }, [pageWindowWidth]);
  const [pageWidth, setPageWidth] = useState(pageWindowWidth / blockNumPerScreen);
  const [templateColorsNum, setTemplateColorsNum] = useState(0);
  const [showTemplateColorListIndicator, setShowTemplateColorListIndicator] = useState(true);
  const [showPreferColorListIndicator, setShowPreferColorListIndicator] = useState(true);
  const maxTemplateColorsNum = Object.keys(NamedColors).length;
  const minTemplateColorsNum = 65;
  const [globalBlockTypesMap, setGlobalBlockTypesMap] = useState([]);
  const [currentPageNum, setCurrentPageNum] = useState(0);
  const [shouldDisableScrollViewGesture, setShouldDisableScrollViewGesture] = useState(false);
  const [preferColorSetArray, setPreferColorSetArray] = useState([]);
  const scrollViewRef = useRef(null);
  const templateColorListScrollViewRef = useRef(null);
  const preferColorListScrollViewRef = useRef(null);
  const onMomentumScrollEnd = () => {
    setCurrentPageNum(Math.round(scrollX._value / pageWidth));
    setShouldDisableScrollViewGesture(false);
  };
  const handleBlockPressed = (idx) => () => {
    scrollViewRef.current.scrollTo({
      x: idx*pageWidth,
    });
    setCurrentPageNum(idx);
  };
  const handleLongPressPreferColorGrids = (index) => () => {
    navigation.navigate({name: "ColorPickerScreen", key: "BLOCKS_COLOR_PICKER", 
      params: {action: "UPDATE_COLOR", color: preferColorSetArray[index], indexOfThePreferColor: index}
    })
  };
  const setRandomBlockTypesMap = () => {
    let random_number_arr = [];
    const color_names = Object.keys(NamedColors);
    while (random_number_arr.length < 16) {
      random_number_arr.push(
        Math.random()*color_names.length << 0
      )
    };
    const copy = JSON.parse(JSON.stringify(BlockTypesMap));
    setGlobalBlockTypesMap(
      copy.map((item, index) => {
        item.fill = ColorUtils(color_names[random_number_arr[index]]).hex();
        return item;
      })
    );
  };
  useEffect(() => {
    multiQueryStorage(["blocks_color", "prefer_colors"])
      .then(valMap => {
        // console.log("valMap", valMap);
        const stored_blocks_color = valMap.get("blocks_color");
        if (stored_blocks_color) {
          const copy = JSON.parse(JSON.stringify(BlockTypesMap));
          const stored_colors_arr = stored_blocks_color.split(",");
          copy.map((item, index) => {
            item.fill = stored_colors_arr[index];
            return item;
          });
          setGlobalBlockTypesMap(copy);
        } else {
          const copy = JSON.parse(JSON.stringify(BlockTypesMap));
          setGlobalBlockTypesMap(
            copy.map(item => {
              item.fill = ColorUtils(item.fill).hex();
              return item;
            })
          );
        }
        const stored_prefer_colors = valMap.get("prefer_colors");
        
        if (stored_prefer_colors) {
          console.log("prefer colors exist.");
          setPreferColorSetArray(stored_prefer_colors.split(","))
        } else {
          setPreferColorSetArray(["#FF00F2", "#F7F5FF"]);
          console.info("prefer color not exist.")
        }
        setShowPreferColorListIndicator(false);
      })
    ;
    setTemplateColorsNum(minTemplateColorsNum);
    setShowTemplateColorListIndicator(false);
  }, []);
  useEffect(() => {
    if (templateColorsNum >= maxTemplateColorsNum) setShowTemplateColorListIndicator(false);
  }, [templateColorsNum]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const storePreferColors = (new_prefer_colors_arr=[]) => 
        setStorage("prefer_colors", new_prefer_colors_arr.join())
        .then(f => {
          // console.log(f)
          console.info("自定义颜色已保存")
        })
        .catch(err => {
          console.error(err)
        });
      const action = route.params?.action;
      console.log("blocks editor page is focused");
      if (action === "ADD_NEW_PREFER_COLOR") {
        const new_prefer_colors_arr = [...preferColorSetArray, route.params.color]
        setPreferColorSetArray(new_prefer_colors_arr);
        storePreferColors(new_prefer_colors_arr);
      } else if (action === "UPDATE_PREFER_COLOR") {
        let copy = preferColorSetArray.slice();
        copy.splice(route.params.indexOfThePreferColor, 1, route.params.color);
        setPreferColorSetArray(copy);
        storePreferColors(copy);
      } else if (action === "DELETE_PREFER_COLOR") {
        let copy = preferColorSetArray.slice();
        copy.splice(route.params.indexOfThePreferColor, 1);
        setPreferColorSetArray(copy);
        storePreferColors(copy);
      }
    });

    return unsubscribe;
  });
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.log("blocks color editor page blurred");
      console.log(storePreferColors.join())
    });

    return unsubscribe;
  });
  useEffect(() => {
    storeBlockColors = globalBlockTypesMap.map(i => i.fill);
  }, [globalBlockTypesMap])
  useEffect(() => {
    console.log("---> prefer colors arr changed...", preferColorSetArray);
    storePreferColors = JSON.parse(JSON.stringify(preferColorSetArray));
  }, [preferColorSetArray]);
  return (
    <>
    <GridPropsContext.Provider value={{size, gapRate}}>
      <SafeAreaView style={{position: "relative"}} onLayout={(event) => setPageWindowWidth(event.nativeEvent.layout.width)}>
        <ScrollView
          fadingEdgeLength={60}
          contentContainerStyle={{paddingBottom: 56}}
        >
          <PageHeader navigation={navigation} name={lang_SETTINGS.LIST_ITEM_BLOCKS_COLOR_EDITOR} 
            actionBtn={
              <TouchableHighlight style={{padding: 20, borderRadius: 34}} underlayColor="grey" onPress={setRandomBlockTypesMap}>
                <IconCoffee width={28} height={28} fill={colors.text} />
              </TouchableHighlight>
            }
          />
          <BlocksDisplay height={180} {...{pageWidth, scrollX, globalBlockTypesMap, scrollViewRef, onMomentumScrollEnd, handleBlockPressed, shouldDisableScrollViewGesture, currentPageNum, /* colorIndex, currentPageNum, controlZoomInAnim */}} />
          <View style={{padding: 16, borderBottomColor: colors.border, borderBottomWidth: px}}>
            <View style={{backgroundColor: dark ? "#222325" : "#fff", borderRadius: 10, padding: 16, marginTop: 10}}>
              <View style={{padding: 16, justifyContent: "center", alignSelf: "center"}}><Text style={{color: "grey", fontSize: 14, fontWeight: "bold"}}>{lang.BASIC_COLORS}</Text></View>
              <ColorGridScrollList 
                {
                  ...{ 
                    globalBlockTypesMap, 
                    setGlobalBlockTypesMap, 
                    currentPageNum
                  }
                }
                colorsListScrollViewRef={templateColorListScrollViewRef}
                showIndicator={showTemplateColorListIndicator}
                expandBtnChevronDirection={maxTemplateColorsNum > templateColorsNum ? "bottom" : "top"}
                colorSetArray={[...NamedColorsMaps["index->name|color"].values()].slice(0, templateColorsNum).map(i => i.color)}
                handlePressExpandBtn={() => {
                  const shouldShowMoreColors = maxTemplateColorsNum > templateColorsNum;
                  if (shouldShowMoreColors) {
                    setShowTemplateColorListIndicator(true);
                  } else {
                    templateColorListScrollViewRef.current.scrollTo({x: 0, animated: true});
                  };
                  setTemplateColorsNum(shouldShowMoreColors ? maxTemplateColorsNum : minTemplateColorsNum);
                }}
              />
              <View style={{backgroundColor: dark ? "#000000aa" : "#00000011", marginTop: 12, flex: 1, padding: 12, borderRadius: 10}}>
                <View style={{padding: 16, justifyContent: "center", alignSelf: "center"}}><Text style={{color: "grey", fontSize: 14, fontWeight: "bold"}}>{lang.CUSTOM_COLORS}</Text></View>
                <View style={{marginTop: -8, justifyContent: "center", alignSelf: "center"}}><Text style={{color: "#444", fontSize: 14, fontWeight: "bold"}}>{lang.LONG_PRESS_TO_EDIT_COLOR}</Text></View>
                <ColorGridScrollList
                  {
                    ...{
                      globalBlockTypesMap, 
                      setGlobalBlockTypesMap, 
                      currentPageNum
                    }
                  }
                  colorsListScrollViewRef={preferColorListScrollViewRef}
                  showIndicator={showPreferColorListIndicator/* false */}
                  colorSetArray={preferColorSetArray}
                  rowNumber={2}
                  showExpandBtn={false}
                  handlePressExpandBtn={() => {
                    console.log("pressed prefer color list item")
                  }}
                  onLongPressGrids={handleLongPressPreferColorGrids}
                />
                <View style={{alignItems: "center"}}>
                  <TouchableOpacity activeOpacity={.5} underlayColor={colors.card} onPress={() => {
                    navigation.dispatch(CommonActions.setParams({action: ""}));
                    navigation.navigate({name: "ColorPickerScreen", key: "BLOCKS_COLOR_PICKER", params: {action: "ADD_COLOR"}})
                  }}>
                    <View style={{paddingVertical: 12, paddingHorizontal: 16, borderRadius: 6, overflow: "hidden", borderWidth: px, borderColor: colors.border, backgroundColor: dark ? "#222325" : "#fff"}}>
                      <Text style={{color: colors.text}}>{lang.ADD_COLOR}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <View style={{backgroundColor: dark ? "#222325" : "#fff", position: "absolute", bottom: 0, width: "100%", height: 56, flexDirection: "row", justifyContent: "center", alignItems: "center", borderTopColor: colors.backgroundColor, borderTopWidth: px}}>
        <SuccessBtn title={lang.SAVE} onPress={() => {
          console.log(storeBlockColors);
          setStorage("blocks_color", storeBlockColors.join())
            .then(f => {
              ToastAndroid.show(lang.SAVED, ToastAndroid.SHORT)
            })
            .catch(err => {
              console.log(err)
            })
        }} />
        <NotificationBtn title={lang.DISCARD} onPress={() => {
          navigation.goBack();
        }} />
        <SuccessBtn title={lang.RESET_TO_DEFAULT} onPress={() => {
          setGlobalBlockTypesMap(
            BlockTypesMap.map(item => {
              item.fill = ColorUtils(item.fill).hex();
              return item;
            })
          )
        }} />
      </View>
    </GridPropsContext.Provider>
    </>
  )
};

function BlocksDisplay({ height=160, pageWidth, scrollX, globalBlockTypesMap, scrollViewRef, onMomentumScrollEnd, handleBlockPressed, shouldDisableScrollViewGesture, currentPageNum, /* colorIndex, currentPageNum, controlZoomInAnim */ }) {
  const { colors, dark } = useTheme();
  if (globalBlockTypesMap.length === 0) {
    return (
      <>
        <View style={{position: "relative", height: height}}>
          <View style={[StyleSheet.absoluteFill, {width: "100%", height: height, zIndex: 2, alignItems: "center", justifyContent: "center"}]}>
            <ActivityIndicator size={50} color={colors.primary} animating={globalBlockTypesMap.length === 0} />
          </View>
        </View>
        <View style={{height: 40}} />
      </>
    )
  }
  return (
    <>
      <View style={{position: "relative", height: height}}>
        <NumberBlockScrollView {...{ height, pageWidth, scrollViewRef, scrollX, onMomentumScrollEnd, globalBlockTypesMap, handleBlockPressed, currentPageNum }} />
        {shouldDisableScrollViewGesture ? <View style={[StyleSheet.absoluteFill, {left: 0, top: 0, width: "100%", height: "100%", zIndex: 1}]} /> : <></>}
      </View>
      <BlocksDisplayIndicator {...{scrollX, pageWidth, globalBlockTypesMap, handleBlockPressed}} />
    </>
  )
};

function NumberBlockScrollView({ height, pageWidth, scrollViewRef, scrollX, onMomentumScrollEnd, globalBlockTypesMap, handleBlockPressed, currentPageNum }) {
  const { colors, dark } = useTheme();
  return (
    <ScrollView style={{height, /* backgroundColor: dark ? "#000" : "#fff" */}} 
      horizontal={true} showsHorizontalScrollIndicator={false}
      pagingEnabled
      snapToInterval={pageWidth}
      ref={scrollViewRef}
      onScroll={Animated.event([
        {
          nativeEvent: {
            contentOffset: {
              x: scrollX
            }
          }
        }
      ], { useNativeDriver: false})}
      onMomentumScrollEnd={onMomentumScrollEnd}
    >
      <View style={{/* justifyContent: "center", alignItems: "center",  */flex: 1, width: pageWidth}} />
      {
        globalBlockTypesMap.map((item, index) => {
          return (
            <Animated.View key={"block" + index}
              style={
                [
                  {flex: 1, width: pageWidth, justifyContent: "flex-end", alignItems: "center"}, 
                  {transform: [{
                    scale: scrollX.interpolate({
                      inputRange: globalBlockTypesMap.map((i,d) => d*pageWidth),
                      outputRange: globalBlockTypesMap.map((i, d) => d === index ? 1 : .64),
                      // extrapolate: "clamp"
                    })
                  }]}
                ]
              }
            >
              <Pressable onPress={handleBlockPressed(index)}>
                <Block key={"cell"+index} INDEX={index} globalBlockTypesMap={globalBlockTypesMap} elevation={5}/*  currentPageNum={currentPageNum} controlZoomInAnim={controlZoomInAnim} colorIndex={colorIndex} */ />
              </Pressable>
            </Animated.View>
          )
        })
      }
      <View style={{justifyContent: "center", alignItems: "center", flex: 1, width: pageWidth}} />
    </ScrollView>
  )
}

function BlocksDisplayIndicator({ scrollX, pageWidth, globalBlockTypesMap, handleBlockPressed }) {
  const {colors, dark} = useTheme();
  const outRectSize = 15, innerRectWidth = 12;
  return (
    <View style={{height: 40, justifyContent: "center", alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: px}}>
      <View style={{flexDirection: "row", position: "relative"}}>
        {
          <Animated.View
            style={{position: "absolute", top: 0, width: outRectSize, height: outRectSize, borderRadius: 2, zIndex: -1, backgroundColor: colors.text, opacity: .5, 
              transform: [{ scale: 1.2 }],
              left: scrollX.interpolate({
                inputRange: globalBlockTypesMap.map((i,d) => d*pageWidth),
                outputRange: globalBlockTypesMap.map((i, d) => outRectSize*(d + d / 4 << 0)),
                extrapolate: "clamp"
              })
            }} />
        }
        {
          globalBlockTypesMap.map((item, index, arr) => {
            return (
              <Pressable key={"indicator" + index} onPress={handleBlockPressed(index)}>
                <View style={{height: outRectSize, width: outRectSize, justifyContent: "center", alignItems: "center", marginRight: (index+1) % 4 === 0 && index !== arr.length - 1 ? outRectSize : 0}}>
                  <View style={{width: innerRectWidth, height: innerRectWidth, borderRadius: 2, backgroundColor: item.fill, borderColor: colors.background, borderWidth: 2}} />
                </View>
              </Pressable>
            )
          })
        }
      </View>
    </View>
  )
}
