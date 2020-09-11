import React from "react";
import { View, Text, StyleSheet, PixelRatio } from "react-native";
import { useTheme } from "@react-navigation/native";
import { IconChevron } from "../Icons";
import { TouchableHighlight } from "react-native-gesture-handler";

const px = 1/PixelRatio.get();

export const PageHeader = ({ navigation, name, actionBtn, handleTouchBackIconButton=null }) => {
  const { colors, dark }  = useTheme();
  return (
    <View style={{marginHorizontal: -20, height: 56, flexDirection: "row", justifyContent: "flex-start",alignItems: "center", overflow: "hidden", borderBottomColor: "#aaaaaa56", borderBottomWidth: px, position: "relative"}}>
      <TouchableHighlight style={styles.iconBtn} underlayColor={dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}
        onPress={() => {
          handleTouchBackIconButton ? handleTouchBackIconButton() : navigation.goBack();
        }}
      >
        <IconChevron width={36} height={36} fill={colors.text} chevronDirection="left" />
      </TouchableHighlight>
      <Text numberOfLines={1} style={{color: colors.text, fontSize: 18}}>{name}</Text>
      {
        actionBtn ? (
          <View style={{position: "absolute", right: 8, top: 0, width: 56, height: "100%", justifyContent: "center", alignItems: "center"}}>{actionBtn}</View>
        ): <></>
      }
    </View>
  )
};
const styles = StyleSheet.create({
  iconBtn: {
    padding: 20,
    borderRadius: 44,
    alignSelf: "flex-start"
  }
})