export interface BaseCredentials {
  emailAddress: string;
  password: string;
}

export interface SignInCredentials extends BaseCredentials {}

export interface SignUpCredentials extends BaseCredentials {
  firstName: string;
  lastName?: string;
}

export interface VerificationData {
  code: string;
}

export interface FormErrors {
  [field: string]: string;
}

export interface AnimatedButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
  hapticType?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  testID?: string;
  accessible?: boolean;
}

export interface ErrorMessageProps {
  message?: string;
  testID?: string;
}

export type OAuthStrategy = 'google' | 'apple';
