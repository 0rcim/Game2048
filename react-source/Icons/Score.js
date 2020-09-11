import React from "react";
import Svg, { Path, LinearGradient, Stop } from "react-native-svg";

export const IconScore = ({ ...rest_props }) => {
  return (
    <Svg {...rest_props} viewBox="0 0 512 512">
      <LinearGradient id="golden" x1="0%" x2="100%" y1="0%" y2="0%" gradientTransform="rotate(90)">
        <Stop offset="0%" stopColor="#fc9101" stopOpacity="1" />
        <Stop offset="100%" stopColor="#f7d21f" stopOpacity="1" />
      </LinearGradient>
      <Path fill="url(#golden)" d="M443.5 213.9H300.3L256 77.7l-44.3 136.2H68.5l115.9 84.2-44.3 136.2L256 350.1l115.9 84.2-44.3-136.2z"/>
    </Svg>
  )
}