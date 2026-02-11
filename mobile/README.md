# MusicsForYou Mobile App

React Native + Expo mobile app for MusicsForYou.

## Setup Instructions

### 1. Install Dependencies

Navigate to the mobile folder and install dependencies:

```bash
cd mobile
npm install
```

### 2. Configure API URL

Update the `.env` file with your backend API URL:

```
EXPO_PUBLIC_API_URL=https://your-repl-name.replit.app/api
```

### 3. Start the Development Server

```bash
npx expo start
```

### 4. Test on Your Phone

1. Download **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal
3. The app will load on your phone

## Features

- **Phone Authentication**: Login with your phone number
- **Music Generation**: Create AI-powered music from text prompts
- **Voice Cloning**: Record your voice for custom vocal generation
- **Library**: View all your generated tracks
- **Credits System**: Track and manage your generation credits

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── home.tsx       # Music generation screen
│   │   ├── library.tsx    # User's song library
│   │   ├── voice.tsx      # Voice recording
│   │   └── profile.tsx    # User profile & settings
│   ├── auth.tsx           # Authentication screen
│   └── _layout.tsx        # Root layout
├── src/
│   └── lib/               # Shared utilities
│       ├── api.ts         # API client
│       ├── auth-context.tsx
│       └── theme.ts       # Design tokens
└── assets/                # App icons and images
```

## Publishing to App Stores

### iOS (App Store)
1. Join Apple Developer Program ($99/year)
2. Run `npx expo build:ios` or use EAS Build
3. Submit to TestFlight for beta testing
4. Submit to App Store for public release

### Android (Google Play)
1. Create Google Play Developer account ($25 one-time)
2. Run `npx expo build:android` or use EAS Build
3. Upload to Google Play Console
4. Submit for review

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL |

## Tech Stack

- **React Native** with Expo SDK 52
- **Expo Router** for file-based routing
- **Expo AV** for audio recording/playback
- **Expo Secure Store** for secure session storage
- **Linear Gradient** for UI effects
