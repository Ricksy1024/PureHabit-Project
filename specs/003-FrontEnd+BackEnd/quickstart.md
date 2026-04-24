# Quickstart

**Feature**: `003-FrontEnd+BackEnd`

## Getting Started

1. **Environment Setup**:
   Ensure your `.env` file contains the correct Firebase Web SDK configuration keys (from Phase 002).

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```

3. **Run the Emulators (or connect to staging)**:
   ```bash
   npx firebase emulators:start
   ```
   *Note: Ensure the backend functions are deployed or running in the emulator for `syncHabitLogs` and the new CRUD callables to work.*

4. **Testing Real-Time Sync**:
   - Open the app in two different tabs or browsers.
   - Add a habit in tab 1; see it appear instantly in tab 2.
   - Check a habit completion in tab 1; see the optimistic update apply locally, then watch the streak recalculate automatically via backend triggers and push down to both tabs.
