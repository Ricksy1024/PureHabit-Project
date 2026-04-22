# Quickstart: Habit Tracker Backend Core

## Project Setup

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase (if not already done)**:
   This project specifically uses Firebase Functions, Firestore, and Authentication.
   ```bash
   firebase init functions
   firebase init firestore
   ```
   *Make sure you select TypeScript/Javascript and configure ESLint as desired but we enforce testing with Jest.*

3. **Install Dependencies in `/functions` directory**:
   ```bash
   cd functions
   npm install firebase-admin firebase-functions otplib
   npm install --save-dev jest
   ```

4. **Testing Architecture**:
   The logic is decoupled. You can place your business logic in `/functions/src/core/` and keep Firebase trigger wrappers minimal in `/functions/src/index.js` or `/functions/src/handlers/`.

5. **Running tests**:
   ```bash
   cd functions
   npm test
   ```
