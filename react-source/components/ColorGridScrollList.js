import React, { useRef, useState } from "react";
import { ScrollView, View, Pressable, StyleSheet, ActivityIndicator, Animated, Easing, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { IconChevron } from "../Icons";
// import { Easing } from "react-native-reanimated";
// import { transform } from "@babel/core";

const ColorGridSize = 25;

export const ColorGridScrollList = ({ colorsListScrollViewRef, rowNumber=4, colorSetArray, globalBlockTypesMap, setGlobalBlockTypesMap, currentPageNum, showIndicator, showExpandBtn=true, handlePressExpandBtn, expandBtnChevronDirection="bottom", onLongPressGrids=()=>()=>{} }) => {
  const {colors, dark} = useTheme();
  return (
    <ScrollView contentContainerStyle={{paddingVertical: 5}} horizontal={true} fadingEdgeLength={20} style={{height: (ColorGridSize+5)*rowNumber+10+34, paddingVertical: 16}} ref={colorsListScrollViewRef}>
      <View style={{height: "100%", flexDirection: "column", alignContent: "flex-start", flexWrap: "wrap"}}>
        {
          colorSetArray.map((item, index) => {
            return (
              <ColorGrid key={"color_map"+index} fill={item/* .color */} {...{globalBlockTypesMap, setGlobalBlockTypesMap, currentPageNum, /* handleColorGridPressed, index */}} 
                onLongPress={onLongPressGrids(index)}
              />
            )
          })
        }
        {
          showExpandBtn && !showIndicator ? (
            <TouchableOpacity onPress={handlePressExpandBtn}>
              <View style={styles.colorGridContainer}>
                <View style={[styles.colorGridInner, {overflow: "hidden", justifyContent: "center", alignItems: "center"}]}>
                  <IconChevron width={20} height={20} fill={colors.text} chevronDirection={expandBtnChevronDirection} />
                </View>
              </View>
            </TouchableOpacity>
          ) : <></>
        }
        {
          showIndicator ? (<View style={styles.colorGridContainer}><ActivityIndicator size="small" color="grey" animating={showIndicator} /></View>) 
            : (<></>)
        }
      </View>
    </ScrollView>
  )
};

const ColorGrid = ({ fill="transparent", index, globalBlockTypesMap, setGlobalBlockTypesMap, currentPageNum, onLongPress=()=>{} }) => {
  const blockIsUsedTheFillColor = globalBlockTypesMap.some(v => v.fill === fill);
  const {colors, dark} = useTheme();
  const zoomAnim = useRef(new Animated.Value(1)).current;
  const zoomIn = () => {
    Animated.timing(zoomAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.elastic(5),
      useNativeDriver: true,
    }).start();
  };
  const zoomOutIn = () => {
    Animated.timing(zoomAnim, {
      toValue: .65,
      duration: 100,
      useNativeDriver: true,
    }).start(() => zoomIn());
  }
  return (
    <Pressable
      onPress={() => {
        setGlobalBlockTypesMap(
          newBlockTypesMap(globalBlockTypesMap, currentPageNum, fill)
        );
        zoomOutIn();
      }}
      onLongPress={onLongPress}
    >
      <Animated.View style={[
        styles.colorGridContainer, {transform: [{scale: zoomAnim}]}
      ]}>
        {
          blockIsUsedTheFillColor ? 
            (<View style={[styles.colorGridTopRightDot, {borderColor: dark ? "#222325" : "#fff", backgroundColor: colors.primary}]} />)
            : <></>
        }
        <View style={[styles.colorGridInner, {backgroundColor: fill, borderColor: blockIsUsedTheFillColor ? colors.primary : "#b1b2bbcc"}]}></View>
      </Animated.View>
    </Pressable>
  )
};

const newBlockTypesMap = (target, idx, val) => 
  target.map((item, d) => {
    // let [index, infos] = item;
    if (d === idx) {
      item.fill = val;
    };
    return item;
  });
  // new Map([...target].map((item, d) => {
  //   let [index, infos] = item;
  //   if (d === idx) {
  //     infos.fill = val;
  //   };
  //   return [index, infos];
  // }));

const styles = StyleSheet.create({
  colorGridContainer: {
    width: ColorGridSize+5, height: ColorGridSize+5, justifyContent: "center", alignItems: "center",
    // position: "relative",
  },
  colorGridInner: {
    width: ColorGridSize, height: ColorGridSize, borderColor: "#b1b2bbcc", borderRadius: 6, borderWidth: 2
  },
  colorGridTopRightDot: {
    position: "absolute", right: 0, top: 0, width: 10, height: 10, borderRadius: 5,
    zIndex: 1, borderWidth: 2,
  }
});