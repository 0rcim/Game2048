import React, { useState } from "react";
import { View, Text, TouchableHighlight, StyleSheet } from "react-native";
import { IconFolder, IconChevron } from "../Icons";
import { useTheme } from "@react-navigation/native";
import { ColorUtils } from "../plugins";

export const IconListItem = ({ FrontIconVar=IconFolder, title, subtitle, EndIconVar=IconChevron, onPress=()=>{} }) => {
  const { colors, dark } = useTheme();
  return (
    <TouchableHighlight onPress={onPress} underlayColor={dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)"}>
      <View style={styles.container}>
        <View style={styles.leftIconContainer}>
          <FrontIconVar width={36} height={36} />
        </View>
        <View style={styles.centerContentContainer}>
          <View style={styles.contentContainer}>
            <Text numberOfLines={1} style={[styles.name, {color: colors.text}]}>{title}</Text>
            <Text numberOfLines={1} style={[styles.info, {color: colors.text}]}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.rightFlgContainer} >
          <EndIconVar width={24} height={24} fill={colors.text} chevronDirection="right" />
        </View>
      </View>
    </TouchableHighlight>
  )
};

const ITEM_HEIGHT = 62;

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  leftIconContainer: {
    width: 40,
    height: ITEM_HEIGHT,
    // backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContentContainer: {
    flex: 10,
    height: ITEM_HEIGHT,
    justifyContent: "center",
  },
  rightFlgContainer: {
    flex: 1,
    height: ITEM_HEIGHT,
    // backgroundColor: "#f0f",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  contentContainer: {
    height: 36,
    paddingLeft: 8,
    // backgroundColor: "tomato",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
  },
  info: {
    fontSize: 11,
  }
});