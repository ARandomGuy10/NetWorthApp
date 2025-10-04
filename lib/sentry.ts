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

/**
 * A centralized utility for capturing exceptions with Sentry,
 * ensuring consistent tagging and context.
 *
 * @param error The error object to capture.
 * @param options Contextual information for the Sentry event.
 */
export const captureSentryException = (error: unknown, options: SentryLogOptions) => {
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
