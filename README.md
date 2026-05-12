# Swiper App

A React Native mobile application built with Expo. This project features core functionality for a swipe-based matching application, including user feeds, profiles, chat interfaces, and a recommendation engine.

## 📱 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- npm or yarn
- [Expo Go](https://expo.dev/client) app installed on your iOS or Android device (for mobile testing)

## 🛠 Installation

1. Clone the repository:
```bash
git clone https://github.com/poojadotdev/swiper.git
cd swiper
```

2. Install the dependencies:
```bash
npm install
```

## 🚀 Running the App

1. Start the Expo development server:
```bash
npm start
```

2. Open the app:
   - **On your phone:** Scan the QR code presented in your terminal using the Expo Go app (Android) or the default Camera app (iOS).
   - **On an emulator/simulator:** Press `a` in the terminal to open on an Android emulator, or `i` for an iOS simulator.
   - **On the web:** Press `w` in the terminal to run the app in your web browser.

## 📁 Project Structure

```text
swiper/
├── App.js                      # Main entry point of the application
├── assets/                     # Static assets (images, icons, etc.)
└── src/
    ├── context/                # Global state management (AppContext)
    ├── data/                   # Mock data for testing and development
    ├── screens/                # UI screens (Feed, Chat, Profile, Matches, Login)
    └── utils/                  # Helper functions and logic (RecommendationEngine)
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
