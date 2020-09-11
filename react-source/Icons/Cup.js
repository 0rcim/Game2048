import React from "react";
import Svg, { Path, LinearGradient, Stop } from "react-native-svg";

export const IconCup = ({ type="golden", ...rest_props }) => {
  return (
    <Svg {...rest_props} viewBox="0 0 512 512">
      <LinearGradient id="golden" x1="0%" x2="100%" y1="0%" y2="0%" gradientTransform="rotate(90)">
        <Stop offset="0%" stopColor="#fc9101" stopOpacity="1" />
        <Stop offset="100%" stopColor="#f7d21f" stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="silver" x1="0%" x2="100%" y1="0%" y2="0%" gradientTransform="rotate(90)">
        <Stop offset="0%" stopColor="#b7beca" stopOpacity="1" />
        <Stop offset="100%" stopColor="#d1d6dc" stopOpacity="1" />
      </LinearGradient>
      <LinearGradient id="bronze" x1="0%" x2="100%" y1="0%" y2="0%" gradientTransform="rotate(90)">
        <Stop offset="0%" stopColor="#f28518" stopOpacity="1" />
        <Stop offset="100%" stopColor="#f78a23" stopOpacity="1" />
      </LinearGradient>
      <Path fill={`url(#${type})`} d="M339.7 266.7l.3.5 11.4-6.2c56.8-30.9 92.1-90.3 92.1-155V87.2h-56.3V68.5H124.8v18.7H68.5V106c0 64.7 35.3 124.1 92.1 155l11.1 6c14.1 20.6 23.1 42.2 26.4 63.9h-69.2l-28.1 112.5h310.5L383.1 331h-69.5c3-23.8 11.3-45.5 24.7-62.4.5-.6.9-1.3 1.4-1.9zm45.9-142h19.1c-3.5 26-14.5 50.2-31 70.1 6-21.2 9.9-44.8 11.9-70.1zm-278.3 0h19c1.9 25.3 5.8 48.6 11.6 69.7-16.3-19.8-27.1-43.8-30.6-69.7zm246.6 243.8l9.4 37.5H148.8l9.4-37.5h195.7z"/>
    </Svg>
  )
}