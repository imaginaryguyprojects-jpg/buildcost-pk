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
      versionCode: 10,
      versionName: '3.0.3',
    },
  },

};

export default config;
