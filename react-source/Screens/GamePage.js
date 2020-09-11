import React, { useContext, useState, useEffect, useCallback, useRef } from "react";
import { SafeAreaView, View, Text, BackHandler, StyleSheet, Animated, Easing, ActivityIndicator } from "react-native";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { GridPropsContext, Block, BlockTypesMap, GamePageHeader, OptionOverlay, NotificationBtn, SuccessBtn, OptionOverlayBodyGameOver, NewRecordSnackBarOverlay } from "../components";
import { multiQueryStorage, setStorage } from "../plugins/Database";
import { useLang } from "../I18n";
import { ColorUtils } from "../plugins";

import { GlobalSettingsContext } from "../GlobalContext"

import { FlingGestureHandler, Directions, State } from "react-native-gesture-handler";

const FlingDirectionFlags = {
  "UP": 0, "RIGHT": 1, "DOWN": 2, "LEFT": 3,
};

let gameTimer = null;
let timeSecCount = 0;
let globalBlockTypesMap_copy = [];
let final_record_date;
// let previous_date = null;
let previous_time = 0;

export const Game = ({ navigation }) => {
  const { colors, dark } = useTheme();
  const {PAGE_START: lang} = useLang();
  const {
    GAME_MODE: [CurrentGameMode, ChangeCurrentGameMode],
    SAVED_PLAYER_NAME: [CurrentPlayerName, ChangeCurrentPlayerName],
  } = useContext(GlobalSettingsContext);
  const rateAnim = useRef(new Animated.Value(0)).current;
  const showGrid = () => {
    Animated.timing(rateAnim, {
      duration: 400,
      toValue: 1,
      easing: Easing.linear((x) => x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
      useNativeDriver: true,
    }).start();
    setShowActivityIndicator(false)
  };
  const hideGrid = () => {
    Animated.timing(rateAnim, {
      duration: 200,
      toValue: 0,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };
  const [gridProps/* {size, gapRate} */, setGridProps] = useState({
    size: CurrentGameMode.toString() === "1" ? 60 : 80, gapRate: .15,
  });
  // const GRID_SIZE = 4, GRID_NUM = GRID_SIZE*GRID_SIZE;
  const [Game_is_over, setGame_is_over] = useState(false);
  useEffect(() => {
    if (Game_is_over) {
      // console.log(
      //   JSON.stringify(
      //     {GameRestart, ExitGame, navigation, timeSec, playerName, movedTimes, currentScore, final_record_date}
      //   )
      // )
      hideGrid();
      setOptionOverlayMainTitle("游戏结束");
      setOptionOverlayBody(<OptionOverlayBodyGameOver {...{GameRestart, ExitGame, navigation, timeSec, playerName, movedTimes, GRID_SIZE}} score={currentScore} top={recordsScoreArray.length+1} dateObj={final_record_date || new Date()} />);
      setOptionOverlayVisibility(true);
      setNewRecordSnackBarOverlay(true);
    }
  }, [Game_is_over])
  const [GRID_SIZE, setGRID_SIZE] = useState(0);
  const [GRID_NUM, setGRID_NUM] = useState(GRID_SIZE*GRID_SIZE);
  const [boxSize, setBoxSize] = useState(gridProps.size*(GRID_SIZE+gridProps.gapRate));
  useEffect(() => {
    setGRID_NUM(GRID_SIZE*GRID_SIZE);
    setBoxSize(gridProps.size*(GRID_SIZE+gridProps.gapRate));
    // console.log("GRID_SIZE changed", GRID_SIZE);
  }, [GRID_SIZE])
  const [gridState, setGridState] = useState(new Array(GRID_NUM).fill(null));
  useEffect(() => {
    // setGridState(new Array(GRID_NUM).fill(null)/* .map((n, i) => i) */);
    randomPutNewBlock(new Array(GRID_NUM).fill(null));
  }, [GRID_NUM]);
  useEffect(() => {
    !gridState.some(i => i === null) && CheckGameShouldOver(gridState);
  }, [gridState])
  // const boxSize = size*(4+gapRate);
  const [newRecordSnackBarOverlay, setNewRecordSnackBarOverlay] = useState(false);
  const [showGameGesturePan, setShowGameGesturePan] = useState(false);
  const [statusPanelMovedOffsetsArr, setStatusPanelMovedOffsetsArr] = useState([]);
  const [currentFlingDirection, setCurrentFlingDirection] = useState("");
  const [nextRandomPutBlockIndex, setNextRandomPutBlockIndex] = useState(null);
  const [timeSec, setTimeSec] = useState(0);
  const [recordsScoreArray, setRecordsScoreArray] = useState([]);

  const onBackPress = () => {
    // navigation.navigate("Home", { uselessParam: null });
    // GameOver();
    // setGame_is_over(true);
    PauseGame();
    return true;
  };
  const getGridStateMap = (gridState, direction="row") => {
    let gridStateMap =  gridState.map((INDEX, i) => (
      {left: i % GRID_SIZE, top: i / GRID_SIZE << 0, this_index: i, self_INDEX: INDEX}
    ));
    if (direction === "row") return new Array(GRID_SIZE).fill().map((u, idx) => gridStateMap.filter(i => i.top === idx).map(i => i.self_INDEX));
    else if (direction === "col") return new Array(GRID_SIZE).fill().map((u, idx) => gridStateMap.filter(i => i.left === idx).map(i => i.self_INDEX));
  };
  const GameOver = () => {
    const curr_date = new Date();
    final_record_date = curr_date;
    // console.log(globalBlockTypesMap)
    setGlobalBlockTypesMap(
      globalBlockTypesMap.map(item => {
        item.fill = ColorUtils(item.fill).grayscale().hex();
        return item;
      })
    );
    multiQueryStorage(["ranking_records"])
      .then(valMap => {
        const ranking_records = valMap.get("ranking_records");
        console.log("player name ===>", playerName);
        let temp = {}, player_name = playerName || "";
        if (ranking_records) {
          temp = JSON.parse(ranking_records);
        }
        if (!(player_name in temp)) {
          temp[player_name] = [];
        }
        temp[player_name].push(
          {
            // player_name,
            // score: currentScore,
            // time: timeSec,
            // date: curr_date.toISOString(),
            // moved_times: movedTimes,
            grid_size: GRID_SIZE,
            scores: scoreStamps.replace(/^,/, ""),
            start_timestamp: startTimestamp.toISOString(),
            time_stamps: timeStamps.replace(/^,/, ""),
            record_timestamp: curr_date.toISOString(),
          }
        );
        // console.log("temp records---===>", temp);
        setStorage("ranking_records", JSON.stringify(temp))
          .then(() => {
            setGame_is_over(true);
          })
          .catch(err => {

          });
      });
  };
  const GameRestart = () => {
    setMovedTimes(0);
    timeSecCount = 0;
    setCurrentScore(0);
    setTimeSec(0);
    setGame_is_over(false);
    setGlobalBlockTypesMap(JSON.parse(JSON.stringify(globalBlockTypesMap_copy)));
    clearInterval(gameTimer);
    refreshRecordsScore()
      .then(f => {
        setOptionOverlayVisibility(false);
        randomPutNewBlock(new Array(GRID_NUM).fill(null));
        showGrid();
      })
  };
  const PauseGame = () => {
    clearInterval(gameTimer);
    setOptionOverlayMainTitle(lang.GAME_IS_PAUSED);
    setOptionOverlayBody(
      <View style={styles.optionBody}>
        <NotificationBtn onPress={GameRestart} title={lang.RESTART} />
        <NotificationBtn onPress={ExitGame} title={lang.EXIT_TO_MENU} />
        <SuccessBtn onPress={ResumeGame} title={lang.RESUME} />
      </View>
    );
    setOptionOverlayVisibility(true);
  };
  const ResumeGame = () => {
    setOptionOverlayVisibility(false);
    if (movedTimes > 0) {
      gameTimer = setInterval(() => setTimeSec(++timeSecCount), 1000);
    }
  };
  const ExitGame = () => {
    setOptionOverlayVisibility(false);
    setMovedTimes(0);
    timeSecCount = 0;
    setCurrentScore(0);
    setTimeSec(0);
    clearInterval(gameTimer);
    navigation.goBack();
  };
  const CheckGameShouldOver = (gridState) => {
    let rows = getGridStateMap(gridState, "row");
    let cols = getGridStateMap(gridState, "col");
    if (rows.length === 0 || cols.length === 0) return;
    // console.log("============GAME OVER============");
    console.log(
      "check rows -->",
      rows,
      "check cols -->",
      cols,
    );
    let test_score = 0;
    [...rows, ...cols].forEach(item => {
      test_score += calcScore(RLCombineBlock(item).reduced);
      test_score += calcScore(LRCombineBlock(item).reduced);
    });
    if (test_score > 0) {
      console.log("==========GAME NOT OVER==========");
    } else {
      console.log("============GAME OVER============");
      clearInterval(gameTimer);
      if (!Game_is_over) GameOver();
    }
  };
  const randomPutNewBlock = (gridStateArr) => {
    // console.log(gridStateArr)
    if (gridStateArr.length < GRID_NUM) return;
    let null_with_index = gridStateArr.map((self, index) => ({self, index})).filter(item => item.self === null);
    if (null_with_index.length === 0) return /* CheckGameShouldOver(gridStateArr) */;
    // console.log("randomPutNewBlock-->", null_with_index);
    // console.log("-->",parseInt(Math.random()*(null_with_index.length-1)))
    let next_put_block_index = null_with_index[parseInt(Math.random()*(null_with_index.length-1))].index;
    setGridState(
      gridStateArr.fill(0, next_put_block_index, next_put_block_index+1)
    );
    return next_put_block_index;
  };
  const combineBlock = (arr, direction="reduce") => {
    let reduceResult = {
      reduced: {}
    };
    reduceResult.solved = Array.prototype[direction].call(arr, (p, c, i, a) => {
      if (c === p[i+1] && p[i]!== null) {
        if (!(c in reduceResult.reduced)) reduceResult.reduced[c] = 0;
        p.splice(i+1, 1, null);
        reduceResult.reduced[c] ++;
        p[i]++;
        return p;
      }
      return p;
    }, arr).filter(i => i !== null);
    return reduceResult;
  };
  const LRCombineBlock = (arr) => {
    const { reduced, solved } = combineBlock(arr, "reduceRight");
    let final_solved = [...arr.slice().fill(null), ...solved];
    while (final_solved.length > arr.length) final_solved.shift();
    return ({ reduced, final_solved });
  };
  const RLCombineBlock = (arr) => {
    const { reduced, solved } = combineBlock(arr);
    let final_solved = [...solved, ...arr.slice().fill(null)];
    while (final_solved.length > arr.length) final_solved.pop();
    return ({ reduced, final_solved });
  };
  const calcScore = (reduced_obj={}) => {
    let score = 0;
    for (let key in reduced_obj) score += ((2 << (key*1)) * (reduced_obj[key]) * 2);
    // console.log("add score -->>>", score, currentScore)
    // setCurrentScore( currentScore + score )
    // console.log("add score -->", score);
    return score;
  };
  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => 
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    })
  );
  useEffect(() => {
    // console.log(currentFlingDirection);
    let flg = FlingDirectionFlags[currentFlingDirection];
    setStatusPanelMovedOffsetsArr(new Array(4).fill(0).fill(45, flg, flg+1));
  }, [currentFlingDirection]);
  const [playerName, setPlayerName] = useState(CurrentPlayerName);
  // const [playerName, setPlayerName] = useState(undefined);
  // const [playerNameVal, setPlayerNameVal] = useState("");
  const [optionOverlayVisibility, setOptionOverlayVisibility] = useState(false);
  const [optionOverlayBody, setOptionOverlayBody] = useState(<></>);
  const [optionOverlayMainTitle, setOptionOverlayMainTitle] = useState("");
  const [optionOverlayCaption, setOptionOverlayCaption] = useState("");
  const [globalBlockTypesMap, setGlobalBlockTypesMap] = useState([]);
  const [globalScreenSize, setGlobalScreenSize] = useState({width: 0, height: 0})

  const [scoreStamps, setScoreStamps] = useState("");
  const [startTimestamp, setStartTimeStamp] = useState(null);
  const [timeStamps, setTimeStamps] = useState("");
  const [currentScore, setCurrentScore] = useState(0);
  const [movedTimes, setMovedTimes] = useState(0);

  // useEffect(() => {
  //   console.log(
  //     "scoreStamps -->",
  //     scoreStamps,
  //     "timeStamps -->",
  //     timeStamps,
  //   )
  // }, [scoreStamps, timeStamps])

  const textInputRef = useRef(null);
  const [showActivityIndicator, setShowActivityIndicator] = useState(true);
  // const {width: _width, height: _height} = useWindowDimensions();
  useEffect(() => {
    // console.log("screen size changed -->", globalScreenSize);
    // const {width, height} = globalScreenSize;
    // let minSize = Math.min(width, height) || Math.min(_width, _height);
    // let padding = 110;
    // let _gapRate = .15;
    // padding =  minSize < 300 && minSize > 0 ? 50 : 110;
    // _gapRate = minSize < 300 && minSize > 0 ? .12 : .15;
    // const _size = (minSize - padding - 1) / (GRID_SIZE + _gapRate);
    // setGridProps({size: _size, gapRate: _gapRate});
    // setBoxSize(minSize - padding);
    console.log("gridProps +++>", gridProps);
    // console.log()
    if (GRID_SIZE === 0) return;
    const {width, height} = globalScreenSize;
    const minSize = Math.min(width, height);
    console.log("minSize ==>", minSize);
    console.log("GRID_SIZE ===>", GRID_SIZE);
    if (minSize === 0) return;
    let _size = 0, _gapRate = 0;
    if (minSize >= 0 && minSize <300) {
      _size = (minSize - 25) / GRID_SIZE << 0; _gapRate = .12;
    } else if (minSize >= 300 && minSize <= 600) {
      _size = (minSize - 120) / GRID_SIZE << 0; _gapRate = .15;
    } else if (minSize > 600) {
      _size = (minSize - 130) / GRID_SIZE << 0; _gapRate = .17;
    } else {
      console.log("unhandled")
    }
    setGridProps({size: _size, gapRate: _gapRate});
    setBoxSize(Math.ceil(_size*(GRID_SIZE+_gapRate)));
    // showGrid();
    // hideGrid();
    console.log("calc screen ...")
  }, [globalScreenSize]);
  useEffect(() => {
    if (movedTimes === 0) return;
    if (movedTimes === 1) {
      gameTimer = setInterval(() => setTimeSec(++timeSecCount), 1000);
      var start_time_stamp = new Date();
      setStartTimeStamp(start_time_stamp);
    };
    
    let new_grid_map = [];
    let final_grid_map = [];
    let score = 0;
    const GRID_SIZE_NULL = new Array(GRID_SIZE).fill(null);
    switch (currentFlingDirection) {
      case "LEFT": {
        for (let i=0; i<GRID_SIZE; i++) {
          let temp = getGridStateMap(gridState, "row")[i].filter(i => i !== null).concat(GRID_SIZE_NULL);
          while (temp.length > GRID_SIZE) temp.pop();
          const { reduced, final_solved } = RLCombineBlock(temp);
          score += calcScore(reduced);
          new_grid_map[i] = final_solved;
        }
        final_grid_map = new_grid_map.flat();
        break;
      }
      case "RIGHT": {
        for (let i=0; i<GRID_SIZE; i++) {
          let temp = GRID_SIZE_NULL.concat(getGridStateMap(gridState, "row")[i].filter(i => i !== null));
          while (temp.length > GRID_SIZE) temp.shift();
          const { reduced, final_solved } = LRCombineBlock(temp);
          score += calcScore(reduced);
          new_grid_map[i] = final_solved;
        }
        final_grid_map = new_grid_map.flat();
        break;
      }
      case "UP": {
        for (let i=0; i<GRID_SIZE; i++) {
          let temp = getGridStateMap(gridState, "col")[i].filter(i => i !== null).concat(GRID_SIZE_NULL);
          while (temp.length > GRID_SIZE) temp.pop();
          const { reduced, final_solved } = RLCombineBlock(temp);
          score += calcScore(reduced);
          new_grid_map[i] = final_solved;
        }
        break;
      }
      case "DOWN": {
        for (let i=0; i<GRID_SIZE; i++) {
          let temp = GRID_SIZE_NULL.concat(getGridStateMap(gridState, "col")[i].filter(i => i !== null));
          while (temp.length > GRID_SIZE) temp.shift();
          const { reduced, final_solved } = LRCombineBlock(temp);
          score += calcScore(reduced);
          new_grid_map[i] = final_solved;
        }
        break;
      }
    }
    if (currentFlingDirection === "UP" || currentFlingDirection === "DOWN") {
      for (let i=0; i<GRID_SIZE; i++) 
        for (let j=0; j<GRID_SIZE; j++) 
          final_grid_map.push(new_grid_map[j][i]);
    }
    console.log(movedTimes, "score +", score)
    setScoreStamps([scoreStamps, score].join());
    // const temp_date = new Date();
    let temp_time = Number(timeSec);
    setTimeStamps([timeStamps, temp_time - previous_time].join());
    previous_time = temp_time;
    console.log("time stamps ---->", timeStamps)
    setCurrentScore(currentScore + score);
    setGridState(final_grid_map);
    setNextRandomPutBlockIndex(
      randomPutNewBlock(final_grid_map)
    );
    // console.log(final_grid_map);
  }, [movedTimes]);
  const refreshRecordsScore = () => {
    return multiQueryStorage([/* "blocks_color",  *//* "current_game_mode", */ "ranking_records"])
    .then(valMap => {
      let ranking_records = JSON.parse(valMap.get("ranking_records")) || {};
      const flatScoreRecords = [];
      for (let name in ranking_records) {
        for (let i=0, l=ranking_records[name].length; i<l ; i++) {
          flatScoreRecords.push({
            grid_size: ranking_records[name][i].grid_size,
            score: ranking_records[name][i].scores.split(",").reduce((p,c) => Number(c) + p, 0),
            date: ranking_records[name][i].record_timestamp,
            player_name: name,
          })
        }
      }
      flatScoreRecords.sort((a, b) => b.score - a.score);
      console.log("flatScoreRecords --->", flatScoreRecords);
      console.log("current game mode --- >", CurrentGameMode)
      setRecordsScoreArray(flatScoreRecords.filter(item => (item.grid_size).toString() === (CurrentGameMode === 0 ? 4 : 5).toString()));
    });
  }
  useEffect(() => {
    setShowGameGesturePan(true);
    // showGrid();
    // hideGrid();
    randomPutNewBlock(new Array(GRID_NUM).fill(null));
    refreshRecordsScore()
      .then(f => {
        multiQueryStorage(["blocks_color"])
          .then(valMap => {
            const stored_blocks_color = valMap.get("blocks_color");
            let blockMap = [];
            if (stored_blocks_color) {
              const copy = JSON.parse(JSON.stringify(BlockTypesMap));
              const stored_colors_arr = stored_blocks_color.split(",");
              copy.map((item, index) => {
                item.fill = stored_colors_arr[index];
                return item;
              });
              blockMap = copy;
              // setGlobalBlockTypesMap(copy);
            } else {
              const copy = JSON.parse(JSON.stringify(BlockTypesMap));
              blockMap = copy.map(item => {
                item.fill = ColorUtils(item.fill).hex();
                return item;
              })
            }
            setGlobalBlockTypesMap(blockMap);
            globalBlockTypesMap_copy = JSON.parse(JSON.stringify(blockMap));
            if (CurrentGameMode === 0) setGRID_SIZE(4);
            else setGRID_SIZE(5);

            showGrid();
          })
          .catch(err => console.error(err));
      });
    console.log("CurrentGameMode==>", CurrentGameMode);
  }, []);
  useEffect(() => navigation.addListener("blur", () => setShowGameGesturePan(false), [navigation]));
  useEffect(() => navigation.addListener("focus", () => setShowGameGesturePan(true), [navigation]));
  return (
    <>
      <OptionOverlay
        visibility={optionOverlayVisibility}
        mainTitle={optionOverlayMainTitle}
        caption={optionOverlayCaption}
        selectedCallBack={() => {setOptionOverlayVisibility(false)}}
        cancelable={false}
        Body={optionOverlayBody}
        fullDisplayedDialogCallBack={() => {
          textInputRef?.current && textInputRef.current.focus();
        }}
      />
      <NewRecordSnackBarOverlay show={newRecordSnackBarOverlay} type={GRID_SIZE} />
      <SafeAreaView style={{flex: 1, position: "relative", justifyContent: "center", backgroundColor: dark ? "#000" : "#f5f5f5", position: "relative"}}>
        {
          showActivityIndicator ? (
            <View style={{position: "absolute", width: "100%", height: "100%", flexDirection: "row-reverse"}}>
              <View style={{alignItems: "flex-end", justifyContent: "center", flexDirection: "row", margin: 16}}>
                <Text style={{color: dark ? "gold" : "goldenrod", fontWeight: "bold", paddingHorizontal: 8}}>稍后</Text>
                <ActivityIndicator size="small" color={colors.text} animating={showActivityIndicator} />
              </View>
            </View>
          ) : <></>
        }
        <GridPropsContext.Provider value={gridProps}>
          <Animated.View style={{
            width: boxSize, height: boxSize, padding: gridProps.size*(gridProps.gapRate/2), justifyContent: "space-between",
            flexWrap: "wrap", flexDirection: "row", alignSelf: "center", backgroundColor: dark ? "#353535" : "#f0f1f5",
            borderRadius: 5, position: "relative", opacity: rateAnim, translateY: rateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [120, 0],
            }),
          }}>
            <BoxBackGround boxSize={boxSize} size={gridProps.size} gapRate={gridProps.gapRate} />
            {
              gridState.map((i, d) => (
                <Block key={"cell"+d} INDEX={i} gridIndex={d} enableZoomAnimation={true} 
                  {
                    ...{globalBlockTypesMap, nextRandomPutBlockIndex, setNextRandomPutBlockIndex}
                  }
                />
              ))
            }
          </Animated.View>
          {/* Gesture pad */}
          <GameGesturePan 
            shouldShow={showGameGesturePan}
            onLayout={(event) => {
              console.log("layout: -->", event.nativeEvent.layout);
              // console.log(useWindowDimensions());
              console.log("global screen size changed...")
              setGlobalScreenSize(event.nativeEvent.layout);
              // hideGrid();
            }} 
            onHandleFlingLeft={() => {
              // console.log("fling Left");
              setCurrentFlingDirection("LEFT");
              setMovedTimes(movedTimes + 1);
            }}
            onHandleFlingRight={() => {
              // console.log("fling Right");
              setCurrentFlingDirection("RIGHT");
              setMovedTimes(movedTimes + 1);
            }}
            onHandleFlingUp={() => {
              // console.log("fling Up");
              setCurrentFlingDirection("UP");
              setMovedTimes(movedTimes + 1);
            }}
            onHandleFlingDown={() => {
              // console.log("fling Down");
              setCurrentFlingDirection("DOWN");
              setMovedTimes(movedTimes + 1);
            }}
          />
          {/* Gesture pad */}
          <GamePageHeader navigation={navigation} 
            {...{playerName, setPlayerName, /* setScoreStamps, setTimeStamps, startTimestamp, */ setOptionOverlayBody, setOptionOverlayMainTitle, setOptionOverlayVisibility, textInputRef, globalScreenSize, statusPanelMovedOffsetsArr, movedTimes, currentScore, timeSec, recordsScoreArray}}
            onPressHomeBtn={PauseGame}
          />
        </GridPropsContext.Provider>
      </SafeAreaView>
    </>
  )
};

const GameGesturePan = ({onHandleFlingLeft=()=>{}, onHandleFlingRight=()=>{}, onHandleFlingUp=()=>{}, onHandleFlingDown=()=>{}, onLayout=()=>{}, shouldShow=false}) => {

  return (
    <FlingGestureHandler  direction={Directions.LEFT} onHandlerStateChange={({ nativeEvent }) => nativeEvent.state === State.ACTIVE && onHandleFlingLeft()}>
    <FlingGestureHandler direction={Directions.RIGHT} onHandlerStateChange={({ nativeEvent }) => nativeEvent.state === State.ACTIVE && onHandleFlingRight()}>
    <FlingGestureHandler direction={Directions.UP} onHandlerStateChange={({ nativeEvent }) => nativeEvent.state === State.ACTIVE && onHandleFlingUp()}>
    <FlingGestureHandler direction={Directions.DOWN} onHandlerStateChange={({ nativeEvent }) => nativeEvent.state === State.ACTIVE && onHandleFlingDown()}>
      {
        shouldShow ? <View onLayout={onLayout} style={[StyleSheet.absoluteFill, {width: "100%", height: "100%"}]} /> : <View onLayout={onLayout} style={{width: 0, height: 0}} />
      }
    </FlingGestureHandler>
    </FlingGestureHandler>
    </FlingGestureHandler>
    </FlingGestureHandler>
  )
};

const BoxBackGround = ({ boxSize }) => {
  return (
    <View style={{position: "absolute", top: 0, left: 0, width: boxSize, height: boxSize}}>
      {/* {[1,2,3].map((i) => (
        <React.Fragment key={"sp" + i}>
          <BorderLine index={i} width="100%" />
        </React.Fragment>
      ))}
      {[0,1,2,3,4].map((i) => (
        <React.Fragment key={"sp" + i}>
          <BorderLine index={i} height="100%" bw={2} />
        </React.Fragment>
      ))} */}
    </View>
  )
};

function BorderLine({ index=0, top=0, left=0, width=0, height=0, borderColor="#ffffff22", bw=1 }) {
  const { size, gapRate } = useContext(GridPropsContext);
  if (height) {
    left = size*(index+gapRate/2) - bw/2;
    var rest_style = {borderLeftColor: borderColor, borderLeftWidth: bw};
  }
  if (width) {
    top = size*(index+gapRate/2) - bw/2
    var rest_style = {borderBottomColor: borderColor, borderBottomWidth: bw};
  };
  return (
    <View style={{position: "absolute", top, left, width, height, ...rest_style}} />
  )
};

const styles = StyleSheet.create({
  optionBody: {flexDirection: "column", padding: 14, paddingHorizontal: 24, justifyContent: "center"}
})