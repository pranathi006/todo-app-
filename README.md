# Todo App: React Native + Node.js + MongoDB

A to-do app for Android built with React Native CLI and TypeScript. Users can sign up, log in, and manage tasks with a title, description, start time, deadline, priority and tag. Tasks are stored in MongoDB through a small Express API.

## Features

- Register and log in with email and password (JWT, passwords hashed with bcrypt)
- Stays logged in between app launches (token saved with AsyncStorage)
- Add tasks with title, description, start date-time, deadline, priority and tag
- Mark tasks as done, delete tasks, pull to refresh
- **Smart sort** that mixes deadline urgency, priority and start time
- Filter by status (All / Pending / Done / Overdue) and by tag
- Sort by Smart, Deadline or Priority
- Progress bar, overdue highlighting and "3h left" style labels
- Optimistic updates: the UI reacts instantly and rolls back if the server fails

## Project structure

```
todo-app/
├── backend/
│   └── src/
│       ├── config/db.js          MongoDB connection
│       ├── models/               User + Task schemas
│       ├── middleware/auth.js    JWT guard for private routes
│       ├── routes/               auth.js, tasks.js
│       └── server.js
└── mobile/
    ├── App.tsx
    └── src/
        ├── api/client.ts         axios instance + token interceptor
        ├── context/              AuthContext, TaskContext (useReducer)
        ├── navigation/           auth flow vs. app flow
        ├── screens/              Login, Register, Home, AddTask
        ├── components/           TaskCard, Chips, PriorityPicker, inputs, buttons
        ├── utils/taskUtils.ts    smart sort, filters, date labels
        ├── theme/theme.ts        colours and spacing
        └── types/index.ts
```

## How the smart sort works

Each pending task gets a score. Higher score means it shows higher in the list.

```
urgency    = overdue ? 100 : 100 / (1 + hoursLeft / 48)
importance = priorityWeight (low 1, medium 2, high 3) * 25
started    = start time already passed ? 10 : 0
score      = urgency + importance + started
```

A high-priority task due tomorrow outranks a low-priority one due in an hour. Completed tasks always sink to the bottom.

## Running it

### 1. Backend

Needs Node 18+ and a MongoDB instance (local, or a free Atlas cluster).

```bash
cd backend
npm install
cp .env.example .env     # then edit MONGO_URI and JWT_SECRET
npm run dev
```

Check http://localhost:5000, which should return `{"status":"ok"}`.

### 2. Mobile app

Create the React Native CLI project, then copy this repo's `App.tsx` and `src/` folder into it.

```bash
npx @react-native-community/cli init TodoApp --template react-native-template-typescript
cd TodoApp
# copy mobile/App.tsx and mobile/src/ over the generated ones

npm install axios @react-native-async-storage/async-storage \
  @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context \
  @react-native-community/datetimepicker

npx react-native run-android
```

Notes:

- The API address is in `src/api/client.ts`. The default `10.0.2.2` works for the Android emulator. On a real phone, use your computer's LAN IP, for example `http://192.168.1.5:5000/api`.
- Plain `http://` requests are blocked by newer Android versions. For development, add `android:usesCleartextTraffic="true"` to the `<application>` tag in `android/app/src/main/AndroidManifest.xml`.
- If the generated template complains about a missing `react-native-screens` setup, follow the react-navigation install page for your RN version.

## API

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns token + user |
| POST | `/api/auth/login` | Log in, returns token + user |
| GET | `/api/auth/me` | Check a saved token |
| GET | `/api/tasks` | List your tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Edit a task |
| PATCH | `/api/tasks/:id/toggle` | Mark done / not done |
| DELETE | `/api/tasks/:id` | Delete a task |

All `/api/tasks` routes need the header `Authorization: Bearer <token>`.

## State management

React Context + `useReducer`, split in two:

- `AuthContext` holds the user and the login, register and logout actions.
- `TaskContext` holds the task list and all the ways it can change, in one reducer.

For an app this size it is lighter than Redux and easy to follow.
