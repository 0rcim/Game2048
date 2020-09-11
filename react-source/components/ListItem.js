import React, { useState } from "react";
import { View, Text, SafeAreaView, PanResponder } from "react-native";
import { useTheme } from "@react-navigation/native";
import { TouchableHighlight } from "react-native-gesture-handler";

import { soundClick } from "../plugins";

export const ListItem = ({ title, subtitle, children, onPress=()=>{}, disabled=false, onPressIn=()=>{}, onPressOut=()=>{} }) => {
  const { colors, dark } = useTheme();
  // const [ highlight, setHighlight ] = useState(false);
  return (
    <TouchableHighlight
      underlayColor={dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}
      touchSoundDisabled
      onPress={(e) => {
        soundClick.play(success => {
          success || console.log("playback failed due to audio decoding errors...");
          // soundClick.release();
        });
        disabled || onPress(e);
      }}
      {...{onPressIn, onPressOut}}
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          minHeight: 72,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 16,
              color: colors.text,
              fontWeight: "bold",
            }}
          >{title}</Text>
          {
            subtitle ? (
              <Text numberOfLines={1} style={{
                color: colors.text,
                fontSize: 12,
                alignSelf: "flex-start",
                color: dark ? "#67686d" : "#8c8e8f",
              }}>{subtitle}</Text>
            ) : <></>
          }
        </View>
        <View>{ children }</View>
      </View>
    </TouchableHighlight>
  )
};