package info.jigzeg.game2048;

import android.os.Bundle;

import com.facebook.react.ReactActivity;

import com.facebook.react.shell.MainReactPackage;
import com.rnfs.RNFSPackage;

import java.util.Arrays;
import java.util.List;
import com.facebook.react.ReactPackage;

import org.devio.rn.splashscreen.SplashScreen;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import info.jigzeg.game2048.CustomToastPackage;

public class MainActivity extends ReactActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this);
    super.onCreate(savedInstanceState);
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */

  @Override
  protected String getMainComponentName() {
    return "game2048";
  }

  protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
      new MainReactPackage(),
      new SplashScreenReactPackage(),
      new RNFSPackage(),
      new CustomToastPackage()
    );
  }
}
