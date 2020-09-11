import React, { useRef, useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, Switch, PixelRatio, StyleSheet, useWindowDimensions, Animated, Easing , TouchableHighlight } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useLang } from "../I18n";
import { ColorUtils } from "../plugins";

const px = 1 / PixelRatio.get();

export const PageSwiperFrame = ({ children, indicatorTextArr=[], windowWidth=0, scrollViewRef, scrollX, activeTextColor="#fff", scrollEnabled=true }) => {
  // const {width: windowWidth } = useWindowDimensions();
  const {colors, dark} = useTheme();
  const {PAGE_RANKING: lang} = useLang();
  return (
    <>
      <ScrollView ref={scrollViewRef} style={{flex: 1}}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        // disableScrollViewPanResponder={true}
        scrollEnabled={scrollEnabled}
        // snapToInterval={windowWidth}
        
        pagingEnabled
        scrollEventThrottle={1}
        onScroll={Animated.event([
          {
            nativeEvent: {
              contentOffset: {
                x: scrollX
              }
            }
          }
        ], {
          useNativeDriver: false,
          // listener: (event) => {
          //   setCurrentPage((event.nativeEvent.contentOffset.x * 1.5) / windowWidth << 0) // 此处左移位操作等价于parseInt
          // }
        })}
      >
        {children}
      </ScrollView>
      <Animated.View style={[{height: 56, backgroundColor: dark ? "#000" : "transparent", justifyContent: "center", alignItems: "center"}]}>
        <HeaderIndicator {...{windowWidth, scrollX, scrollViewRef, indicatorTextArr, activeTextColor}} 
        />
      </Animated.View>
    </>
  )
};

function HeaderIndicator({ scrollX, windowWidth, indicatorTextArr=[], activeTextColor, /* currentPage=0, */ scrollViewRef }) {
  const { colors, dark } = useTheme();
  const [item_innerTextWidthArr, setItem_innerTextWidthArr] = useState([]);
  const textPaddingHorizontal = 16;
  const pageColorsSet = dark ? ["blue", "#000", "green"] : ["blue", "#fff", "green"];
  // const [underlayScrollIndicatorWidthArr, setUnderlayScrollIndicatorWidthArr] = useState([]);
  if (indicatorTextArr.length !== item_innerTextWidthArr.length) return (
    indicatorTextArr.map((item, index) => <Text style={[styles.animText, {opacity: 0}]} key={"hidden_txt"+index} onLayout={(event) => setItem_innerTextWidthArr([...item_innerTextWidthArr, Math.ceil(event.nativeEvent.layout.width + textPaddingHorizontal*2)])}>{item}</Text>)
  );
  return (
    <View style={{flexDirection: "row", borderRadius: 8, backgroundColor: dark ? "#333" : "#ccc", overflow: "hidden", borderWidth: px, borderColor: dark ? "#333" : "#ccc", position: "relative"}}>
      {
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            {
              top: 0, height: "100%", borderRadius: 8, backgroundColor: scrollX.interpolate({
                inputRange: pageColorsSet.map((i,d) => d*windowWidth),
                outputRange: pageColorsSet,
              }),
              width: scrollX.interpolate({
                inputRange: indicatorTextArr.map((i,d) => d*windowWidth),
                outputRange: item_innerTextWidthArr,
                extrapolate: "clamp",
              }),
              left: scrollX.interpolate({
                inputRange: indicatorTextArr.map((i,d) => d*windowWidth),
                outputRange: indicatorTextArr.reduce((p,c) => {
                    p.res.push(p.record);
                    p.record+=item_innerTextWidthArr[indicatorTextArr.indexOf(c)];
                    return p;
                }, {res: [], record: 0}).res,
                extrapolate: "clamp"
              })
            }
          ]}
        />
      }
        {
          indicatorTextArr.map((item, index) => {
            // const isCurrentPage = currentPage === index;
            // useEffect(() => {
            //   console.log(s)
            // }, [s])
            return (
              <TouchableHighlight key={"indicator"+index} 
                underlayColor={dark ? "#00000044" : "#ffffff44"}
                onPress={() => {
                  scrollViewRef.current.scrollTo({
                    x: index*windowWidth,
                  })
                }}
              >
                <View 
                  style={{ borderRadius: 8, paddingVertical: 8, paddingHorizontal: textPaddingHorizontal, alignItems: "center",
                    width: item_innerTextWidthArr[index]
                  }}
                >
                  <Animated.Text
                    numberOfLines={1} ellipsizeMode="tail"
                    style={[
                      styles.animText,
                      {
                        transform: [{ 
                          scale: scrollX.interpolate({
                            inputRange: indicatorTextArr.map((i,d) => d*windowWidth),
                            outputRange: indicatorTextArr.map((i, d) => d === index ? 1.25 : 1),
                            extrapolate: "clamp"
                          })
                        }],
                        color: scrollX.interpolate({
                          inputRange: indicatorTextArr.map((i,d) => d*windowWidth),
                          outputRange: pageColorsSet.map((i, d) => d === index ? ColorUtils(i).isDark() ? "#fff" : "#000" : (dark ? "grey" : "#555") ),
                          extrapolate: "clamp"
                        })
                      }
                    ]}
                    // onLayout={(event) => setItem_innerTextWidthArr([...item_innerTextWidthArr, Math.ceil(event.nativeEvent.layout.width)])}
                  >{item}</Animated.Text>
                </View>
              </TouchableHighlight>
            )
          })
        }
    </View>
  )
};

const styles = StyleSheet.create({
  animText: {
    fontWeight: "bold", fontSize: 13
  }
})