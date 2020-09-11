import React from "react";

import { default as CN } from "./cn";
import { default as EN } from "./en";

export default { CN, EN };

export const LanguagesContext = React.createContext("CN");
export const useLang = () => (
  React.useContext(LanguagesContext)
);