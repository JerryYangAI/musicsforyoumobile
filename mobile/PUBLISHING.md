# Publishing MusicsForYou to the App Store

## Prerequisites
- Apple Developer account ($99/year) - You have this!
- Node.js installed on your local machine
- Expo CLI and EAS CLI installed

## Step-by-Step Guide

### 1. Download the Mobile App Code
Download the `mobile/` folder to your local machine.

### 2. Install Dependencies
```bash
cd mobile
npm install
```

### 3. Install EAS CLI
```bash
npm install -g eas-cli
```

### 4. Login to Expo
```bash
eas login
```

### 5. Update Configuration
Edit `app.json` and replace:
- `"owner": "your-expo-username"` with your Expo username

Edit `eas.json` and fill in:
- `"appleId"`: Your Apple ID email
- `"ascAppId"`: Your App Store Connect app ID (get from App Store Connect)
- `"appleTeamId"`: Your Apple Team ID (from developer.apple.com)

### 6. Configure Your App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Create a new app with bundle ID: `com.musicsforyou.app`
3. Fill in app details, screenshots, and description

### 7. Build for iOS
```bash
eas build --platform ios --profile production
```
This will:
- Prompt you to sign in with your Apple ID
- Create signing certificates automatically
- Build your app in the cloud
- Give you a download link for the .ipa file

### 8. Submit to App Store
```bash
eas submit --platform ios --profile production
```

Or manually upload the .ipa file using Transporter app on Mac.

### 9. Complete App Store Submission
1. Go to App Store Connect
2. Add screenshots (required sizes: 6.5", 5.5", and iPad if supporting tablets)
3. Write app description, keywords, support URL
4. Submit for review

## API Configuration

Before publishing, update the API URL in `mobile/src/lib/api.ts`:
```javascript
const API_BASE = 'https://your-production-domain.com/api';
```

Replace with your deployed backend URL.

## Timeline
- Build: ~15-30 minutes
- Apple Review: 1-3 days (first submission may take longer)
