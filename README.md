# habit-tracker-mobile

A React Native mobile application for task management and habit tracking, built with an offline-first architecture and automatic background sync.

---

## Features

- JWT authentication with email verification
- Task CRUD with due dates and completion tracking
- Habit tracking with streak calculation
- Offline-first operation with MMKV local persistence
- Optimistic UI updates via TanStack Query
- Queued offline mutations with automatic retry on reconnect

---

## Tech Stack

| Layer           | Library                               |
| --------------- | ------------------------------------- |
| Framework       | React Native + Expo                   |
| Language        | TypeScript                            |
| Navigation      | React Navigation v7                   |
| Server state    | TanStack Query v5                     |
| Local storage   | react-native-mmkv                     |
| HTTP client     | Axios                                 |
| UUID generation | uuid + react-native-get-random-values |

---

## Architecture Notes

**TanStack Query** manages all server state. `networkMode: 'offlineFirst'` ensures queries run against local cache when the device is offline and refetch from the API on reconnect.

**MMKV persistence** stores task and habit caches, the sync queue, and last-synced timestamps. MMKV is used over AsyncStorage for synchronous reads and significantly better performance.

**Offline queue** - mutations performed while offline are serialised as `QueuedAction` entries and written to MMKV. On reconnect, `runSyncQueue` replays each action against the API in order, retrying up to `SYNC_MAX_RETRIES` times before discarding.

**Last-write-wins** - each mutation includes a `clientUpdatedAt` timestamp. The API uses this to resolve concurrent edits, keeping the most recently written value.

---

## Project Structure

```
src/
  api/          Axios client and resource API modules
  components/   Shared UI components - common, tasks, habits
  constants/    API base URL, query keys, storage keys
  hooks/        useTasks, useHabits, useAuth
  navigation/   Stack and tab navigators, deep link config
  query/        TanStack QueryClient configuration
  screens/      Auth, Tasks, Habits, Settings screens
  services/     AuthContext and auth state management
  storage/      MMKV wrappers for tasks, habits, sync queue
  sync/         Network status, sync engine, useSyncEngine
  theme/        Colors, spacing, typography, shadows
  types/        Shared TypeScript types
  utils/        Utility helpers
```

---

## Setup

**Common prerequisites**

- Node.js 18+
- Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd habit-tracker-mobile
npm install
```

---

### iOS

**Prerequisites**

- macOS with Xcode 16+ installed
- iOS simulator downloaded: `Xcode > Settings > Components`

Run once after installing Xcode:

```bash
sudo xcode-select --switch /Applications/Xcode.app
sudo xcodebuild -license accept
```

**Prebuild and install pods**

```bash
npx expo prebuild --platform ios
cd ios && pod install && cd ..
```

**Run**

Start Metro in one terminal:

```bash
npx expo start
```

Open in Xcode and press Run:

```bash
open ios/TasksSmartTaskHabitTracker.xcworkspace
```

Select a simulator from the device picker and press the Run button.

> Re-run prebuild and `pod install` after adding packages with native modules.

---

### Android

**Prerequisites**

- Android Studio with an emulator configured, or a physical device with USB debugging enabled

**Prebuild and run**

```bash
npx expo prebuild --platform android
npx expo run:android
```

> Re-run prebuild after adding packages with native modules.

---

## API Configuration

The backend is hosted at:

```
https://habit-tracker-api-hiis.onrender.com/api/v1
```

All requests go through a centralised Axios instance at `src/api/client.ts`, which attaches the JWT from MMKV to the `Authorization` header on every request.

The backend source is in the sibling `../habit-tracker-api` repository.

---

## Synchronization Strategy

Actions taken offline (`task:create`, `task:update`, `habit:check-in`, etc.) are saved to a queue in MMKV. When the device reconnects or the app comes to the foreground, the queue is replayed against the API in order.

Each action includes a `clientUpdatedAt` timestamp, so replaying it multiple times is safe and produces the same result. Actions that fail are retried up to `SYNC_MAX_RETRIES` times and then dropped.

After a successful sync, the local cache is updated with the server response and TanStack Query triggers a fresh fetch.

---

## Future Improvements

- Push notifications for habit reminders
- Widget support for task quick-add
- Conflict resolution UI for edits made on multiple devices
