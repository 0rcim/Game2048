import React from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "@react-navigation/native";

export const IconMore = ({ dotsFillArray=[], ...rest_props }) => {
  const { colors } = useTheme();
  const fills = dotsFillArray.concat(new Array(3).fill("grey")).slice(0, 3);
  return (
    <Svg {...rest_props} viewBox="0 0 512 512">
      <Circle fill={fills[0]} r="32" cy="133" cx="256"/>
      <Circle fill={fills[1]} r="32" cy="256" cx="256"/>
      <Circle fill={fills[2]} r="32" cy="385" cx="256"/>
    </Svg>
  )
}
