# PureHabit - Backend ArchitekturA es Implementacios Terv (Callable-First Hybrid)

Verzio: 2.0 (Projekt-allapothoz igazított, hibriditett)
Datum: 2026-04-10
Statusz: A jelenlegi kodbazissal osszehangolt terv

## 1. Cel es irany

Ez a terv az eredeti implementacios terv atdolgozott valtozata, amely:
- igazodik a projekt jelenlegi Firebase Callable felépiteséhez,
- dokumentalja a jelenlegi architekturat, funkciokat es adatmodellt,
- kijeloli a tovabbi iranyt: Callable marad az elsodleges API modell,
- REST csak celzottan kerul bevezetesre (hibrid modell), ahol valoban indokolt.

## 2. Architekturális attekintes

A backend Firebase okoszisztémara epulo, serverless Node.js rendszer.

- Futtatokornyezet: Firebase Cloud Functions v2.
- Adatbazis: Cloud Firestore (NoSQL dokumentum alapú modell).
- Autentikacio: Firebase Authentication + TOTP ellenorzes (custom claim alapon).
- API paradigma (jelenleg): Firebase Callable Functions (onCall).
- Trigger komponensek: Identity, Firestore es Scheduler trigger-ek.

### 2.1. Miert Callable-first marad az alap?

- A jelenlegi backend publikus API-ja mar onCall alapu.
- A kliens oldali Firebase SDK egyszeruen kezeli az Auth context-et es hibamodellt.
- A meglévő biztonsagi guard-ok (email_verified, totpVerified) callable token kontextusra epulnek.
- A tesztkeszlet mar ezt a modellt validalja.

## 3. Projekt jelenlegi felépítese

A backend kod a `functions` modulban van elkulonitve.

```text
functions/
├── index.js
├── src/
│   ├── core/
│   │   ├── auth.js
│   │   ├── date.js
│   │   ├── deletion.js
│   │   ├── models.js
│   │   ├── reminders.js
│   │   ├── rules.js
│   │   ├── streaks.js
│   │   └── sync.js
│   └── handlers/
│       ├── api.js
│       ├── authMiddleware.js
│       ├── db.js
│       ├── errors.js
│       ├── notifications.js
│       └── triggers.js
└── tests/
    ├── core/
    └── handlers/
```

### 3.1. Retegzett felelossegek

- core/: tiszta uzleti logika, minimalis infrastrukura-fugges.
- handlers/: Firebase specifikus adapter reteg (callable/triggers, auth, hibakezeles).
- tests/: core es handler szintu lefedettseg.

## 4. Jelenlegi adatmodell (Firestore)

A jelenlegi implementacio szerinti gyujtemenyek:

### 4.1 users

Felhasznaloi profil.

Tipikus mezok (jelenleg):
- id (Auth UID)
- email
- timezone
- totp.enabled
- totp.secret (titkositva)
- createdAt
- updatedAt

Megjegyzes:
- A role, displayName, fcmTokens, settings.* mezok nem teljesen formalizaltak minden flow-ban.

### 4.2 habits

Szokas konfiguracio.

Tipikus mezok (jelenleg hasznalt):
- userId
- name
- frequency.type = SPECIFIC_DAYS
- frequency.days
- reminders[] (idopontok, pl. HH:mm)
- archived
- opcionalsan timezone

Megjegyzes:
- A jelenlegi reminder modell `reminders[]`, nem egyetlen `reminderTime`.

### 4.3 habit_logs

Napi teljesitesi allapot.

Tipikus mezok:
- habitId
- userId
- dateString (YYYY-MM-DD)
- completed (Boolean)
- timestamp (ISO)

Dokumentumazonosito minta:
- `{uid}_{habitId}_{logicalDay}`

### 4.4 streak_status

Habitenkenti szamitott streak cache.

Tipikus mezok:
- habitId
- userId
- currentStreak
- longestStreak
- lastEvaluatedDate
- updatedAt

## 5. Backend komponensek es uzleti logika

### 5.1 Auth Service

- TOTP secret generalas es verifikacio.
- TOTP secret titkositott tarolasa.
- Email verifikacio es TOTP claim enforce middleware-ben.
- Védett hivasoknal ellenorzes: `email_verified == true` es `totpVerified == true`.

### 5.2 Sync Service

- Offline log sync feldolgozas callable endpointon.
- Konfliktuskezeles: Logical OR merge (true felulirja a false allapotot).
- Logikai nap szamitas timezone + grace period alapjan.
- Tranzakcios iras a race condition-ek ellen.

### 5.3 Streak Service

- Kotelezo napok meghatarozasa frequency.days alapjan.
- currentStreak es longestStreak szamitas.
- Trigger alapu frissites `habit_logs` valtozasra.
- A longestStreak megorzese frekvencia valtozasnal vedett logikaval.

### 5.4 Deletion Service (GDPR)

- Felhasznalohoz tartozo adatok kaszkad torlese.
- Auth user torlese a vegponton keresztul.
- Jelenlegi torlesi kor: users, habits, habit_logs, streak_status.
- Tervezett bovites: feedbacks torlesi kor felvetele, ha gyujtemeny formalizalva lesz.

### 5.5 Reminder Service

- Percenkent futo scheduler trigger.
- Felhasznalo timezone figyelembe vetel.
- Csak nem teljesitett napi statusz eseten kuldes.
- Firebase Messaging kuldes push tokenre.

## 6. Jelenlegi callable fuggvenyek

A publikus API jelenleg Firebase Callable formaban elerheto.

- `setupTOTP`: TOTP onboarding secret + QR URI.
- `verifyTOTP`: TOTP kod ellenorzese, claim frissites.
- `syncHabitLogs`: offline log batch sync, OR merge.
- `deleteAccountAction`: sajat account hard delete flow.

Kapcsolodo trigger-ek:
- `onUserCreate`: user profil inicializalas.
- `onHabitLogWrite`: streak status ujraszamitas.
- `reminderScheduler`: percenkenti reminder feldolgozas.

## 7. Hibrid API strategia (veglegesitett irany)

## 7.1 Elv

- Callable marad az elsodleges API modell (default path).
- REST csak celzottan, ott ahol kulso rendszer vagy admin use-case ezt koveteli.
- Ugyanazt az uzleti logikat hasznalja mindket adapter reteg.

## 7.2 Mikor kell REST?

REST endpoint bevezetese akkor indokolt, ha:
- kulso partner/integracio Firebase SDK nelkul hivna az API-t,
- adminisztracios muvelet explicit HTTP szerzodest igenyel,
- webhook-jellegu kapcsolat szukseges.

## 7.3 Javasolt celzott REST endpointok

- `DELETE /admin/users/:uid`
  - Celu use-case: admin altali torles.
  - Jogosultsag: role=admin es server oldali validacio.
  - Implementacio: a meglévő deletion service ujrafelhasznalasa.

- `POST /sync` (opcionalis bridge)
  - Celu use-case: kulso kliens SDK nelkul.
  - Implementacio: ugyanaz a sync core, mint callable verzio.

- `POST /users/me/2fa/enroll` (opcionalis bridge)
  - Celu use-case: szabvanyos REST login/onboarding folyamok.
  - Implementacio: ugyanaz a TOTP setup core, mint callable verzio.

Megjegyzes:
- Ezek REST adapter endpointok legyenek, ne uj uzleti logika.

## 8. Hibrid implementacios szabalyok

- Single source of truth: uzleti logika csak core modulokban legyen.
- Handler parity: callable es REST handler ugyanazt a core API-t hivja.
- Egységes auth szabalyok: ugyanaz az email/TOTP/admin policy.
- Egységes hibaszerzodes: REST-en HTTP status + strukturalt body, callable-on HttpsError.
- Egységes audit/logging: request-id, user-id, endpoint tipus.

## 9. Biztonsag es megfeleles

- TOTP-only 2FA elv marad ervenyben.
- Email verifikacio enforce marad a védett muveletekhez.
- GDPR hard delete marad kotelezo.
- REST admin endpointokhoz kulon szerepkor ellenorzes kotelezo.

## 10. Tesztelesi es bevezetesI terv

### 10.1 Teszteles

- Core unit tesztek valtozatlanul kotelezoek.
- Callable handler tesztek maradnak.
- Uj REST endpointokhoz kulon handler/integration tesztek kellenek.
- Cross-adapter parity teszt: ugyanarra a bemenetre callable es REST azonos core eredmenyt ad.

### 10.2 Bevezetes fazisai

1. Fazis: Callable stabilizalas, adatmodell formalizalas (users settings, role, token modell).
2. Fazis: Celzott REST endpointok bevezetese csak priorizalt use-case-ekre.
3. Fazis: Admin es kulso integracios policy veglegesitese.
4. Fazis: Dokumentacio es contract frissites callable + REST bontasban.

## 11. Vegleges dontes

A PureHabit backend vegleges iranya:
- Elsodleges: Firebase Callable Functions.
- Kiegeszito: Celzott REST endpointok.
- Architekturális modell: hibrid, de core logika-egysegesitett.

Ez biztositja, hogy a jelenlegi projektstrukturara epuljunk tovabb, minimalis atiras mellett, mikozben megnyitjuk az utat a kulso REST integraciok fele ott, ahol annak uzleti erteke van.
