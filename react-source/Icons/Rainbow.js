import React from "react";
import Svg, { Path, LinearGradient, Stop } from "react-native-svg";

export const IconRainbow = ({ ...rest_props }) => {
  return (
    <Svg {...rest_props} viewBox="0 0 20 20">
      <LinearGradient id="rainbow" x1="0%" x2="100%" y1="0%" y2="0%" gradientTransform="rotate(90)">
        <Stop offset="0%" stopColor="#f00" stopOpacity="1" />
        <Stop offset="17%" stopColor="#ff0" stopOpacity="1" />
        <Stop offset="33%" stopColor="#0f0" stopOpacity="1" />
        <Stop offset="50%" stopColor="#0ff" stopOpacity="1" />
        <Stop offset="66%" stopColor="#00f" stopOpacity="1" />
        <Stop offset="83%" stopColor="#f0f" stopOpacity="1" />
        <Stop offset="100%" stopColor="#f00" stopOpacity="1" />
      </LinearGradient>
      <Path fill="url(#rainbow)" d="M0 0v20h20v-20h-20z"/>
    </Svg>
  )
}