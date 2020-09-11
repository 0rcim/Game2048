import React from "react";
import Svg, { Path } from "react-native-svg";

export const IconCoffee = ({ fill="#000", ...rest_props }) => {
  return (
    <Svg {...rest_props} viewBox="0 0 512 512">
      <Path fill={fill} d="M350.7 199.8h-.7v-37.5H68.7V406c0 20.7 16.8 37.5 37.5 37.5h206.3c20.7 0 37.5-16.8 37.5-37.5v-21.7c.2 0 .5.1.7.1 50.9 0 92.7-41.4 92.7-92.3-.1-50.9-41.9-92.3-92.7-92.3zm0 147.1c-.2 0-.5 0-.7-.1V237.3c.2 0 .5-.1.7-.1 30.2 0 55.2 24.6 55.2 54.8s-25 54.9-55.2 54.9zM143.7 68.5h37.5v56.3h-37.5zM237.4 68.5h37.5v56.3h-37.5z"/>
    </Svg>
  )
}
