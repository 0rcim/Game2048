import React from "react";
import Svg, { Path } from "react-native-svg";

export const IconDropDown = ({ fill="#000", ...rest_props }) => {
  return (
    <Svg {...rest_props} viewBox="0 0 48 48">
      <Path fill={fill} d="M14 20l10 10 10-10z"/>
    </Svg>
  )
}