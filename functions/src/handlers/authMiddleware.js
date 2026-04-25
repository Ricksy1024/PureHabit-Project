const { throwHttpsError } = require('./errors');
const { auth } = require('./db');

async function requireCallableAuth(request, options = {}, deps = {}) {
  const requireEmailVerified = options.requireEmailVerified !== false;
  const requireTotp = options.requireTotp !== false;

  if (!request || !request.auth || !request.auth.uid) {
    throwHttpsError('unauthenticated', 'Authentication is required.');
  }

  const token = request.auth.token || {};
  const authClient = deps.auth || auth;
  let userRecord = null;

  const needsEmailFallback = requireEmailVerified && token.email_verified !== true;
  const needsTotpFallback = requireTotp && token.totpVerified !== true;

  if (needsEmailFallback || needsTotpFallback) {
    try {
      userRecord = await authClient.getUser(request.auth.uid);
    } catch (error) {
      if (error && error.code === 'auth/user-not-found') {
        throwHttpsError('unauthenticated', 'Authentication is required.');
      }
      throw error;
    }
  }

  const emailVerified =
    token.email_verified === true ||
    (userRecord && userRecord.emailVerified === true);
  const totpVerified =
    token.totpVerified === true ||
    Boolean(userRecord && userRecord.customClaims && userRecord.customClaims.totpVerified === true);

  if (requireEmailVerified && !emailVerified) {
    throwHttpsError('failed-precondition', 'Email must be verified.');
  }

  if (requireTotp && !totpVerified) {
    throwHttpsError('permission-denied', 'TOTP verification is required.');
  }

  return {
    uid: request.auth.uid,
    email: token.email || null,
    token,
  };
}

module.exports = {
  requireCallableAuth,
};
