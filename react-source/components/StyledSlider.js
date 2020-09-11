import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import Slider from "@react-native-community/slider";

export const StyledSlider = ({ style={}, index=0, onValueChange=()=>{}, enableBindValue=false, onSlidingStart=()=>{}, onSlidingComplete=()=>{}, value=0, labelArray=["", "", ""], minimumValues=[0,0,0], maximumValues=[1,1,1], steps=[0,0,0] }) => {
  const {colors, dark} = useTheme();
  const [bindValue, setBindValue] = useState(value);
  const [displayVal, setDisplayVal] = useState(value);
  const [shouldEnableBindValue, setShouldEnableBindValue] = useState(enableBindValue);
  const onValChange = (v) => {
    setDisplayVal(v);
    onValueChange(v);
  };
  useEffect(() => {
    if (enableBindValue && shouldEnableBindValue) {
      setBindValue(value);
      setDisplayVal(value);
    }
  }, [value]);
  return (
    <View style={[styles.slider, style]}>
      <View style={{position: "absolute", height: "100%", width: 20, left: -20, alignItems: "center", justifyContent: "center"}}>
        <Text style={{fontWeight: "bold", color: "grey", textDecorationLine: "underline"}}>{labelArray[index]}</Text>
      </View>
      {
        enableBindValue ? (
          <Slider
            minimumValue={minimumValues[index]}
            maximumValue={maximumValues[index]}
            step={steps[index]}
            maximumTrackTintColor="grey"
            minimumTrackTintColor={colors.primary}
            thumbTintColor={colors.primary}
            onValueChange={onValChange}
            onSlidingStart={() => setShouldEnableBindValue(false)}
            onSlidingComplete={() => setShouldEnableBindValue(true)}
            value={bindValue}
            style={{height: 40}}
          />
        ) : (
          <Slider
            minimumValue={minimumValues[index]}
            maximumValue={maximumValues[index]}
            step={steps[index]}
            maximumTrackTintColor="grey"
            minimumTrackTintColor={colors.primary}
            thumbTintColor={colors.primary}
            onValueChange={onValChange}
            onSlidingStart={onSlidingStart}
            onSlidingComplete={onSlidingComplete}
            value={value}
            style={{height: 40}}
          />
        )
      }
      <View style={{position: "absolute", height: "100%", width: 30, right: -30, alignItems: "flex-end", justifyContent: "center"}}>
        <Text style={{fontWeight: "bold", color: colors.primary, textDecorationLine: "underline"}}>{value.toFixed(0)}</Text>
      </View>
    </View>
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
});