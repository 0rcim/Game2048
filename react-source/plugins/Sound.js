import React, { useContext } from "react";
import Sound from "react-native-sound";
import { GlobalSettingsContext } from "../GlobalContext";

// Sound.setCategory("AudioProcessing");

export const soundClick = new Sound("button_35.mp3", Sound.MAIN_BUNDLE, (error => {
  if (error) {
    // console.log("failed to load sound: `click sound` -->", error);
    return;
  }
  // console.log('duration in seconds: ' + soundClick.getDuration() + 'number of channels: ' + soundClick.getNumberOfChannels());
  // soundClick.play(success => {
  //   if (success) {
  //     console.log("successfully finished playing...")
  //   } else {
  //     console.log("playback failed due to audio decoding errors...")
  //   }
  // })
}));

export const soundBeep = new Sound("beep_23.mp3", Sound.MAIN_BUNDLE, (error => {
  if (error) {
    console.log("failed to load sound: `beep sound` -->", error);
    return;
  }
}));

export const playSound = (sound=soundBeep, SOUND_VOLUME=[0]) => {
  const [CurrentSoundVolume] = SOUND_VOLUME;
  // const {
  //   SOUND_VOLUME: [CurrentSoundVolume],
  // } = useContext(GlobalSettingsContext);
  sound.setVolume(CurrentSoundVolume);
  sound.play();
}