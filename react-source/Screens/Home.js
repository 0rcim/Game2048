import SplashScreen from "react-native-splash-screen";

import React, { useEffect, useCallback, useState } from "react";
import { View, Text, SafeAreaView, Alert, BackHandler, Pressable, StyleSheet, ScrollView, NativeModules } from "react-native";
import { Button, OptionOverlay, PlainBtn, NotificationBtn } from "../components";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { useLang } from "../I18n";
import { MAIN_FONT_NAME } from "../plugins";

export const Home = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { PAGE_INDEX: lang, QUIT: quit_lang } = useLang();
  const [optionOverlayVisibility, setOptionOverlayVisibility] = useState(false);
  
  const onBackPress = (e) => {
    BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    setOptionOverlayVisibility(true);
    return true;
  };
  const handleDialogClick = (which) => {
    switch(which) {
      case quit_lang.NO_CANCEL: {
        break;
      }
      case quit_lang.OK_QUIT: {
        BackHandler.exitApp();
        break;
      }
      default: break;
    }
    setOptionOverlayVisibility(false);
  }
  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => 
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    })
  );
  useEffect(() => {
    SplashScreen.hide();
    // NativeModules.ToastExample.show("Awesome", ToastExample.SHORT);
    console.log(NativeModules)
  }, []);
  
  return (
    <>
      <OptionOverlay
        visibility={optionOverlayVisibility}
        mainTitle={quit_lang.DIALOG_TITLE_QUIT}
        selectedCallBack={() => setOptionOverlayVisibility(false)}
        Body={
          <View style={{padding: 14, paddingHorizontal: 24}}>
            <Text style={{fontSize: 16, color: colors.text, fontWeight: "bold"}}>{quit_lang.DIALOG_BODY}</Text>
            <View style={{flexDirection: "row", paddingTop: 32, justifyContent: "center"}}>
              <PlainBtn onPress={() => handleDialogClick(quit_lang.NO_CANCEL)} title={quit_lang.NO_CANCEL} />
              <NotificationBtn onPress={() => handleDialogClick(quit_lang.OK_QUIT)} title={quit_lang.OK_QUIT} />
            </View>
          </View>
        }
      />
      <SafeAreaView style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Text style={{fontSize: 78, fontFamily: MAIN_FONT_NAME, color: "grey", marginVertical: 15}}>2048</Text>
        <ScrollView fadingEdgeLength={100} showsVerticalScrollIndicator={false} style={{maxHeight: 4*52}}>
          <View style={{alignSelf: "flex-start"}}>
            <Button title={lang.START} onPress={() => {
              navigation.navigate("GameModal");
            }} />
            <Button title={lang.RANKING} onPress={() => navigation.navigate("Ranking")} />
            <Button title={lang.SETTINGS} onPress={() => navigation.navigate("Settings")} />
            <Button title={lang.QUIT} onPress={onBackPress} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
};

const styles = StyleSheet.create({
  dialog_btn: {
    paddingVertical: 12, paddingHorizontal: 26,
  }
})