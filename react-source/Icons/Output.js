import React from "react";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@react-navigation/native";

export const IconOutput = (props) => {
  const { colors } = useTheme();
  return (
    <Svg viewBox="0 0 24 24" fill={colors.text} {...props}>
      <Path d="M5 8h14v11H5zm5.55 6v3h2.91v-3H16l-4-4-4 4z" opacity=".3"/>
      <Path d="M16 14h-2.54v3h-2.91v-3H8l4-4zm4.54-8.77l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.81.97H5.44zM19 19H5V8h14z"/>
    </Svg>
  )
}