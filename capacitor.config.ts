import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pk.buildcost.app',
  appName: 'BuildCost-PK',
  webDir: 'android/app/src/main/assets/www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    buildOptions: {
      versionCode: 9,
      versionName: '3.0.2',
    },
  },

};

export default config;
