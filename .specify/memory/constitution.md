<!-- 
Sync Impact Report:
- Version change: 1.0.0
- Modified principles:
  - PRINCIPLE_1_NAME -> 1. Biztonság mindenekelőtt
  - PRINCIPLE_2_NAME -> 2. Szigorú adatvédelem (GDPR)
  - PRINCIPLE_3_NAME -> 3. Felhasználó-központú szinkronizáció
  - PRINCIPLE_4_NAME -> 4. Kódolási standardok
  - PRINCIPLE_5_NAME -> 5. Tesztelhetőség
- Added sections: Célkitűzés
- Removed sections: Development Workflow (unused typical Section 3)
- Templates requiring updates (✅ updated):
  - .specify/templates/plan-template.md ✅
  - .specify/templates/spec-template.md ✅
  - .specify/templates/tasks-template.md ✅
- Follow-up TODOs: None
-->

# PureHabit Backend Constitution

## Core Principles

### 1. Biztonság mindenekelőtt
A hitelesítés kizárólag TOTP (Authenticator App) alapú kétfaktoros azonosítással (2FA) történhet. Az SMS alapú hitelesítés szigorúan tilos.

### 2. Szigorú adatvédelem (GDPR)
A felhasználók adatainak törlése esetén teljes, visszaállíthatatlan, kaszkádolt törlést (Hard Delete) kell alkalmazni minden adatbázis bejegyzésre és magára az Auth fiókra is.

### 3. Felhasználó-központú szinkronizáció
Az adatok szinkronizálásakor a felhasználó sosem veszítheti el a rögzített szokás-teljesítését. Konfliktus esetén a "Logikai VAGY" (OR) elv érvényesül a hagyományos "Last Write Wins" (utolsó írás nyer) helyett.

### 4. Kódolási standardok
Moduláris, tiszta Node.js kód, aszinkron műveletek helyes kezelése (Promises/async-await), és a Firebase Cloud Functions best practice-ek szigorú betartása.

### 5. Tesztelhetőség
A szinkronizációs logikát és a streak (sorozat) számításokat izoláltan, egységtesztekkel (unit tests) lefedhető módon kell megírni.

## Célkitűzés

Egy robusztus, szerver nélküli (serverless) backend rendszer létrehozása egy szokáskövető (habit tracker) alkalmazáshoz.

## Governance

Ezen alkotmány a projekt minden további döntését és fejlesztését meghatározza. Valamennyi Pull Request (PR) és kódellenőrzés (Code Review) során vizsgálni kell az adott feladat alapelveknek való megfelelőségét.

**Version**: 1.0.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-08
