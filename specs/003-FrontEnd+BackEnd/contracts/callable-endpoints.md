# Callable Cloud Function Endpoints

**Feature**: `003-FrontEnd+BackEnd`

This defines the contracts for the new Cloud Function callables that act as wrappers for Firestore operations, as dictated by the security rules constraint.

## 1. `createHabitAction`
Creates a new habit for the authenticated user.

**Request Body:**
```json
{
  "name": "Morning Meditation",
  "frequency": {
    "type": "SPECIFIC_DAYS",
    "days": ["MON", "WED", "FRI"]
  },
  "reminders": [{ "time": "08:00" }],
  "uiBgColor": "bg-[#FDECE8]",
  "uiIconName": "Activity",
  "uiMetric": "15 min"
}
```

**Response (Success):**
```json
{
  "success": true,
  "habitId": "hab12345"
}
```

## 2. `updateHabitAction`
Updates an existing habit.

**Request Body:**
```json
{
  "habitId": "hab12345",
  "name": "Updated Meditation",
  "frequency": {
    "type": "SPECIFIC_DAYS",
    "days": ["MON", "TUE", "WED", "THU", "FRI"]
  },
  "reminders": [{ "time": "07:00" }],
  "uiBgColor": "bg-[#FDECE8]",
  "uiIconName": "Wind",
  "uiMetric": "20 min"
}
```

**Response (Success):**
```json
{
  "success": true
}
```

## 3. `archiveHabitAction`
Archives (soft-deletes) an existing habit.

**Request Body:**
```json
{
  "habitId": "hab12345"
}
```

**Response (Success):**
```json
{
  "success": true
}
```

## 4. `registerDeviceTokenAction`
Registers an FCM token for the user.

**Request Body:**
```json
{
  "token": "eF...zM"
}
```

**Response (Success):**
```json
{
  "success": true
}
```
