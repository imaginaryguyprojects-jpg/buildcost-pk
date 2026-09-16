import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pk.buildcost.app',
  appName: 'BuildCost-PK',
  webDir: 'android/app/src/main/assets/www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    buildOptions: {
      versionCode: 12,
      versionName: '3.0.0',
    },
  },

};

export default config;
