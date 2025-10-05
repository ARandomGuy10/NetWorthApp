import * as Sentry from '@sentry/react-native';

type SentryLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

interface SentryLogOptions {
  /** The specific user action or process that failed. e.g., 'sign_in', 'create_profile' */
  context: string;
  /** The high-level area of the app where the error occurred. e.g., 'auth', 'dashboard' */
  location: string;
  /** The name of the React component where the error was caught. e.g., 'SignInScreen' */
  component?: string;
  /** The severity level of the error for Sentry. Defaults to 'error'. */
  level?: SentryLevel;
  /** A record of any extra data to attach to the Sentry event for debugging. */
  extraData?: Record<string, any>;
}

// A list of substrings that indicate a predictable user error, not a system error.
// These errors should not be logged to Sentry to avoid noise and save quota.
const KNOWN_USER_ERROR_SUBSTRINGS = [
  'password or email address is incorrect', // General login failure
  'incorrect password', // Specific password failure
  'identifier or password incorrect', // Another common Clerk error
  'too many attempts', // Rate limiting
  'too many login attempts', // Rate limiting
  'no account found', // Forgot password with non-existent email
  'form_code_incorrect', // Incorrect verification code
  'password has been found in a data breach', // Pwned Passwords check
  'is already in use or invalid', // Email already exists on sign up
];

/**
 * Checks if an error is a known, predictable user error that should not be logged.
 * @param error The error object to check.
 * @returns `true` if the error is a known user error, `false` otherwise.
 */
const isKnownUserError = (error: unknown): boolean => {
  if (!(error instanceof Error) && typeof error !== 'string') {
    return false;
  }

  const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();

  // Also check Clerk's specific error structure for more accuracy
  const clerkErrorMessage = ((error as any)?.errors?.[0]?.message || '').toLowerCase();

  return KNOWN_USER_ERROR_SUBSTRINGS.some(
    substring => errorMessage.includes(substring) || clerkErrorMessage.includes(substring)
  );
};
/**
 * A centralized utility for capturing exceptions with Sentry,
 * ensuring consistent tagging and context.
 *
 * @param error The error object to capture.
 * @param options Contextual information for the Sentry event.
 */
export const captureSentryException = (error: unknown, options: SentryLogOptions) => {
  // First, check if this is a known user error that we should ignore.
  if (isKnownUserError(error)) {
    // In development, it can be useful to know an error was ignored.
    if (__DEV__) console.log('Sentry: Ignoring known user error:', (error as any)?.message || error);
    return; // Do not log to Sentry
  }
  const {context, location, component, level = 'error', extraData = {}} = options;

  Sentry.withScope(scope => {
    let capturedError: Error;

    if (error instanceof Error) {
      capturedError = error;
    } else {
      // If the caught value is not an Error, wrap it to ensure a stack trace.
      const errorMessage = `Non-error thrown in ${location}/${context}: ${JSON.stringify(error)}`;
      capturedError = new Error(errorMessage);
      // Add the original value as extra data for more context.
      scope.setExtra('originalThrownValue', error);
    }

    scope.setTag('location', location);
    scope.setTag('context', context);
    if (component) {
      scope.setTag('component', component);
    }
    scope.setLevel(level);

    Object.keys(extraData).forEach(key => scope.setExtra(key, extraData[key]));

    Sentry.captureException(capturedError);
  });
};

/**
 * A centralized utility for capturing string messages with Sentry,
 * ensuring consistent tagging and context.
 *
 * @param message The string message to capture.
 * @param options Contextual information for the Sentry event.
 */
export const captureSentryMessage = (message: string, options: SentryLogOptions) => {
  const {context, location, component, level = 'info', extraData = {}} = options;

  Sentry.withScope(scope => {
    scope.setTag('location', location);
    scope.setTag('context', context);
    if (component) {
      scope.setTag('component', component);
    }
    scope.setLevel(level);

    Object.keys(extraData).forEach(key => scope.setExtra(key, extraData[key]));

    Sentry.captureMessage(message);
  });
};
