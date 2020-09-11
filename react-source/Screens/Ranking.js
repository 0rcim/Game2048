import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, Text, SafeAreaView, ScrollView, Switch, PixelRatio, StyleSheet, useWindowDimensions, Animated, Easing, TouchableHighlight, TouchableOpacity, Pressable, ActivityIndicator, BackHandler, ToastAndroid, SectionList } from "react-native";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { PlainBtn, NotificationBtn } from "../components/Pressable";
import { ScoreDisplay } from "../components/GamePageHeader";
import { PageSwiperFrame } from "../components/PageSwiperFrame";
import { OptionOverlay } from "../components/OptionOverlay";
import { IconTimer, IconCup, IconEmpty2048, IconMove } from "../Icons";
import { useLang } from "../I18n";
import { parseSecTime, dateFormat, MAIN_FONT_NAME } from "../plugins";
import { setStorage, multiQueryStorage } from "../plugins/Database";
import { FlatList } from "react-native-gesture-handler";
// import { TouchableOpacity } from "react-native-gesture-handler";

dateFormat();

const px = 1 / PixelRatio.get();

let count = 0;

export const Ranking = ({ navigation }) => {
  const {colors, dark} = useTheme();
  const [windowWidth, setWindowWidth] = useState(0);
  const {PAGE_RANKING: lang, PAGE_SETTINGS: lang_settings} = useLang();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [global_raw_records, setGlobal_raw_records] = useState(null);
  const [records_4X4, setRecords_4X4] = useState([]);
  const [records_5X5, setRecords_5X5] = useState([]);
  const [records_average, setRecords_average] = useState([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    console.log("length -->", records_average.length)
    multiQueryStorage(["ranking_records"])
      .then(valMap => {
        const ranking_records = JSON.parse(valMap.get("ranking_records"));
        // console.log(ranking_records);
        // if (!ranking_records) return setPageLoaded(true);
        setGlobal_raw_records(JSON.parse(valMap.get("ranking_records")));
      })
      .catch(err => {
        console.error(err);
      });
  }, []);
  useEffect(() => {
    if (!global_raw_records) return;
    let id_count = 0;
    let sortedRecords = {
      "4X4": [],
      "average": [],
      "5X5": [],
    };
    for (let player_name in global_raw_records) {
      const records = global_raw_records[player_name];
      for (let index=0; index < records.length; index++) {
        // let {score, time, date, moved_times, grid_size} = records[index];
        let 
          score = records[index].scores.split(",").reduce((p,c) => Number(c) + p, 0),
          // time = (new Date(records[index].record_timestamp) - new Date(records[index].start_timestamp)) / 1000,
          time = Number(records[index].time) || (new Date(records[index].record_timestamp) - new Date(records[index].start_timestamp)) / 1000,
          date = new Date(records[index].record_timestamp),
          moved_times = records[index].scores.split(",").length,
          grid_size = records[index].grid_size;
        // console.log(records[index].scores.split(","));
        id_count++;
        // console.log(grid_size, typeof grid_size);
        if (grid_size.toString() === "5") {
          sortedRecords["5X5"].push({
            player_name, id: id_count,
            score, time, date, moved_times, grid_size,
            raw: records[index],
          });
        } else {
          sortedRecords["4X4"].push({
            player_name, id: id_count,
            score, time, date, moved_times, grid_size,
            raw: records[index],
          });
        }
        sortedRecords.average.push({
          player_name, id: id_count,
          score, time, date, moved_times, grid_size,
          avg_by_time: score / time, avg_by_step: score / moved_times,
        })
      }
    }
    sortedRecords["4X4"].sort((a, b) => b.score - a.score);
    sortedRecords["5X5"].sort((a, b) => b.score - a.score);
    sortedRecords.average.sort((a, b) => b.avg_by_time - a.avg_by_time);
    setRecords_5X5(sortedRecords["5X5"]);
    setRecords_4X4(sortedRecords["4X4"]);
    setRecords_average(JSON.parse(JSON.stringify(sortedRecords.average)));
  }, [global_raw_records]);
  useEffect(() => {
    // if (records_4X4.length > 0 || records_5X5.length > 0) setPageLoaded(true);
  }, [records_4X4, records_5X5]);
  useEffect(() => {
    if (pageLoaded) floatIn();
  }, [pageLoaded]);
  const floatRateAnim = useRef(new Animated.Value(0)).current;
  const floatIn = () => {
    Animated.timing(floatRateAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.linear(x => Math.sqrt(1 - Math.pow(x - 1, 2))),
      useNativeDriver: true,
    }).start();
  };
  const floatOut = () => {
    Animated.timing(floatRateAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  const handleRankTopItemLongPressed = (flg, item) => (zoomInOut) => () => {
    console.log("item id -->", item.id);
    zoomInOut(() => {
      setOptionOverlayVisibility(true);
      setOptionOverlayMainTitle("删除游戏纪录");
      setOptionOverlayBody(
        <View style={styles.optionOverlayContainer}>
          <View>
            <Text style={[styles.optionOverlayParagraph, {color: colors.text}]}>Are you sure you want to permanently delete this game record item:</Text>
          </View>
          <View style={[styles.recordContainer, {backgroundColor: dark ? "#ffffffaa" : "#00000011"}]}>
            <RankListFragment {...item} />
            {/* <Text style={styles.optionOverlayParagraph}></Text> */}
          </View>
          <View style={{flexDirection: "row", paddingTop: 32, justifyContent: "center"}}>
            <NotificationBtn onPress={() => {
              multiQueryStorage(["ranking_records"])
                .then(valMap => {
                  let ranking_records = JSON.parse(valMap.get("ranking_records"));
                  let player_ranking_records = ranking_records[item.player_name];
                  let item_raw = item.raw;
                  for (let i=0; i<player_ranking_records.length; i++) {
                    if (
                      player_ranking_records[i].start_timestamp === item_raw.start_timestamp &&
                      player_ranking_records[i].record_timestamp === item_raw.record_timestamp
                    ) {
                      ranking_records[item.player_name][i] = null;
                      // break;
                    }
                  };
                  ranking_records[item.player_name] = ranking_records[item.player_name].filter(Boolean);
                  setGlobal_raw_records(ranking_records);
                  setStorage("ranking_records", JSON.stringify(ranking_records))
                    .then(f => {
                      ToastAndroid.show("删除成功", ToastAndroid.SHORT);
                    })
                    .catch(error => {
                      console.error(error);
                    })
                })
                .catch(error => {
                  console.error(error);
                })
                setOptionOverlayVisibility(false);
            }} title={lang.YES} />
            <PlainBtn onPress={() => setOptionOverlayVisibility(false)} title={lang.NO} />
          </View>
        </View>
      )
    });
  }
  const [optionOverlayVisibility, setOptionOverlayVisibility] = useState(false);
  const [optionOverlayBody, setOptionOverlayBody] = useState(<></>);
  const [optionOverlayMainTitle, setOptionOverlayMainTitle] = useState("");
  const [optionOverlayCaption, setOptionOverlayCaption] = useState("");

  const [text1LayoutWidth, setText1LayoutWidth] = useState(0);
  const [text2LayoutWidth, setText2LayoutWidth] = useState(0);
  const [isFirstCellActive, setIsFirstCellActive] = useState(true);
  const cellRateAnim = useRef(new Animated.Value(0)).current;
  const unfoldFirstCell = () => {
    Animated.timing(cellRateAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.linear((x) => 1 - Math.pow(1 - x, 8)),
      useNativeDriver: false,
    }).start();
  };
  const foldFirstCell = () => {
    Animated.timing(cellRateAnim, {
      toValue: 0,
      duration: 600,
      easing: Easing.linear((x) => 1 - Math.pow(1 - x, 6)),
      useNativeDriver: false,
    }).start();
  };  
  const onClickSortBtn = () => {
    if (!isFirstCellActive) {
      records_average.sort((a, b) => b.avg_by_time - a.avg_by_time);
      foldFirstCell();
    } else {
      records_average.sort((a, b) => b.avg_by_step - a.avg_by_step);
      unfoldFirstCell();
    }
    setIsFirstCellActive(!isFirstCellActive)
  }
  return (
    <>
      <OptionOverlay
        visibility={optionOverlayVisibility}
        mainTitle={optionOverlayMainTitle}
        caption={optionOverlayCaption}
        selectedCallBack={() => {setOptionOverlayVisibility(false)}}
        cancelable={true}
        Body={optionOverlayBody}
      />
      <SafeAreaView onLayout={(event) => setWindowWidth(event.nativeEvent.layout.width)} style={{flex: 1, flexDirection: "column", position: "relative"}}>
        <Animated.View style={{/* backgroundColor: "green",  */flex: 1, opacity: floatRateAnim, translateY: floatRateAnim.interpolate({
          inputRange: [0,1],
          outputRange: [150, 0],
        })}}>
          <PageSwiperFrame
            windowWidth={windowWidth}
            scrollViewRef={scrollViewRef}
            scrollX={scrollX}
            indicatorTextArr={[lang.GAME_MODE_4X4, lang.AVERAGE, lang.GAME_MODE_5X5]/* [lang.SCORE, lang.GAMER_BOARD, lang.AVERAGE] */} 
          >
            {/* ========= 4X4 ========= */}
            <SectionList style={{flex: 1, width: windowWidth, paddingHorizontal: 8/* , backgroundColor: "#123" */}}
              sections={[
                { data: records_4X4 }
              ]}
              
              fadingEdgeLength={30}
              contentContainerStyle={{paddingTop: 16}}
              renderItem={({item, index}) => (
                <RankTop handleLongPress={handleRankTopItemLongPressed("4X4", {...item, top: index+1})} top={index+1} recordObj={item} />
              )}
              keyExtractor={(item, index) => `record_4x4_${index}`}
              renderSectionHeader={() => (
                records_4X4.length == 0 ? (
                  <View style={{flex: 1, justifyContent: "space-between", alignItems: "center", minHeight: 200}}>
                    <Text style={[styles.tipText, {color: "goldenrod"}]}>暂无纪录</Text>
                    <Text style={styles.tipText}>开始游戏吧！</Text>
                  </View>
                ) : (
                  <View style={{alignItems: "center"}}>
                    <Text style={styles.tipText}>（长按编辑）</Text>
                  </View>
                )
              )}
            />
            {/* ========= AVERAGE ========= */}
            <SectionList style={{flex: 1, width: windowWidth, paddingHorizontal: 8/* , backgroundColor: "#456" */}}
              sections={[
                { data: records_average.slice(0,30) }
              ]}
              onLayout={() => {
                if (++count > 1) setPageLoaded(true);
              }}
              fadingEdgeLength={30}
              contentContainerStyle={{paddingTop: 16}}
              renderItem={({item, index}) => (
                <View style={{position: "relative", paddingVertical: 8}}>
                  <View style={{paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, backgroundColor: dark ? "#000000aa" : "#ffffffaa", position: "absolute", borderColor: colors.border, borderWidth: px, top: 0, left: 0, zIndex: 1}}>
                    <Text style={{color: colors.text, fontSize: 16, fontFamily: MAIN_FONT_NAME}}>{(isFirstCellActive ? item.avg_by_time : item.avg_by_step).toFixed(4)}</Text>
                  </View>
                  <RankTop top={index+1} recordObj={item} />
                </View>
              )}
              keyExtractor={(item, index) => `record_avg_${index}`}
              renderSectionHeader={() => (
                (records_4X4.length == 0 && records_5X5.length === 0) ? (
                  <View style={{flex: 1, justifyContent: "space-between", alignItems: "center", minHeight: 200}}>
                    <Text style={[styles.tipText, {color: "goldenrod"}]}>暂无纪录</Text>
                    <IconEmpty2048/>
                    <Text style={styles.tipText}>开始游戏吧！</Text>
                  </View>
                ) : (
                  <View style={{alignItems: "flex-end", paddingHorizontal: 8, paddingVertical: 12}}>
                    <Text style={[styles.tipText, {alignSelf: "center"}]}>（平均榜只展示排名最靠前的30条纪录）</Text>
                    <View style={{height: 36, borderRadius: 18, borderColor: colors.text, borderWidth: px, flexDirection: "row", alignItems: "center", marginTop: 24, overflow: "hidden"}}>
                      <TouchableOpacity activeOpacity={.32} onPress={onClickSortBtn} style={{height: 36, alignItems: "center", justifyContent: "center", backgroundColor: isFirstCellActive ? colors.card : "transparent"}}>
                        <View style={{alignItems: "center", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingLeft: 8, paddingRight: 6}}>
                          <IconTimer style={{marginRight: 4}} width={22} height={22} fill={isFirstCellActive ? "goldenrod" : colors.text} />
                          <Animated.View style={{
                            overflow: "hidden",
                            alignItems: "center",
                            width: cellRateAnim.interpolate({
                              inputRange: [0,1],
                              outputRange: [text1LayoutWidth,0],
                            })
                          }}>
                            <Text numberOfLines={1} ellipsizeMode="clip" style={[styles.hiddenCellText, {color: colors.text}]}>每秒得分</Text>
                          </Animated.View>
                        </View>
                      </TouchableOpacity>
                      <View style={{height: "100%", width: 0, borderLeftWidth: px, borderLeftColor: colors.text,}} />
                      <TouchableOpacity activeOpacity={.32} onPress={onClickSortBtn} style={{height: 36, alignItems: "center", justifyContent: "center", backgroundColor: isFirstCellActive ? "transparent" : colors.card}}>
                        <View style={{alignItems: "center", flexDirection: "row", justifyContent: "center", paddingRight: 8, paddingLeft: 6}}>
                          <Animated.View style={{
                              overflow: "hidden",
                              alignItems: "center",
                              width: cellRateAnim.interpolate({
                                inputRange: [0,1],
                                outputRange: [0,text2LayoutWidth],
                              })
                            }}>
                            <Text numberOfLines={1} ellipsizeMode="clip" lineBreakMode="clip" style={[styles.hiddenCellText, {color: colors.text}]}>平均移动次数得分</Text>
                          </Animated.View>
                          <IconMove style={{marginLeft: 4}} width={22} height={22} fills_arr={new Array(4).fill(isFirstCellActive ? colors.text : "gold")} offsets_arr={new Array(4).fill(isFirstCellActive ? 0 : 20)} />
                        </View>
                      </TouchableOpacity>
                    </View>
                    <View style={{paddingHorizontal: 4, paddingVertical: 8}}>
                      <Text style={{color: colors.text, fontSize: 12, fontWeight: "bold"}}>单位：分数/{isFirstCellActive ? "秒" : "移动一次"}</Text>
                    </View>
                  </View>
                )
              )}
            />
            {/* ========= 5X5 ========= */}
            <SectionList onLayout={({ nativeEvent }) => {
              console.log(nativeEvent.layout, windowWidth)
              // if (nativeEvent.layout.x >= windowWidth) {
              //   setPageLoaded(true);
              // }
            }} style={{flex: 1, width: windowWidth, paddingHorizontal: 8}} fadingEdgeLength={30} contentContainerStyle={{paddingTop: 16}}
              sections={[
                { data: records_5X5 }
              ]}
              renderItem={({item, index}) => (
                <RankTop key={"record_5x5"+index} handleLongPress={handleRankTopItemLongPressed("5X5", {...item, top: index+1})} top={index+1} recordObj={item} />
              )}
              // onViewableItemsChanged={({ viewableItems , changed }) => {
              //   // console.log(viewableLen);
              //   if (viewableItems.length) {
              //     setPageLoaded(true);
              //   }
              // }}
              keyExtractor={(item, index) => `record_5x5_${index}`}
              renderSectionHeader={() => (
                records_5X5.length == 0 ? (
                  <View style={{flex: 1, justifyContent: "space-between", alignItems: "center", minHeight: 200}}>
                    <Text style={[styles.tipText, {color: "goldenrod"}]}>暂无纪录</Text>
                    <Text style={styles.tipText}>可在游戏设置中开启<Text style={{color: colors.text}}>「无尽模式」</Text></Text>
                  </View>
                ) : (
                  <View style={{alignItems: "center"}}>
                    <Text style={styles.tipText}>（长按编辑）</Text>
                  </View>
                )
              )}
            />
          </PageSwiperFrame>
        </Animated.View>
        {
          pageLoaded ? <></> : (
            <View style={[StyleSheet.absoluteFill, {justifyContent: "center", alignItems: "center"}]}>
              <ActivityIndicator size="small" color={colors.text} animating={!pageLoaded} />
              <Text style={{color: dark ? "gold" : "goldenrod", fontWeight: "bold", paddingVertical: 8}}>稍后</Text>
            </View>
          )
        }
        <View style={[StyleSheet.absoluteFill, {height: 0, zIndex: -1, overflow: "hidden", alignItems: "flex-start"}]}>
          <Text onLayout={(e) => setText1LayoutWidth(e.nativeEvent.layout.width)} style={styles.hiddenCellText}>每秒得分</Text>
          <Text onLayout={(e) => setText2LayoutWidth(e.nativeEvent.layout.width)} style={styles.hiddenCellText}>平均移动次数得分</Text>
        </View>
      </SafeAreaView>
    </>
  )
};

function RankTop({ top=4, recordObj: {player_name="", style={}, score=0, time=0, date=0, moved_times=0, grid_size=4}, handleLongPress=()=>()=>{} /* handlePress=()=>()=>{},  *//* rank_item_collapse_control_arr=[] */ }) {
  const { colors, dark } = useTheme();
  const {PAGE_RANKING: lang, PAGE_START: lang_start} = useLang();
  let cfg = {};
  switch(top) {
    case 1: cfg = {type: "golden", fill: "gold"}; break;
    case 2: cfg = {type: "silver", fill: "#dbdbee"}; break;
    case 3: cfg = {type: "bronze", fill: "#eecd32"}; break;
    default: cfg = {fill: dark ? "#454545" : "#e2e2e2"}; break;
  };
  const isTop3 = top < 4;
  const [showDetails, setShowDetails] = useState(false);
  const heightRateAnim = useRef(new Animated.Value(0)).current;
  const scaleRateAnim = useRef(new Animated.Value(0)).current;
  const zoomInOut = (fn) => {
    Animated.timing(scaleRateAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(finished => {
      if (finished) {
        Animated.timing(scaleRateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
        fn && fn();
      }
    })
  }
  const expand = () => {
    setShowDetails(true);
    Animated.timing(heightRateAnim, {
      toValue: 1,
      duration: 450,
      easing: Easing.linear((x) => 1 - Math.pow(1 - x, 4)),
      useNativeDriver: false,
    }).start();
  };
  const fold = () => {
    Animated.timing(heightRateAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.linear((x) => 1 - Math.pow(1 - x, 6)),
      useNativeDriver: false,
    }).start(() => setShowDetails(false));
  };
  return (
    <Pressable style={style} delayLongPress={150} onLongPress={handleLongPress(zoomInOut)} onPress={() => showDetails ? fold() : expand()}>
      <Animated.View style={[styles.rankBrandContainer, {backgroundColor: cfg.fill, opacity:  scaleRateAnim.interpolate({
        inputRange: [0,1],
        outputRange: [1,.25],
      }), transform: [{scale: scaleRateAnim.interpolate({
        inputRange: [0,1],
        outputRange: [1,1.04],
      })}]}]}>
        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", /* backgroundColor: "red", */ padding: 8, /* paddingBottom: 0, */ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
          <View style={{flexDirection: "row", alignItems: "center"}}>
            {isTop3 ? <IconCup width={36} height={36} type={cfg.type} /> : <></>}
            <Text style={{color: isTop3 ? "#000" : colors.text, fontWeight: "bold", fontSize: 16}}>{top.toString().padStart(2,0)}</Text>
            <Text style={{color: isTop3 ? "#000" : colors.text, fontWeight: "bold", fontSize: 16, borderLeftColor: "#ffffffdd", borderLeftWidth: px, marginLeft: 5, paddingLeft: 5}}>{player_name}</Text>
          </View>
          <ScoreDisplay currentScore={score} fontSize={isTop3 ? 24 : 20} padZero={isTop3} tintColor={{dark: isTop3 ? "darkgoldenrod" : "#fff", light: isTop3 ? "darkgoldenrod" : "#000"}} />
        </View>
        {
          showDetails ? (
            <Animated.View 
              style={{height: RANK_LIST_TOTAL_HEIGHT, /* backgroundColor: "green", */ overflow: "hidden", 
                // paddingVertical: 4, 
                borderBottomLeftRadius: 8, borderBottomRightRadius: 8, 
                height: heightRateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, RANK_LIST_TOTAL_HEIGHT],
              })}}
            >
              <View style={{backgroundColor: "#ffffff55", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,}}>
                <View style={{height: RANK_LIST_TITLE_HEIGHT, alignItems: "center", borderBottomColor: cfg.fill, borderBottomWidth:2* px}}>
                  <Text style={{color: "#000", fontSize: 16, fontWeight: "bold"}}>{lang.RECORD_DETAILS}</Text>
                </View>
                <RankListFragment {...{time, top, player_name, moved_times, date, grid_size}} />
              </View>
            </Animated.View>
          ) : <></>
        }
      </Animated.View>
    </Pressable>
  )
};

export  function RankListFragment({time=0, top=1, player_name, moved_times=0, date=0, grid_size=4 }) {
  const {PAGE_RANKING: lang, PAGE_START: lang_start} = useLang();
  const { hours, minutes, seconds } = parseSecTime(time);
  return (
    <>
      <RankListItem title={lang.RECORD_HOLDER} text={player_name || lang_start.GAMER_UNNAMED} style={player_name ? {} : styles.unnamedText} />
      <RankListItem title={lang.GRID_SIZE_IS} text={[grid_size, grid_size].join(" × ")} />
      <RankListItem title={lang.RANKING_IS} text={top} />
      <RankListItem title={lang.TIME} text={[hours, lang_start.HOURS, minutes, lang_start.MINUTES, seconds, lang_start.SECONDS].join("")} />
      <RankListItem title={lang.MOVED_TIMES} text={moved_times} />
      <RankListItem title={lang.DATE} text={new Date(date).format("yyyy/MM/dd [hh:mm:ss]")} />
    </>
  )
}

export function RankListItem({ title="", text="", style={}}) {
  return (
    <View style={styles.rankListItem}>
      <Text style={styles.rankListItemTitle}>{title}</Text>
      <Text style={[styles.rankListItemText, style]}>{text}</Text>
    </View>
  )
};

const RANK_LIST_TITLE_HEIGHT = 30;
export const RANK_LIST_ITEM_HEIGHT = 26;
export const RANK_LIST_ITEM_COUNT = 6;

const RANK_LIST_TOTAL_HEIGHT = RANK_LIST_ITEM_COUNT*RANK_LIST_ITEM_HEIGHT+RANK_LIST_TITLE_HEIGHT+8*2+8*2;

const styles = StyleSheet.create({
  rankBrandContainer: {
    marginHorizontal: 8, marginVertical: 12, /* padding: 8,  */
    backgroundColor: "#ffffff44", borderRadius: 8
  },
  rankBrand: {
    padding: 14, paddingVertical: 4, paddingRight: 6,
    marginTop: 4,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
  },
  rankBrandTopBadge: {
    color: "#000", 
    fontFamily: MAIN_FONT_NAME, 
    fontSize: 44,
    alignSelf: "flex-start",
  },
  rankListTitle: {
    height: RANK_LIST_TITLE_HEIGHT,
  },
  rankListItem: {
    justifyContent: "space-between",
    flexDirection: "row",
    height: RANK_LIST_ITEM_HEIGHT,
    alignItems: "center",
  },
  rankListItemTitle: {
    fontSize: 15,
    color: "#00000088",
  },
  rankListItemText: {
    fontSize: 15,
    color: "#000",
    fontWeight: "700",
  },
  unnamedText: {
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
    fontStyle: "italic",
    color: "grey",
    fontWeight: "bold",
  },
  optionOverlayContainer: {
    padding: 14, paddingHorizontal: 24
  },
  optionOverlayParagraph: {
    fontSize: 16, fontWeight: "bold", lineHeight: 25
  },
  recordContainer: {
    marginTop: 12, marginHorizontal: -24, padding: 12, justifyContent: "center", borderRadius: 12, overflow: "hidden",
  },
  tipText: {fontSize: 14, fontWeight: "bold", color: "grey", letterSpacing: 4*px, opacity: .56},
  hiddenCellText: {
    /* paddingHorizontal: 4,  */fontWeight: "bold"
  }
})