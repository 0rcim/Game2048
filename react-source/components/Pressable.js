import React, { useState, useContext } from "react";
import { View, Text, PanResponder, StyleSheet, TouchableHighlight } from "react-native";
import { useTheme } from "@react-navigation/native";

import { soundClick, playSound } from "../plugins";
import { GlobalSettingsContext } from "../GlobalContext";

export const Pressable = ({ title, component, disableHighlight=false, style={}, fontSize=28, onPress=()=>{}, color }) => {
  const { colors, dark } = useTheme();
  const {
    SOUND_VOLUME
  } = useContext(GlobalSettingsContext);
  return (
    <TouchableHighlight onPress={(e) => {
      // soundClick.play();
      playSound(soundClick, SOUND_VOLUME);
      onPress(e);
    }} underlayColor={disableHighlight ? "transparent" : (dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)")} style={{borderRadius: 10, overflow: "hidden"}}>
      <View
        style={[
          {borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center" }, 
          style
        ]}
      >
        {title ? <Text style={{fontSize, fontWeight: "normal", color: color ? color : colors.text}}>{title}</Text> : <></>}
        {component}
      </View>
    </TouchableHighlight>
  )
};

export const PlainBtn = ({ onPress=()=>{}, title="", color=useTheme().colors.text }) => Pressable({
  title, onPress, 
  style: styles.dialog_btn,
  color,
  fontSize: 18,
});

export const NotificationBtn = ({ onPress=()=>{}, title="" }) => PlainBtn({
  onPress, title, color: useTheme().colors.notification
});

export const SuccessBtn = ({ onPress=()=>{}, title="" }) => PlainBtn({
  onPress, title, color: "green"
});

export const SpecialBtn = ({ onPress=()=>{}, title="" }) => PlainBtn({
  onPress, title, color: "goldenrod"
});

const styles = StyleSheet.create({
  dialog_btn: {
    paddingVertical: 12, paddingHorizontal: 26,
  }
});