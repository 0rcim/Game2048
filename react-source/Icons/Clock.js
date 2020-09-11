import React from "react";
import Svg, { G, Path } from "react-native-svg";

export const IconClock = ({ fill="#000", ...rest_props }) => {
  return (
    <Svg {...rest_props} viewBox="0 0 512 512">
      <G fill={fill}>
        <Path
          d="M256 68.5C152.6 68.5 68.5 152.6 68.5 256S152.6 443.5 256 443.5 443.5 359.4 443.5 256 359.4 68.5 256 68.5zm0 337.5c-82.7 0-150-67.3-150-150s67.3-150 150-150 150 67.3 150 150-67.3 150-150 150z" />
        <Path d="M274.8 143.5h-37.5v120.3l61.7 61.7 26.5-26.5-50.7-50.8z" />
      </G>
    </Svg>
  )
}