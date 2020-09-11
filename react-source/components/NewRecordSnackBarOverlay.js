import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, SafeAreaView, Alert, BackHandler, Pressable, PixelRatio, ScrollView, useWindowDimensions, Animated, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { IconScore } from "../Icons";
import { MAIN_FONT_NAME } from "../plugins";

const px = 1 / PixelRatio.get();

export const NewRecordSnackBarOverlay = ({ show, type="4" }) => {
  const {colors, dark} = useTheme();
  const [visible, setVisible] = useState(false);
  const moveAnim = useRef(new Animated.Value(0)).current;
  const moveIn = () => {
    Animated.timing(moveAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  const moveOut = () => {
    Animated.timing(moveAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };
  useEffect(() => {
    setVisible(show);
    // if (show) moveIn();
  }, [show]);
  useEffect(() => {
    visible && moveIn()
  }, [visible]);
  return visible ? (
    <SafeAreaView style={[StyleSheet.absoluteFill, {width: "100%", height: "100%", zIndex: 1, flexDirection: "column"}]}>
      <Pressable onPress={() => moveOut()} style={{flex: 1}}>
        <View style={{alignItems: "center", paddingTop: 30, flex: 1}}>
          <Animated.View style={[styles.snackBox, {backgroundColor: "#000000dd", borderColor: "#ffffffaa"}, {
            translateY: moveAnim.interpolate({
              inputRange: [0,1],
              outputRange: [-56, 0],
            }),
            opacity: moveAnim,
          }]}>
            <IconScore width={36} height={36} fill="#fff" />
            <View style={{paddingHorizontal: 8}}>
              <Text style={{color: "#f5f5f5", fontSize: 32, fontFamily: MAIN_FONT_NAME}}>{[type, type].join(" × ")}</Text>
              <Text style={{color: "#fff", fontWeight: "bold", fontSize: 16, opacity: .65, letterSpacing: 4*px}}>新纪录</Text>
            </View>
            <IconScore width={36} height={36} fill="#fff" />
          </Animated.View>
        </View>
      </Pressable>
    </SafeAreaView>
  ) : <></>;
};

const styles = StyleSheet.create({
  snackBox: {
    height: 72,
    paddingHorizontal: 16, paddingVertical: 8,
    elevation: 48,
    flexDirection: "row",
    borderRadius: 16,
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: px,
  }
})