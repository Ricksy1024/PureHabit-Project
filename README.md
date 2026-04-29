# PureHabit Project

PureHabit is a habit-tracking web application with a React/Vite frontend and a Firebase backend. This repository currently combines a polished UI prototype with a working authentication flow and backend foundations for secure account handling, habit log sync, streak logic, and reminders.

---

## Magyar

### A Project leírása

A PureHabit egy szokáskövető webalkalmazás. A frontend egy látványos, animált React felületet ad, a backend pedig Firebase-re épülő hitelesítést és üzleti logikát biztosít.

Jelenlegi állapotban a projekt főleg ezeket tartalmazza:

- működő email/jelszó alapú Firebase Authentication integrációt
- valós idejű auth állapotkezelést a kliensben
- TOTP alapú kétlépcsős védelem backend alapokkal
- Firestore-alapú felhasználói profil és biztonsági állapot kezelését
- Cloud Functions logikát fióktörléshez, habit log szinkronhoz, streak számításhoz és emlékeztetőkhöz
- egy erős UI prototípust dashboard és statisztika nézetekkel

Fontos: a bejelentkezés és a backend auth/logikai rétegek valósak, de a dashboard és a statisztika nézet több eleme jelenleg még demó vagy lokális állapotból épül fel, nem teljesen backendről töltött adat.

### Főbb technológiák

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion
- Backend: Firebase Authentication, Firestore, Cloud Functions
- Kiegészítők: Data Connect generált kliensek, TOTP, biztonsági secret scan szkriptek

### Projektstruktúra röviden

- `src/`: frontend alkalmazás, auth UI, hookok, komponensek, Firebase kliens konfiguráció
- `functions/`: Firebase Cloud Functions, auth, szinkron, streak, reminder, account deletion logika
- `specs/`: funkcionális specifikációk és megvalósítási tervek
- `dataconnect/`: Data Connect séma és kapcsolódó fájlok

### Gyors setup (2 perc)

1. Telepítsd a függőségeket:

```bash
npm install
cd functions && npm install && cd ..
```

2. Készíts frontend env fájlt:

```bash
cp .env.example .env
```

3. Töltsd ki a `.env`-ben a `VITE_FIREBASE_*` értékeket a Firebase projektedből.

4. Adj meg TOTP titkosítási kulcsot a `functions/.env` fájlban:

```env
TOTP_LOCAL_ENCRYPTION_KEY=valami_hosszu_veletlen_titok
```

5. Deploy + indítás:

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes,functions
npm run dev
```

Frontend: http://localhost:3000

### Részletes setup

#### 1. Előfeltételek

- Node.js 22.x (a `functions` csomag ehhez van állítva)
- npm 10+
- Firebase projekt
- Firebase CLI (`firebase`) a deploy lépéshez

Telepítés, ha nincs meg:

```bash
npm install -g firebase-tools
```

#### 2. Függőségek telepítése

A repo gyökerében:

```bash
npm install
```

A `functions` csomaghoz is:

```bash
cd functions
npm install
cd ..
```

#### 3. Firebase Console alapbeállítások

1. `Authentication -> Sign-in method` alatt kapcsold be az `Email/Password` providert.
2. `Firestore Database` alatt hozz létre adatbázist `Native mode` módban.
3. `Project Settings -> General -> Your apps` részből másold ki a web app config értékeit.

#### 4. Frontend környezeti változók

Másold le az env mintát:

```bash
cp .env.example .env
```

Töltsd ki legalább ezeket a `.env` fájlban:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Megjegyzés: a `GEMINI_API_KEY` és `APP_URL` mezők AI Studio futtatásnál hasznosak, a helyi induláshoz nem kötelezőek.

#### 5. Functions környezeti változók

A TOTP titkosítás miatt állíts be legalább egy helyi titkot a `functions/.env` fájlban:

```env
TOTP_LOCAL_ENCRYPTION_KEY=valami_hosszu_veletlen_titok
```

Ha ez hiányzik, a TOTP setup/verify callable endpointok hibázhatnak.

#### 6. Firebase deploy (rules + indexes + functions)

```bash
firebase login
firebase use <a-te-projekt-azonositod>
firebase deploy --only firestore:rules,firestore:indexes,functions
```

Megjegyzés: ebben a repóban van default projekt (`purehabit-b2923`), de saját projektre is átállhatsz a `firebase use` paranccsal.

#### 7. Alkalmazás indítása

```bash
npm run dev
```

Frontend: http://localhost:3000

#### 8. Gyors smoke check

1. Nyisd meg a http://localhost:3000 oldalt.
2. Kattints a `Sign In` gombra.
3. Próbálj regisztrálni és bejelentkezni email/jelszó alapon.
4. Ellenőrizd, hogy nincs `Firebase is not configured` hiba.
5. Ha TOTP műveletnél `functions/unavailable` hibát kapsz, deployold újra a functionöket.

### Hasznos parancsok

```bash
npm run lint
npm test
```

## English

### Project Description

PureHabit is a habit-tracking web application. The frontend provides a polished, animated React experience, while the backend provides Firebase-based authentication and business logic.

At the moment, the repository mainly includes:

- working Firebase Authentication with email/password sign-in and sign-up
- real-time auth state handling in the client
- backend foundations for TOTP-based two-factor protection
- Firestore-backed user profile and account security state handling
- Cloud Functions for account deletion, habit log sync, streak calculation, and reminders
- a strong UI prototype for dashboard and statistics views

Important: the authentication flow and backend auth/business logic are real, but parts of the dashboard and statistics experience are still powered by demo or local state rather than fully backend-loaded data.

### Main technologies

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion
- Backend: Firebase Authentication, Firestore, Cloud Functions
- Extras: generated Data Connect clients, TOTP support, secret scanning scripts

### Project structure at a glance

- `src/`: frontend app, auth UI, hooks, components, Firebase client config
- `functions/`: Firebase Cloud Functions for auth, sync, streaks, reminders, and account deletion
- `specs/`: feature specifications and implementation plans
- `dataconnect/`: Data Connect schema and related files

### Quick setup (2 minutes)

1. Install dependencies:

```bash
npm install
cd functions && npm install && cd ..
```

2. Create the frontend env file:

```bash
cp .env.example .env
```

3. Fill in the `VITE_FIREBASE_*` values in `.env` from your Firebase project.

4. Add a TOTP encryption key in `functions/.env`:

```env
TOTP_LOCAL_ENCRYPTION_KEY=some_long_random_secret
```

5. Deploy and start:

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes,functions
npm run dev
```

Frontend: http://localhost:3000

### Detailed setup

#### 1. Prerequisites

- Node.js 22.x (`functions` is configured for this version)
- npm 10+
- A Firebase project
- Firebase CLI (`firebase`) for deployment

Install the CLI if needed:

```bash
npm install -g firebase-tools
```

#### 2. Install dependencies

In the repository root:

```bash
npm install
```

Also install dependencies for `functions`:

```bash
cd functions
npm install
cd ..
```

#### 3. Firebase Console baseline setup

1. In `Authentication -> Sign-in method`, enable the `Email/Password` provider.
2. In `Firestore Database`, create a database in `Native mode`.
3. In `Project Settings -> General -> Your apps`, copy the web app config values.

#### 4. Frontend environment variables

Copy the env template:

```bash
cp .env.example .env
```

Fill in at least the following values in `.env`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Note: `GEMINI_API_KEY` and `APP_URL` are useful for AI Studio related work, but they are not required for local startup.

#### 5. Functions environment variables

Because of TOTP encryption, set at least one local secret in `functions/.env`:

```env
TOTP_LOCAL_ENCRYPTION_KEY=some_long_random_secret
```

If this is missing, the TOTP setup/verify callable endpoints may fail.

#### 6. Firebase deploy (rules + indexes + functions)

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes,functions
```

Note: this repository includes a default project (`purehabit-b2923`), but you can switch to your own with `firebase use`.

#### 7. Start the application

```bash
npm run dev
```

Frontend: http://localhost:3000

#### 8. Quick smoke check

1. Open http://localhost:3000.
2. Click `Sign In`.
3. Try registering and signing in with email/password.
4. Confirm there is no `Firebase is not configured` error.
5. If you get `functions/unavailable` during a TOTP action, redeploy the functions.

### Useful commands

```bash
npm run lint
npm test
```
