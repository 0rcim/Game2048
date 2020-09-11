import React, { useState } from "react";
import { View, Text, PanResponder, CheckBox, StylesSheet } from "react-native";
import { useTheme } from "@react-navigation/native";

import { Pressable } from "./Pressable";

export const SlideDownSection = ({ children }) => {
  const { colors, dark } = useTheme();
  return (
    <View
      style={{
        backgroundColor: dark ? "#ffffff11" : "#00000011",
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-around",
      }}
    >
      {children}
    </View>
  )
};

export const OutlinedButton = ({ title, fontSize=16, onPress=()=>{}, style={}, color, active=false }) => {
  const { colors } = useTheme();
  return (
    <Pressable {...{onPress, title, fontSize, color: active ? colors.primary : color}} 
      style={[
        {paddingHorizontal: 8, paddingVertical: 8, borderRadius: 4, borderWidth: 1, margin: 8}, 
        style, 
        active ? {borderColor: colors.primary} : {borderColor: colors.text}
      ]} />
  )
}
