import React from "react";
import Svg, { Path } from "react-native-svg";

export const IconRestore = ({ fill="#000", ...rest_props }) => {
  return (
    <Svg {...rest_props} viewBox="0 0 512 512">
      <Path fill={fill} d="M106 256c0-93 75.7-168.8 168.8-168.8S443.5 163 443.5 256s-75.7 168.8-168.8 168.8v-37.5c72.4 0 131.3-58.9 131.3-131.3s-58.9-131.3-131.3-131.3S143.4 183.6 143.4 256H181l-56.3 56.3L68.5 256H106z"/>
    </Svg>
  )
}
