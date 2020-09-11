import "react-native-gesture-handler";

import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, Button, StatusBar } from "react-native";
import { NavigationContainer, DarkTheme, DefaultTheme, useTheme } from "@react-navigation/native";
import { createStackNavigator, TransitionSpecs } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HomeScreen, SettingsScreen, GamePageScreen, RankingScreen, BlocksColorEditorScreen, ColorPickerScreen, FileExplorerScreen } from "./react-source/Screens";
import { GlobalSettingsContext } from "./react-source/GlobalContext"
import AsyncStorage from "@react-native-community/async-storage";

import Langs, { LanguagesContext, CN, useLang } from "./react-source/I18n";
import { setStorage, multiQueryStorage } from "./react-source/plugins/Database";

const RootStack = createStackNavigator();
const HomeStack = createStackNavigator();

const HomeStackScreen = () => {
  // const { PAGE_SETTINGS: lang } = useLang();
  // const { colors, dark } = useTheme();
  return (
    <HomeStack.Navigator mode="card" screenOptions={{headerShown: false}}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} />
      <HomeStack.Screen name="BlocksColorEditorScreen" component={BlocksColorEditorScreen} />
      <HomeStack.Screen name="ColorPickerScreen" component={ColorPickerScreen} />
    </HomeStack.Navigator>
  )
};

const App = () => {
  const [CurrentTheme, ChangeCurrentTheme] = useState(0);
  const [CurrentLang, ChangeCurrentLang] = useState("CN");
  const [CurrentGameMode, ChangeCurrentGameMode] = useState(0);
  const [CurrentSoundVolume, ChangeCurrentSoundVolume] = useState(80/100);
  const [CurrentShowDotsNum, ChangeCurrentShowDotsNum] = useState(3);
  const [CurrentPlayerName, ChangeCurrentPlayerName] = useState("");
  const SETTINGS_OBJ = {
    THEME: [CurrentTheme, ChangeCurrentTheme],
    LANG: [CurrentLang, ChangeCurrentLang],
    GAME_MODE: [CurrentGameMode, ChangeCurrentGameMode],
    SOUND_VOLUME: [CurrentSoundVolume, ChangeCurrentSoundVolume],
    SAVED_PLAYER_NAME: [CurrentPlayerName, ChangeCurrentPlayerName],
    // ========Temp Global Settings======== //
    SHOW_DOTS_NUM: [CurrentShowDotsNum, ChangeCurrentShowDotsNum],
  };
  useEffect(() => {
    multiQueryStorage(["num_theme_mode", "str_lang", "current_game_mode", "sound_volume", "saved_player_name"])
      .then(valMap => {
        console.log(valMap);
        const num_theme_mode = parseInt(valMap.get("num_theme_mode"));
        const str_lang = valMap.get("str_lang");
        const current_game_mode = parseInt(valMap.get("current_game_mode"));
        const sound_volume = parseInt(valMap.get("sound_volume")) / 100;
        const saved_player_name = valMap.get("saved_player_name");
        ChangeCurrentTheme( isNaN(num_theme_mode) ? CurrentTheme : num_theme_mode );
        ChangeCurrentLang( str_lang ? str_lang : "CN" );
        ChangeCurrentGameMode( isNaN(current_game_mode) ? CurrentGameMode : current_game_mode );
        ChangeCurrentSoundVolume( isNaN(sound_volume) ? CurrentSoundVolume : sound_volume );
        ChangeCurrentPlayerName( saved_player_name ? saved_player_name : CurrentPlayerName );
      })
      .catch(error => {
        console.log(error);
      })
  }, []);
  return (
    <GlobalSettingsContext.Provider value={SETTINGS_OBJ}>
      <LanguagesContext.Provider value={CurrentLang in Langs ? Langs[CurrentLang] : CN }>
        <SafeAreaProvider>
          <StatusBar hidden />
          <NavigationContainer theme={CurrentTheme === 0 ? DarkTheme : DefaultTheme}>
            <RootStack.Navigator mode="card" screenOptions={{headerShown: false}}>
              <RootStack.Screen name="Root" component={HomeStackScreen} />
              <RootStack.Screen name="Ranking" component={RankingScreen} />
              <RootStack.Screen name="FileExplorer" component={FileExplorerScreen} />
              <RootStack.Screen name="GameModal" component={GamePageScreen}
                options={{transitionSpec: {open: TransitionSpecs.TransitionIOSSpec, close: TransitionSpecs.TransitionIOSSpec}}} />
            </RootStack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </LanguagesContext.Provider>
    </GlobalSettingsContext.Provider>
  )
}


export default App;