import React from "react";
import Svg, { Path } from "react-native-svg";

export const IconCheck = ({ fill="#000", ...rest_props }) => {
  return (
    <Svg {...rest_props} viewBox="0 0 48 48">
      <Path fill={fill} stroke={fill} strokeWidth="5" d="M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z"/>
    </Svg>
  )
}
