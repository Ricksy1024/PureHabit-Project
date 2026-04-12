# PureHabit Project

Teljes, de tomor setup ehhez a projekthez.

## Rovid setup (2 perc)

1. Telepitsd a fuggosegeket:

```bash
npm install
cd functions && npm install && cd ..
```

2. Keszits frontend env fajlt:

```bash
cp .env.example .env
```

3. Toltsd ki a `.env`-ben a `VITE_FIREBASE_*` ertekeket a Firebase projektedbol.

4. Adj meg TOTP titkositas kulcsot a `functions/.env` fajlban:

```env
TOTP_LOCAL_ENCRYPTION_KEY=valami_hosszu_veletlen_titok
```

5. Deploy + inditas:

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes,functions
npm run dev
```

Frontend: http://localhost:3000

## 1. Elofeltetelek

- Node.js 22.x (a `functions` csomag ehhez van allitva)
- npm 10+
- Firebase projekt
- Firebase CLI (`firebase`) a deploy lepeshez

Telepites (ha nincs meg):

```bash
npm install -g firebase-tools
```

## 2. Fuggosegek telepitese

A repo gyokerben:

```bash
npm install
```

Functions csomaghoz is:

```bash
cd functions
npm install
cd ..
```

## 3. Firebase Console alapbeallitasok

1. Authentication -> Sign-in method -> kapcsold be az Email/Password providert.
2. Firestore Database -> hozz letre adatbazist (Native mode).
3. Project Settings -> General -> Your apps -> Web app config ertekek masolasa.

## 4. Frontend kornyezeti valtozok

Masold le az env mintat:

```bash
cp .env.example .env
```

Toltsd ki legalabb ezeket a `.env` fajlban:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Megjegyzes: a `GEMINI_API_KEY` es `APP_URL` mezok AI Studio futtatasnal hasznosak, a helyi indulashoz nem kotelezoek.

## 5. Functions kornyezeti valtozok (ajanlott)

A TOTP titkositas miatt allits be legalabb egy helyi titkot a `functions/.env` fajlban:

```env
TOTP_LOCAL_ENCRYPTION_KEY=valami_hosszu_veletlen_titok
```

Ha ez hianyzik, a TOTP setup/verify callable endpointok hibazhatnak.

## 6. Firebase deploy (rules + indexes + functions)

```bash
firebase login
firebase use <a-te-projekt-azonositod>
firebase deploy --only firestore:rules,firestore:indexes,functions
```

Megjegyzes: ebben a repoban van default projekt (`purehabit-b2923`), de sajat projektre is allithatod a `firebase use` paranccsal.

## 7. Alkalmazas inditasa

```bash
npm run dev
```

Frontend: http://localhost:3000

## 8. Gyors smoke check

1. Nyisd meg a http://localhost:3000 oldalt.
2. Kattints a Sign In gombra.
3. Probalj regisztralni es bejelentkezni email/password alapon.
4. Ellenorizd, hogy nincs `Firebase is not configured` hiba.
5. Ha TOTP muveletnel `functions/unavailable` hibad van, deployold ujra a functionoket.

## Hasznos parancsok

```bash
npm run lint
npm test
```
