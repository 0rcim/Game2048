import React from "react";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@react-navigation/native";

export const IconFolder = (props) => {
  const { colors } = useTheme();
  return (
    <Svg viewBox="0 0 24 24" fill={colors.text} {...props}>
      {/* <path d="M0 0h24v24H0V0z" fill="none"/> */}
      <Path d="M11.17 8l-.58-.59L9.17 6H4v12h16V8h-8z" opacity=".3"/>
      <Path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l1.41 1.41.59.59H20v10z"/>
    </Svg>
  )
}