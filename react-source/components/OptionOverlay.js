import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, SafeAreaView, Alert, BackHandler, Pressable, PixelRatio, ScrollView, useWindowDimensions, Animated, KeyboardAvoidingView, Platform, Easing } from "react-native";
import { ListItem } from "./ListItem";
import { useTheme, useFocusEffect } from "@react-navigation/native";
import { IconCheck } from "../Icons";

const px = 1 / PixelRatio.get();

export const OptionOverlay = ({ visibility=false, caption="", mainTitle="", Body=<></>, optionList=[], selectedCallBack=()=>{}, fullDisappearedDialogCallBack=()=>{}, fullDisplayedDialogCallBack=()=>{}, cancelable=true }) => {
  const { colors, dark } = useTheme();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const [visibilityState, setVisibilityState] = useState(false);
  const [currentPressedItemIndex, setCurrentPressedItemIndex] = useState(-1);
  const zoomAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const onBackPress = () => {
    // console.log("Option Overlay back pressed.");
    cancelable && selectedCallBack();
    // fadeOut();
    return visibility;
  };
  const zoomIn = () => {
    Animated.timing(zoomAnim, {
      toValue: 1,
      duration: 200,
      delay: 50,
      easing: Easing.linear((x) => 1 - Math.pow(1 - x, 6)),
      delay: 50,
      useNativeDriver: true,
    }).start(({ finished }) => finished && fullDisplayedDialogCallBack());
  };
  const zoomOut = (fn) => {
    Animated.timing(zoomAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start(fn);
  };
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    zoomIn();
  };
  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      zoomOut(() => fullDisappearedDialogCallBack());
      setVisibilityState(false);
      BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    });
  };
  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress)
    })
  );
  useEffect(() => {
    // console.log("visibility", visibility);
    if (visibility) {
      setVisibilityState(true);
      fadeIn();
    } else {
      fadeOut();
    }
  }, [visibility]);
  const handleListItemPressIn = (index) => () => {
    setCurrentPressedItemIndex(index);
  };
  return visibilityState ? (
      <Animated.View style={{
        position: "absolute", width: "100%", height: "100%",
        zIndex: 1,
        opacity: fadeAnim,
      }}>
        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : "height"}
          style={{
            flex: 1, paddingHorizontal: 38, justifyContent: "center", 
          }}
        >
        <Pressable onPress={() => {
          if (cancelable) {
            selectedCallBack();
            // console.log("aaaaaa")
          }
        }} style={{position: "absolute", width: windowWidth, height: windowHeight, backgroundColor: "#000000aa" }} />
        <Animated.View style={{backgroundColor: dark ? "#222325" : "#fff", maxHeight: "80%", elevation: 64, borderRadius: 12, overflow: "hidden", transform: [{scale: zoomAnim}]}}>
          <View>
            <Text style={{color: "grey", alignSelf: "center", paddingVertical: 8, paddingTop: 32, fontSize: 14, fontWeight: "bold"}}>{mainTitle}</Text>
          </View>
          <ScrollView fadingEdgeLength={100}>
            {
              optionList.map((item, index) => (
                <React.Fragment key={caption + index}>
                  {index === 0 ? <></> : <Split/>}
                  <ListItem onPressIn={handleListItemPressIn(index)} disabled={currentPressedItemIndex !== index} title={item.title} subtitle={item.subtitle} onPress={() => selectedCallBack(caption, item)}>
                    {
                      item.selected ? <IconCheck width={18} height={18} fill={colors.primary} /> : <></>
                    }
                  </ListItem>
                </React.Fragment>
              ))
            }
            { Body }
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  ) : <></>;
};

function Split(){
  const {dark} = useTheme();
  return <View style={{height: 0, borderTopColor: dark ? "#ffffff22" : "#00000022", borderTopWidth: px}} />;
};