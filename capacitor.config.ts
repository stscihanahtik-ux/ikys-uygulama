import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ikys.app',
  appName: 'IKYS',
  webDir: 'public', 
  server: {
    url: 'https://senin-vercel-linkin.vercel.app', // BURAYA LİNKİ YAZ (Aşağıda açıklaması var)
    cleartext: true
  }
};

export default config;