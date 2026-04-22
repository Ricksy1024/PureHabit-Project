const { throwHttpsError } = require('./errors');

function requireCallableAuth(request, options = {}) {
  const requireEmailVerified = options.requireEmailVerified !== false;
  const requireTotp = options.requireTotp !== false;

  if (!request || !request.auth || !request.auth.uid) {
    throwHttpsError('unauthenticated', 'Authentication is required.');
  }

  const token = request.auth.token || {};

  if (requireEmailVerified && token.email_verified !== true) {
    throwHttpsError('failed-precondition', 'Email must be verified.');
  }

  if (requireTotp && token.totpVerified !== true) {
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
