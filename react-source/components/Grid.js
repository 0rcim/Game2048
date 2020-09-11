import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { useTheme } from "@react-navigation/native";
import { NamedColors, ColorUtils, MAIN_FONT_NAME } from "../plugins";

// export const mapTypes = new Map([
//   [2, {text: "2", lv: 0, fill: "cornflowerblue", color: "#fff"}],
//   [4, {text: "4", lv: 1, fill: "orange", color: "#fff"}],
//   [8, {text: "8", lv: 2, fill: "yellow", color: "#000"}],
//   [16, {text: "16", lv: 3, fill: "green", color: "#fff"}],
//   [32, {text: "32", lv: 4, fill: "yellowgreen", color: "#fff"}],
//   [64, {text: "64", lv: 5, fill: "blue", color: "#fff"}],
//   [128, {text: "128", lv: 6, fill: "teal", color: "#fff"}],
//   [256, {text: "256", lv: 7, fill: "purple", color: "#fff"}],
//   [512, {text: "512", lv: 8, fill: "grey", color: "#fff"}],
//   [1024, {text: "1024", lv: 9, fill: "pink", color: "#000"}],
//   [2048, {text: "2048", lv: 10, fill: "white", color: "#000"}],
// ]);

export const GridPropsContext = React.createContext({
  size: 60,
  gapRate: .1,
});


export const BlockTypesMap = [
  {text: "2", lv: 0, fill: "blueviolet"},
  {text: "4", lv: 1, fill: "brown"},
  {text: "8", lv: 2, fill: "yellow"},
  {text: "16", lv: 3, fill: "green"},
  {text: "32", lv: 4, fill: "yellowgreen"},
  {text: "64", lv: 5, fill: "blue"},
  {text: "128", lv: 6, fill: "teal"},
  {text: "256", lv: 7, fill: "purple"},
  {text: "512", lv: 8, fill: "fuchsia"},
  {text: "1024", lv: 9, fill: "pink"},
  {text: "2048", lv: 10, fill: "white"},
  {text: "4096", lv: 11, fill: "hotpink"},
  {text: "8192", lv: 12, fill: "indigo"},
  {text: "16384", lv: 13, fill: "orangered"},
  {text: "32768", lv: 14, fill: "crimson"},
  {text: "65536", lv: 15, fill: "mediumvioletred"},
];

export const Block = ({ INDEX, elevation=0, globalBlockTypesMap, enableZoomAnimation=false, gridIndex=0, nextRandomPutBlockIndex=null, setNextRandomPutBlockIndex }) => {
  // return (
  //   <Text style={{color: "#fff"}}>{INDEX}</Text>
  // )
  const { dark } = useTheme();
  const { size, gapRate } = useContext(GridPropsContext);
  const { text="", fill=dark?"#222":"#ffffffcc", lv=-1 } = globalBlockTypesMap[INDEX] || {};
  // const fillColor = (fill in NamedColors) ? NamedColors[fill] : fill;
  const fillColorIsDark = ColorUtils(fill).isDark();
  useEffect(() => {
    if (nextRandomPutBlockIndex === gridIndex) {
      // console.log("===>", gridIndex);
      zoomOut(() => zoomIn(() => setNextRandomPutBlockIndex(-1)));
    } else {
      zoomInFast();
    }
  }, [nextRandomPutBlockIndex]);
  const zoomAnim = useRef(new Animated.Value(enableZoomAnimation ? 0 : 1)).current;
  const zoomIn = (fn) => {
    Animated.timing(zoomAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => fn && fn());
  };
  const zoomInFast = (fn) => {
    Animated.timing(zoomAnim, {
      toValue: 1,
      duration: 0,
      useNativeDriver: true,
    }).start(() => fn && fn());
  }
  const zoomOut = (fn) => {
    Animated.timing(zoomAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start(() => fn && fn());
  };
  // useEffect(() => {
  //   if (enableZoomAnimation) {
  //     if (INDEX !== null) {
  //       console.log("a block has number");
  //       zoomIn();
  //     } else {
  //       zoomOut();
  //     }
  //   }
  // }, [INDEX])
  return (
    <Rect size={size}>
      <Rect size={size*(1-gapRate)} fill={fill} rs={size*.12} elevation={elevation} style={{position: "relative", overflow: "hidden"}} zoomAnim={zoomAnim}>
        {
          text.length ? 
            <Animated.Text style={{ color: fillColorIsDark ? "#fff" : "#000", fontFamily: MAIN_FONT_NAME, fontSize: text.length > 3 ? 1.6*size / text.length : size*.5/* size*.5 - text.length*5 */ }}>{text}</Animated.Text> : 
            <></>
        }
      </Rect>
    </Rect>
  )
};

const Rect = ({ size, alignSelf="center", fill="transparent", style={}, rs=0, children, elevation=0, zoomAnim=undefined }) =>
(
  <Animated.View style={[{
    width: size, height: size, 
    alignSelf, 
    borderRadius: rs, 
    backgroundColor: fill,
    justifyContent: "center", 
    alignItems: "center",
  }, zoomAnim ? {transform: [{scale: zoomAnim}]} : {}, style]} elevation={elevation}>{children}</Animated.View>
);