import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native";
import { useTheme, useNavigation, StackActions } from "@react-navigation/native";

import { PlainBtn, NotificationBtn, SpecialBtn } from "./Pressable";
import { ScoreDisplay } from "./GamePageHeader";
import { RankListFragment, RANK_LIST_ITEM_COUNT, RANK_LIST_ITEM_HEIGHT } from "../Screens/Ranking";
import { useLang } from "../I18n";
import { IconCup, IconChevron } from "../Icons";

export const OptionOverlayBodyGameOver = ({ GameRestart, ExitGame, navigation, score, timeSec, playerName, top, movedTimes, dateObj, GRID_SIZE }) => {
  const { PAGE_START: lang } = useLang();
  const { colors, dark } = useTheme();
  const heightRate = useRef(new Animated.Value(0)).current;
  const opacityRate = useRef(new Animated.Value(0)).current;
  const [isFold, setIsFold] = useState(true);
  // const [animatedNumber, setAnimatedNumber] = useState(0);
  // const navigation = useNavigation();
  useEffect(() => {
    isFold ? fold() : expand();
  }, [isFold]);
  const fadeIn = () => {Animated.timing(opacityRate, {toValue: 1, duration: 400, useNativeDriver: false}).start()};
  const fadeOut = () => {Animated.timing(opacityRate, {toValue: 0, duration: 400, useNativeDriver: false}).start()};
  const expand = () => {
    Animated.timing(heightRate, {
      toValue: 1,
      duration: 300,
      easing: Easing.linear((x) => 1 - Math.pow(1 - x, 8)),
      useNativeDriver: false,
    }).start();
    fadeIn();
  };
  const fold = () => {
    Animated.timing(heightRate, {
      toValue: 0,
      duration: 800,
      easing: Easing.linear((x) => 1 - Math.pow(1 - x, 6)),
      useNativeDriver: false,
    }).start();
    fadeOut();
  };
  return (
    <View style={styles.optionBody}>
      <View>
        <View style={{alignSelf: "center"}}>
          {/* <View style={{alignItems: "flex-start", height: 0, translateY: -12}}>
            <Text style={{fontSize: 12, fontWeight: "bold", color: "gold"}}>新纪录</Text>
          </View> */}
          <View style={{alignItems: "center", alignSelf: "center"}}>
            <IconCup width={64} height={64} />
            <ScoreDisplay currentScore={score} padZero={true} fontSize={35} decoration={false} />
          </View>
        </View>
        <Animated.View style={{backgroundColor: dark ? "#ffffffaa" : "#00000011", marginTop: 12, marginHorizontal: -24, paddingHorizontal: 12, justifyContent: "center", borderRadius: 12, overflow: "hidden", opacity: opacityRate, height: heightRate.interpolate({
          inputRange: [0,1],
          outputRange: [0, RANK_LIST_ITEM_HEIGHT*RANK_LIST_ITEM_COUNT+12*2],
        }), alignSelf: "stretch"}}>
          <RankListFragment time={timeSec} top={top} player_name={playerName} moved_times={movedTimes} date={dateObj.toISOString()} grid_size={GRID_SIZE} />
        </Animated.View>
        <TouchableOpacity activeOpacity={.25} onPress={() => setIsFold(!isFold)}>
          <View style={{paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flexDirection: "column", alignItems: "center"}}>
            <Text style={{color: isFold ? colors.text : "grey"}}>{isFold ? "查看详情" : "折叠"}</Text>
            <Animated.View style={{alignSelf: "center", transform: [{rotate: heightRate.interpolate({
              inputRange: [0,1],
              outputRange: ["0deg","180deg"]
            })}]}}>
              <IconChevron chevronDirection="bottom" width={16} height={16} fill={colors.text} />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>
      <SpecialBtn onPress={() => navigation.push("Ranking")} title="查看排行榜" />
      <PlainBtn onPress={ExitGame} title={lang.EXIT_TO_MENU} />
      <NotificationBtn onPress={GameRestart} title="重开一局" />
    </View>
  )
};

const styles = StyleSheet.create({
  optionBody: {flexDirection: "column", padding: 14, paddingHorizontal: 24, justifyContent: "center"}
})