/**
 * errors.js — Reusable HTTP error responder for Firebase Callable Functions.
 *
 * Provides a consistent error-handling pattern across all callable handlers.
 */

const { HttpsError } = require('firebase-functions/v2/https');

/**
 * Throws a structured HttpsError for callable functions.
 *
 * @param {string} code    — Firebase error code (e.g. 'unauthenticated', 'invalid-argument')
 * @param {string} message — Human-readable error message
 * @param {object} [details] — Optional additional details
 * @throws {HttpsError}
 */
function throwHttpsError(code, message, details) {
  throw new HttpsError(code, message, details);
}

/**
 * Wraps a callable handler with a try/catch that converts
 * unexpected errors into 'internal' HttpsErrors.
 *
 * @param {Function} handler — async (request) => result
 * @returns {Function}
 */
function withErrorHandling(handler) {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      // Re-throw if it's already an HttpsError (intentional)
      if (error instanceof HttpsError) {
        throw error;
      }
      // Wrap unknown errors
      console.error('Unexpected error:', error);
      throw new HttpsError('internal', 'An unexpected error occurred.');
    }
  };
}

module.exports = { throwHttpsError, withErrorHandling };
