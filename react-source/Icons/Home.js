import React from "react";
import Svg, { G, Path } from "react-native-svg";

export const IconHome = ({ fill="#000", ...rest_props }) => {
  return (
    <Svg {...rest_props} viewBox="0 0 512 512">
      <G fill={fill}>
        <Path d="M111.3 268.5v168.9h289.6V268.5L256 165.1 111.3 268.5zm126.6 132.7v-72.4h36.2v72.4h-36.2zm126.7 0h-54.3V292.6H201.7v108.6h-54.3V287.1L256 209.6l108.6 77.5v114.1z"/>
        <Path d="M256 74.6l-90.5 64.8V75.5h-36.1v89.8l-60.9 43.5 21.1 29.4L256 119.1l166.4 119.1 21.1-29.4z"/>
      </G>
    </Svg>
  )
}