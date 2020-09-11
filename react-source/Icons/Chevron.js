import React from "react";
import Svg, { Path } from "react-native-svg";

export const IconChevron = ({ fill="#000", chevronDirection="left", style={}, ...rest_props }) => {
  let deg = 0;
  switch(chevronDirection) {
    case "left": deg = 0; break;
    case "top": deg = 90; break;
    case "right": deg = 180; break;
    case "bottom": deg = 270; break;
    default: deg = 0;
  };
  return (
    <Svg {...rest_props} viewBox="0 0 48 48" 
      style={[{transform: [{rotate: deg + "deg"}]}, style]}>
      <Path fill={fill} d="M30.83 14.83L28 12 16 24l12 12 2.83-2.83L21.66 24z"/>
    </Svg>
  )
}



