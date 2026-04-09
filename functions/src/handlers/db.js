/**
 * db.js — Firebase Admin singleton.
 *
 * All Firestore/Auth access goes through this module so handlers
 * never import firebase-admin directly.  Tests can mock this export.
 */

const admin = require('firebase-admin');

// Initialize only once (idempotent in Cloud Functions runtime)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
