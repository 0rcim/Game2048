import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, StyleSheet, PixelRatio, Pressable, TextInput, Keyboard, Animated, Easing } from "react-native";
import { useTheme } from "@react-navigation/native";

import { Pressable as Button, NotificationBtn, SuccessBtn } from "../components/Pressable";
import { IconScore, IconHome, IconRestore, IconClock, IconRank, IconMore, IconTimer, IconPlayer, IconMove, IconDropDown } from "../Icons";
// import { color } from "react-native-reanimated";
import { useLang } from "../I18n";
import { parseSecTime, MAIN_FONT_NAME, soundBeep, playSound } from "../plugins";
import { GlobalSettingsContext } from "../GlobalContext";
import CheckBox from "@react-native-community/checkbox";

import { setStorage } from "../plugins/Database";

const px = 1 / PixelRatio.get();


export const GamePageHeader = ({ navigation, playerName, /* startTimestamp, setTimeStamps, setScoreStamps, */ setPlayerName, recordsScoreArray, onPressHomeBtn=()=>{}, currentScore=0, globalScreenSize, textInputRef, statusPanelMovedOffsetsArr, setOptionOverlayMainTitle, setOptionOverlayVisibility, setOptionOverlayBody, movedTimes, timeSec }) => {
  const {
    SHOW_DOTS_NUM: [CurrentShowDotsNum, ChangeCurrentShowDotsNum],
  } = useContext(GlobalSettingsContext);
  const { colors, dark } = useTheme();
  const [showDotsNum, setShowDotsNum] = useState(CurrentShowDotsNum);
  // const [playerName, setPlayerName] = useState(undefined);
  const {PAGE_START: lang} = useLang();
  const [playerStateViewStyleTop, setPlayerStateViewStyleTop] = useState(72);
  // const [];
  useEffect(() => {
    const {width, height} = globalScreenSize;
    let minSize = Math.min(width, height);
    if (minSize < 300 && minSize > 0) {
      setPlayerStateViewStyleTop(-30);
    } else {
      setPlayerStateViewStyleTop(72);
    }
  }, [globalScreenSize]);
  useEffect(() => {
    if (showDotsNum > 3) {
      setShowDotsNum(0);
      ChangeCurrentShowDotsNum(0);
    };
  }, [showDotsNum]);
  return  (
    <View 
      style={{
        position: "absolute", left: 0, top: 0, paddingTop: 30,
        width: "100%", paddingHorizontal: 18, backgroundColor: "rgba(0,0,0,0)"
      }}
    >
      <View style={{alignSelf: "flex-end"}}>
        <Pressable style={[styles.statusPanelItem, {marginBottom: 8}, {position: "absolute", top: playerStateViewStyleTop}]}
          
          onPress={() => {
            // console.log("ssss")
            setOptionOverlayMainTitle(lang.CHANGE_PLAYERS_NAME);
            setOptionOverlayVisibility(true);
            setOptionOverlayBody(
              <InputOptionOverlayComponent 
                {...{setOptionOverlayVisibility, textInputRef, setPlayerName}}
                placeholder={playerName} 
              />
            );
          }}
        >
          <IconPlayer fill={colors.text} width={16} height={16} />
          <Text style={{fontSize: 12, alignSelf: "center", marginRight: 8, alignItems: "center", justifyContent: "center"}}>
            {/* <Text style={styles.otherText}>{lang.PLAYER_NAME}</Text> */}
            <IconDropDown fill={colors.text} width={16} height={16} />
            <Text style={[styles.decoratedText, {color: playerName ? colors.text : (dark ? "dimgrey" : "lightgrey")}]}>{playerName || lang.GAMER_UNNAMED}</Text>
          </Text>
        </Pressable>
      </View>
      <View style={{flex: 1, alignItems: "center", flexDirection: "row", justifyContent: "space-between"}}>
        <Button style={styles.iconBtn} disableHighlight={!dark} 
          component={<IconHome width={32} height={32} fill={colors.text} />}
          onPress={onPressHomeBtn}
        />
        <ScoreBoard {...{currentScore, movedTimes/* , startTimestamp, setTimeStamps, setScoreStamps */}} />
        <Button style={styles.iconBtn} disableHighlight={!dark} 
          onPress={() => {
            setShowDotsNum(showDotsNum + 1);
            ChangeCurrentShowDotsNum(showDotsNum + 1);
          }}
          component={<IconMore width={32} height={32} dotsFillArray={new Array(showDotsNum).fill(dark ? "gold" : "goldenrod")} />}
        />
      </View>
      <StatusPanel {...{playerName, currentScore, showDotsNum, statusPanelMovedOffsetsArr, movedTimes, timeSec, playerStateViewStyleTop, recordsScoreArray}}
      />
    </View>
  )
};


let nameVal = "";

function InputOptionOverlayComponent({ placeholder, setOptionOverlayVisibility, textInputRef, setPlayerName }) {
  const {colors, dark} = useTheme();
  const {
    SAVED_PLAYER_NAME: [CurrentPlayerName, ChangeCurrentPlayerName],
  } = useContext(GlobalSettingsContext);
  const [playerNameVal, setPlayerNameVal] = useState(placeholder);
  const {PAGE_START: lang} = useLang();
  const onSubmitEditing = () => {
    setOptionOverlayVisibility(false);
    // setPlayerName(playerNameVal);
    if (nameVal !== placeholder) {
      setPlayerName(nameVal);
      console.log("player name changed.");
      if (rememberMeChecked) {
        // 玩家名称可为空，为空显示为「匿名」
        setStorage("saved_player_name", nameVal)
          .then(f => {
            ChangeCurrentPlayerName(nameVal)
          })
          .catch(error => {
            console.log(error);
          })
      }
    }
    // console.log("name vale -->", playerNameVal);
  };
  useEffect(() => {
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);
  }, []);
  useEffect(() => {
    if (nameVal !== playerNameVal) {
      nameVal = playerNameVal;
      // console.log("input text changed -->>", playerNameVal);

    }
  }, [playerNameVal])
  const _keyboardDidHide = () => {
    textInputRef?.current?.blur();
  };
  const [rememberMeChecked, setRememberMeChecked] = useState(Boolean(CurrentPlayerName));
  return (
    <View style={{padding: 14, paddingHorizontal: 24}}>
      <TextInput ref={textInputRef} selectTextOnFocus showSoftInputOnFocus maxLength={35} /* underlineColorAndroid="#018577" */
        placeholder={placeholder || lang.GAMER_UNNAMED} placeholderTextColor="grey"
        value={playerNameVal} 
        style={{fontSize: 16, color: colors.text}}
        onChangeText={(text) => setPlayerNameVal(text)} 
        onSubmitEditing={onSubmitEditing}
        style={{backgroundColor: colors.background, borderRadius: 4, color: colors.text, fontSize: 16, fontWeight: "bold"}}
      />
      <Pressable onPress={() => setRememberMeChecked(!rememberMeChecked)} style={{alignSelf: "flex-end"}}>
        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-end", padding: 8, paddingRight: 8, marginTop: 12,}}>
          <Text style={{color: colors.text, fontWeight: "bold"}}>记住我</Text>
          <CheckBox tintColors={{false: "grey"}} value={rememberMeChecked} onValueChange={setRememberMeChecked} />
        </View>
      </Pressable>
      <View style={{flexDirection: "row", paddingTop: 12, justifyContent: "center"}}>
        <NotificationBtn onPress={() => {
            setOptionOverlayVisibility(false);
          }} title={lang.CANCEL} />
          <SuccessBtn onPress={onSubmitEditing} title={lang.OK} />
        {/* <Button highlightColor="rgba(255, 69, 58, .16)" style={styles.dialog_btn} color={colors.notification} fontSize={18} 
          
        />
        <Button highlightColor="rgba(23, 180, 93, .16)" style={styles.dialog_btn} color="green" fontSize={18} 
          
        /> */}
      </View>
    </View>
  )
};

// let id_count = 0;
let scored_points_arr = [];
let time_stamps_arr = [];
let previous_time = null;

function ScoreBoard({ currentScore, movedTimes, /* startTimestamp, setScoreStamps=()=>{}, setTimeStamps=()=>{}, */  }) {
  const { colors, dark } = useTheme();
  const lang = useLang();
  const [scoredPoints, setScoredPoints] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [scoredPointsAnimatedViewData, setScoredPointsAnimatedViewData] = useState({id: 0, points: 0});
  useEffect(() => {
    setScoredPoints(currentScore - previousScore);
    setPreviousScore(currentScore);
  }, [currentScore]);
  useEffect(() => {
    if (scoredPoints > 0) {
      setScoredPointsAnimatedViewData({id: movedTimes, points: Number(scoredPoints)});
    }
  }, [scoredPoints]);
  useEffect(() => {
    setScoredPoints(0);
  }, [movedTimes]);
  // useEffect(() => {
  //   const temp_date = new Date();
  //   scored_points_arr[movedTimes - 1] = scoredPoints;
  //   time_stamps_arr[movedTimes - 1] = (temp_date - (previous_time || startTimestamp));
  //   previous_time = temp_date;
  //   setScoreStamps(scored_points_arr.join());
  //   setTimeStamps(time_stamps_arr.join());
  // }, [movedTimes, scoredPoints]);
  // useEffect(() => {
  //   console.log(movedTimes, "score ----> +", scoredPointsAnimatedViewData.points);
  // }, [movedTimes])
  return (
    <View style={[styles.scoreBoardContainer, {backgroundColor: dark ? "#ffffff22" : "#ffffffcc", paddingLeft: 10, position: "relative"}]}>
      <View style={{alignItems: "center", flexDirection: "row"}}>
        <IconScore width={24} height={24} />
        <Text style={[styles.score, {color: colors.text}, lang.LANG === "CN" ? {fontWeight: "bold", fontSize: 18} : {fontSize: 28}]}> {lang.PAGE_START.SCORE} </Text>
      </View>
      <ScoreDisplay currentScore={currentScore} decoration={true} padZero={true} />
      <ScoredPointsDisplay key={scoredPointsAnimatedViewData.id} {...{scoredPointsAnimatedViewData, currentScore, previousScore, movedTimes/* , setTimeStamps */}} />
    </View>
  )
};


function ScoredPointsDisplay ({ /* afterAnimated=()=>{}, movedTimes, currentScore, previousScore, setTimeStamps=()=>{}, */ scoredPointsAnimatedViewData: {id, points} }) {
  const {colors} = useTheme();
  const moveAnim = useRef(new Animated.Value(0)).current;
  const {
    SOUND_VOLUME
  } = useContext(GlobalSettingsContext);
  const moveUp = (fn) => {
    Animated.timing(moveAnim, {
      duration: 1000,
      toValue: 1,
      easing: Easing.linear((x) => 1 - Math.pow(1 - x, 8)),
      useNativeDriver: true,
    }).start(fn);
  };
  const moveBack = (fn) => {
    Animated.timing(moveAnim, {
      duration: 0,
      toValue: 0,
      useNativeDriver: true,
    }).start(fn);
  };
  useEffect(() => {
    // console.log("created: score +", scoredPoints);
    if (id !== 0) {
      id !== 0 && moveUp(() => moveBack(/* afterAnimated */));
      // soundBeep.play();
      playSound(soundBeep, SOUND_VOLUME);
    }
    // setScoredPoints(0);
  }, [])
  // useEffect(() => {
  //   if (current_moved_times !== movedTimes) {
  //     current_scored_points = currentScore - previousScore;
  //     console.log(movedTimes, "score ----> +", current_scored_points);
  //     current_moved_times = movedTimes;
  //     // current_scored_points = 0;
  //   }
  // }, [movedTimes, points]);
  return (
    <Animated.View style={{
      position: "absolute", width: "100%", alignSelf: "flex-end", alignItems: "flex-end", paddingHorizontal: 4,
      opacity: moveAnim.interpolate({
        inputRange: [0,.9,1],
        outputRange: [0,1,0]
      }), 
      translateY: moveAnim.interpolate({
        inputRange: [0,1],
        outputRange: [0,-48]
      })
    }}>
      <Text style={{fontSize: 24, color: colors.text, fontFamily: MAIN_FONT_NAME}}>+{points}</Text>
    </Animated.View>
  )
}

export function ScoreDisplay({ currentScore, padZero=false, decoration=false, fontSize=28, tintColor={dark: "gold", light: "darkgoldenrod"}, tintZeroColor={dark: "#ffffff55", light: "#00000022"} }) {
  const { colors, dark } = useTheme();
  const maxScore = 9999999, maxLen = maxScore.toString().length;
  let current = currentScore.toString();
  if (maxScore <= currentScore) currentScore = maxScore;
  let goldColor = dark ? tintColor.dark : tintColor.light;
  return (
    <Text style={[styles.score, {color: goldColor/* , textDecorationLine: decoration ? "underline" : "none" */, fontSize}]}>
    {
      padZero ? new Array(maxLen - current.length).fill(0).map((item, index) => {
        return (
          <Text key={"num_zero"+index} style={{color: dark ? tintZeroColor.dark : tintZeroColor.light}}>{item}</Text>
        )
      }) : <></>
    }
    {current}
  </Text>
  )
};

let copy_recordsScoreArray = [];
const GAME_MODE_STRING = [
  "4x4","5x5"
];

function StatusPanel({ playerName, timeSec=0, currentScore=0, onPressPlayerName=()=>{}, recordsScoreArray=[], showDotsNum, statusPanelMovedOffsetsArr=[], movedTimes=0, playerStateViewStyleTop }) {
  const { colors, dark } = useTheme();
  const { PAGE_START: lang } = useLang();
  const { hours, minutes, seconds } = parseSecTime(timeSec);
  const [realtimeRanking, setRealtimeRanking] = useState(recordsScoreArray.length+1);
  const [closePlayerRecord, setClosePlayerRecord] = useState(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const {
    GAME_MODE: [CurrentGameMode, ChangeCurrentGameMode],
  } = useContext(GlobalSettingsContext);
  useEffect(() => {
    // console.log("recordsScoreArray", recordsScoreArray)
    setRealtimeRanking(recordsScoreArray.length+1);
    setClosePlayerRecord(recordsScoreArray[recordsScoreArray.length-1]);
    copy_recordsScoreArray = JSON.parse(JSON.stringify(recordsScoreArray));
  }, [recordsScoreArray]);
  useEffect(() => {
    if (!isMounted) setIsMounted(true);
  }, [closePlayerRecord]);
  useEffect(() => {
    if (isMounted) fadeIn();
  }, [isMounted]);
  useEffect(() => {
    if (closePlayerRecord && closePlayerRecord.score <= currentScore/* score */) {
      copy_recordsScoreArray.pop();
      setRealtimeRanking(copy_recordsScoreArray.length+1);
      setClosePlayerRecord(recordsScoreArray[copy_recordsScoreArray.length-1]);
    }
    // console.log("---> close record", recordsScoreArray[copy_recordsScoreArray.length-1], "current score= ", currentScore);
  }, [currentScore]);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = () => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };
  const fadeOut = () => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  return (
    <Animated.View style={{flex: 1, marginTop: playerStateViewStyleTop < 0 ? 0 : 36, opacity: opacityAnim}}>
      <View>
        <StatusPanelItem 
          dotIndexRefNumber={0}
          showDotsNum={showDotsNum}
          iconComponent={<IconTimer fill={colors.text} width={16} height={16} />}
          textComponent={(
            <Text style={[styles.statusPanelItemText, {color: colors.text, textDecorationColor: colors.text}]}>
              <Text style={styles.decoratedText}>{hours} : {minutes} : {seconds}</Text>{/* <Text style={styles.otherText}>{lang.HOURS}</Text> */}
              {/* <Text style={styles.otherText}>{lang.MINUTES}</Text> */}
              {/* <Text style={styles.otherText}>{lang.SECONDS}</Text> */}
            </Text>
          )}
        />
        <StatusPanelItem
          dotIndexRefNumber={1}
          showDotsNum={showDotsNum}
          iconComponent={<IconRank fill={colors.text} width={16} height={16} />}
          textComponent={(
            <>
              <Text style={[styles.statusPanelItemText, {color: colors.text}]}>
                {/* <Text style={[styles.otherText, {alignSelf: "flex-end", paddingVertical: 2, fontSize: 12}]}>
                  <Text>前一名分数 </Text>
                  <Text style={[styles.decoratedText, {color: colors.text}]}>
                    {closePlayerRecord?.score || "-"}
                  </Text>
                </Text> */}
                {/* <Text style={styles.otherText}>({GAME_MODE_STRING[CurrentGameMode]}){lang.RANK}</Text> */}
                <Text style={styles.decoratedText}>{realtimeRanking}<Text style={[styles.otherText, {fontSize: 14}]}>  / {recordsScoreArray.length+1}</Text></Text>
              </Text>
              <View style={{backgroundColor: colors.card, flexDirection: "row", alignItems: "center", padding: 4, paddingVertical: 2, marginHorizontal: 4, borderRadius: 4, borderColor: colors.border, borderWidth: 1}}>
                <Text style={[styles.otherText, {fontSize: 12, fontWeight: "bold"}]}>前一名 </Text>
                <Text style={[styles.decoratedText, {color: colors.text, fontSize: 14}]}>
                  {closePlayerRecord?.score || "-"}
                </Text>
              </View>
            </>
          )}
        />
        <StatusPanelItem
          dotIndexRefNumber={2}
          showDotsNum={showDotsNum}
          iconComponent={<IconMove fill={colors.text} width={16} height={16} offsets_arr={statusPanelMovedOffsetsArr} />}
          textComponent={(
            <Text style={[styles.statusPanelItemText, {color: colors.text}]}>
              {/* <Text style={styles.otherText}>{lang.MOVED_TIMES}</Text> */}
              <Text style={styles.decoratedText}>{movedTimes}</Text>
            </Text>
          )}
        />
      </View>
    </Animated.View>
  )
};

const StatusPanelItem = ({ iconComponent, textComponent, dotIndexRefNumber, showDotsNum }) => {
  const rateAnim = useRef(new Animated.Value(0)).current;
  const [show, setDisplay] = useState(true);
  const fadeOut = () => {
    Animated.timing(rateAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start((finished) => finished && setDisplay(false));
  };
  const fadeIn = () => {
    setDisplay(true);
    Animated.timing(rateAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };
  useEffect(() => {
    if (showDotsNum > dotIndexRefNumber) fadeIn();
    else fadeOut();
  }, [showDotsNum])
  return (
    show ? (
      <Animated.View style={[styles.statusPanelItem, {opacity: rateAnim}]}>
        {iconComponent}
        {textComponent}
      </Animated.View>
    ) : <></>
  )
}

const styles = StyleSheet.create({
  scoreBoardContainer: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 16,
    position: "relative",
  },
  score: {
    fontFamily: MAIN_FONT_NAME,
    fontSize: 28,
  },
  iconBtn: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 26,
  },
  decoratedText: {
    /* textDecorationLine: "underline",  */fontFamily: MAIN_FONT_NAME,
    fontSize: 16,
  },
  otherText: {
    color: "lightslategrey"
  },
  dialog_btn: {
    paddingVertical: 12, paddingHorizontal: 26,
  },
  statusPanelItem: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  statusPanelItemText: {
    fontSize: 12, alignSelf: "center", marginRight: 8,
  }
});