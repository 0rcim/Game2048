import AsyncStorage from "@react-native-community/async-storage";
export const multiQueryStorage = async (keys=[]) => {
  let values;
  try {
    values = await AsyncStorage.multiGet(keys)
  } catch (e) {
    
  }
  return new Map(values);
};
export const setStorage = async (key, val) => {
  try {
    await AsyncStorage.setItem(key, val.toString());
  } catch(e) {

  }
  return {key, val}
}