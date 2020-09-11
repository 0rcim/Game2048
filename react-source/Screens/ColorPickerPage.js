import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, ScrollView, Text, StyleSheet, Pressable, useWindowDimensions, Animated, PixelRatio, Easing } from "react-native";
import { useTheme } from "@react-navigation/native";
import { NotificationBtn, SuccessBtn, PageHeader, StyledSlider } from "../components";
import { IconChevron } from "../Icons";
import { ColorUtils, MAIN_FONT_NAME } from "../plugins";
import { useLang } from "../I18n";
import { TouchableOpacity } from "react-native-gesture-handler";
// import { Easing } from "react-native-reanimated";

const px = 1 / PixelRatio.get();
let grids_color = [];
let color_index = 0;

export const ColorPickerPage = ({ navigation, route }) => {
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {colors, dark} = useTheme();
  const {PAGE_COLOR_PICKER: lang} = useLang();
  const [topColorGridIndex, setTopColorGridIndex] = useState(0);
  const [gridsColor, setGridsColor] = useState(
    [
      ColorUtils.rgb([0,0,0]),
      ColorUtils.rgb([255,255,255])
    ]
  );
  const [showHSLSection, setShowHSLSection] = useState(false);
  const [pageHeaderName, setPageHeaderName] = useState(null);
  const scrollViewRef = useRef(null);
  const heightRateAnim = useRef(new Animated.Value(0)).current;
  const pageOpacityTransitionAnim = useRef(new Animated.Value(0)).current;
  const pageInAnim = () => {
    Animated.timing(pageOpacityTransitionAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };
  const foldAnim = () => {
    Animated.timing(heightRateAnim, {
      toValue: 0,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };
  const expandAnim = (fn) => {
    Animated.timing(heightRateAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => fn && fn());
  };
  
  useEffect(() => {
    if (showHSLSection) {
      expandAnim(() => {
        scrollViewRef.current.scrollToEnd({animated: true, duration: 200});
      });
    } else {
      foldAnim();
      scrollViewRef.current.scrollTo({y: 0, animated: true});
    }
  }, [showHSLSection]);
  useEffect(() => {
    const action = route.params?.action;
    if (action === "ADD_COLOR") {
      setPageHeaderName(lang.ADD_A_CUSTOM_COLOR);
      pageInAnim();
      // console.log(route.params.action)
    } else if (action === "UPDATE_COLOR") {
      const color = ColorUtils(route.params?.color);
      setPageHeaderName(lang.EDIT_COLOR + route.params?.color);
      setGridsColor(
        [
          color,
          ColorUtils.rgb(color.negate())
        ]
      );
      pageInAnim();
    }
  }, [route.params?.action]);
  // const changeSubmitPickedColorHandler = (gc) => {
  //   changeSubmit(() => {
  //     // navigation.goBack()
  //     navigation.navigate({name: "BlocksColorEditorScreen", key: "BLOCKS_COLOR_EDITOR", params: {action: "COMPLETE_PICK_COLOR", color: gc[0].hex()}})
  //     // console.log(this);
  //   })
  //   console.log("the index of the prefer color: ", route.params?.index);
  // }
  useEffect(() => {
    grids_color = gridsColor;
  }, [gridsColor]);
  useEffect(() => {
    color_index = route.params?.indexOfThePreferColor;
    console.log("indx of the prefer color-->", route.params?.indexOfThePreferColor)
  }, [route.params?.indexOfThePreferColor]);
  const handleRGBSliderValChange = (i) => (v) => {
    let copy = gridsColor.slice();
    let rgb = gridsColor[topColorGridIndex].rgb().array();
    rgb[i] = v;
    copy[topColorGridIndex] = ColorUtils.rgb(rgb);
    setGridsColor(copy);
    // changeSubmitPickedColorHandler(copy);
    
  };
  const handleHSLSliderValChange = (i) => (v) => {
    let copy = gridsColor.slice();
    let hsl = gridsColor[topColorGridIndex].hsl().color;
    hsl[i] = v;
    copy[topColorGridIndex] = ColorUtils.hsl(hsl);
    setGridsColor(copy);
    // changeSubmitPickedColorHandler(copy);
  };
  const handleHSVSliderValChange = (i) => (v) => {
    let copy = gridsColor.slice();
    let hsv = gridsColor[topColorGridIndex].hsv().color;
    hsv[i] = v;
    copy[topColorGridIndex] = ColorUtils.hsv(hsv);
    setGridsColor(copy);
  };
  const [onSubmit, changeSubmit] = useState(() => {})
  const positions = [
    {top: 0, left: 0},
    {right: 0, bottom: 0}
  ];
  const currentPickedColor = useRef(gridsColor[0]).current;
  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <Animated.View
          style={{flex: 1, opacity: pageOpacityTransitionAnim}}
        >
          <PageHeader navigation={navigation} name={pageHeaderName} />
          <ScrollView ref={scrollViewRef} style={{width: "100%"}} contentContainerStyle={{padding: 16, paddingBottom: 80}}>
              <View style={{backgroundColor: dark ? "#222325" : "#fff", borderRadius: 10, padding: 16, marginTop: 10}}>
                <Animated.View style={{height: 200, justifyContent: "center", alignItems: "center", backgroundColor: gridsColor[0].hex(), borderWidth: 5*px, borderColor: "#a1a2aa", borderRadius: 5*px}}>
                  <Animated.Text style={{fontFamily: MAIN_FONT_NAME, fontSize: 100, color: gridsColor[0].isDark() ? "#fff" : "#000"}}>0</Animated.Text>
                </Animated.View>
                <View style={{padding: 24, paddingHorizontal: 0, justifyContent: "center", alignSelf: "flex-start"}}>
                  <Text style={{color: "grey", fontSize: 14, fontWeight: "bold"}}>RGB: {gridsColor[topColorGridIndex].rgb().string(0)}</Text>
                  <Text style={{color: "grey", fontSize: 14, fontWeight: "bold"}}>HEX: <Text style={{textDecorationLine: "underline", color: colors.primary}}>{gridsColor[topColorGridIndex].hex()}</Text></Text>
                  <Text style={{color: "grey", fontSize: 14, fontWeight: "bold"}}>HSL: {gridsColor[topColorGridIndex].hsl().string(0)}</Text>
                </View>
                <View style={{flexDirection: "row"}}>
                  <View style={{flex: 1, alignItems: "center", justifyContent: "center", borderWidth: px, borderColor: "grey", borderRadius: 10}}>
                    <View style={{height: 75, width: 75, position: "relative"}}>
                      {
                        gridsColor.map((item, index) => (
                          <Pressable key={"cg"+index} style={[styles.colorGrid, {...positions[index], zIndex: topColorGridIndex === index ? 1 : 0}]} onPress={() => setTopColorGridIndex(index)}>
                            <Animated.View style={{width: "100%", height: "100%", backgroundColor: item.hex(), alignItems: "center", justifyContent: "center"}}>
                              <Animated.Text style={{fontSize: 28, fontWeight: "bold", color: item.isDark() ? "#fff" : "#000"}}>{index+1}</Animated.Text>
                            </Animated.View>
                          </Pressable>
                        ))
                      }
                    </View>
                  </View>
                  <View style={{flex: 2, paddingHorizontal: 30}}>
                    <View style={styles.sectionTitleContainer}><Text style={styles.sectionTitleText}>RGB</Text></View>
                    {
                      gridsColor[topColorGridIndex].rgb().array().map((item, index) => (
                        <StyledSlider minimumValues={[0,0,0]} maximumValues={[255,255,255]} labelArray={["R", "G", "B"]} steps={[1,1,1]} 
                          key={"rgb_slider"+index} 
                          index={index} 
                          onValueChange={handleRGBSliderValChange(index)} 
                          enableBindValue={true}
                          // onSlidingComplete={(v) => {
                          //   handleRGBSliderValChange(index)(v)
                          // }}
                          value={item}
                        />
                      ))
                    }
                  </View>
                </View>
                <View style={[styles.sectionTitle, {backgroundColor: dark ? "#000000aa" : "#00000011"}]}>
                  <Text style={styles.sectionTitleText}>HSL</Text>
                  <TouchableOpacity 
                    activeOpacity={.45}
                    style={{padding: 4}}
                    onPress={() => setShowHSLSection(!showHSLSection)}
                  >
                    <Animated.View style={{transform: [{rotate: heightRateAnim.interpolate({
                      inputRange: [0,1],
                      outputRange: ["0deg", "180deg"]
                    })}]}}>
                      <IconChevron width={22} height={22} chevronDirection={"bottom"} fill="grey" />
                    </Animated.View>
                  </TouchableOpacity>
                </View>
                <View style={[styles.sectionContainer, {backgroundColor: dark ? "#000000aa" : "#00000011"}]}>
                  {/* <View style={styles.sectionTitleContainer}><Text style={styles.sectionTitleText}>HSL</Text></View> */}
                  <Animated.View style={{alignItems: "center", paddingBottom: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, height: heightRateAnim.interpolate({
                      inputRange: [0,1],
                      outputRange: [0, 150]
                    })}}>
                    {
                      gridsColor[topColorGridIndex].hsl().color.map((item, index) => {
                        return (
                          <StyledSlider minimumValues={[0,0,0]} maximumValues={[360,100,100]} labelArray={["H", "S", "L"]} steps={[1,1,1]}
                            key={"slider_hsl"+index} 
                            index={index} 
                            onValueChange={handleHSLSliderValChange(index)} 
                            enableBindValue={true}
                            value={item}
                          />
                        )
                      })
                    }
                  </Animated.View>
                </View>
              </View>
            </ScrollView>
        </Animated.View>
        <View style={{backgroundColor: dark ? "#222325" : "#fff", position: "absolute", bottom: 0, width: "100%", height: 56, flexDirection: "row", justifyContent: "center", alignItems: "center", borderTopColor: colors.background, borderTopWidth: px}}>
          {route.params?.action === "UPDATE_COLOR" ? <NotificationBtn title={lang.DELETE} onPress={() => {
            navigation.navigate({name: "BlocksColorEditorScreen", key: "BLOCKS_COLOR_EDITOR", params: {action: "DELETE_PREFER_COLOR", indexOfThePreferColor: color_index}});
          }} /> : <></>}
          <SuccessBtn title={lang.OK} onPress={() => {
            // navigation.goBack()
            if (route.params?.action === "ADD_COLOR") {
              navigation.navigate({name: "BlocksColorEditorScreen", key: "BLOCKS_COLOR_EDITOR", params: {action: "ADD_NEW_PREFER_COLOR", color: grids_color[0].hex()}})
            } else if (route.params?.action === "UPDATE_COLOR") {
              navigation.navigate({name: "BlocksColorEditorScreen", key: "BLOCKS_COLOR_EDITOR", params: {action: "UPDATE_PREFER_COLOR", color: grids_color[0].hex(), indexOfThePreferColor: color_index}})
            }
            // console.log(this);
          }} />
          <NotificationBtn title={lang.CANCEL} onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    </>
  )
};

const styles = StyleSheet.create({
  slider: {
    width: "100%",
    maxWidth: 200,
    height: 45,
    justifyContent: "center",
    padding: 10,
  },
  colorGrid: {
    position: "absolute",
    width:  "64%",
    height: "64%",
    borderWidth: 5*px,
    borderRadius: 5*px,
    borderColor: "grey",
  },
  sectionTitleContainer: {
    alignItems: "center"
  },
  sectionTitleText: {
    color: "grey"
  },
  sectionContainer: {
    // marginTop: 24,
    // borderRadius: 10,
    // padding: 24,
    overflow: "hidden",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    // borderTopRightRadius: 10,
  },
  sectionTitle: {
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    backgroundColor: "grey", 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    paddingBottom: 0,
    marginTop: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  sectionTitleText: {
    color: "grey",
    fontWeight: "bold",
  }
})