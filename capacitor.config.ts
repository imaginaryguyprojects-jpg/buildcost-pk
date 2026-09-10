import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pk.buildcost.app',
  appName: 'BuildCost-PK',
  webDir: 'android/app/src/main/assets/public',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    buildOptions: {
      versionCode: 6,
      versionName: '2.1.0',
    },
  },

};

export default config;
