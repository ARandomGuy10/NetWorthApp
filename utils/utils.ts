import {Theme} from '@/lib/supabase';

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Not available';
  return new Date(dateString).toLocaleDateString();
};

// ✅ Final version: 4 digits precision (not counting M/K suffix)
export const formatSmartNumber = (value: number, currency: string = 'EUR'): string => {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let abbreviatedValue: number;
  let suffix = '';

  if (absValue >= 1000000) {
    abbreviatedValue = absValue / 1000000;
    suffix = 'M';
  } else if (absValue >= 100000) {
    abbreviatedValue = absValue / 1000;
    suffix = 'K';
  } else {
    // For numbers under 100,000, let formatCurrency handle everything, including the sign.
    return formatCurrency(value, currency);
  }

  // Determine precision for abbreviation
  let formattedAbbr: string;
  if (abbreviatedValue >= 1000) {
    formattedAbbr = Math.round(abbreviatedValue).toString();
  } else if (abbreviatedValue >= 100) {
    formattedAbbr = abbreviatedValue.toFixed(1);
  } else if (abbreviatedValue >= 10) {
    formattedAbbr = abbreviatedValue.toFixed(2);
  } else {
    formattedAbbr = abbreviatedValue.toFixed(3);
  }

  // Use formatCurrency on the abbreviated value (positive) to get currency symbol and placement
  let symbol = '';
  let symbolIsPrefix = true; // Assume prefix by default

  // Format a zero value to get the currency symbol and its placement
  const zeroFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(0);

  // Remove the '0' to isolate the symbol
  symbol = zeroFormatted.replace('0', '').trim();

  // Determine if symbol is prefix or suffix by checking its position relative to '0'
  if (zeroFormatted.startsWith(symbol)) {
    symbolIsPrefix = true;
  } else {
    symbolIsPrefix = false;
  }

  let finalString = formattedAbbr + suffix;
  if (symbol) {
    if (symbolIsPrefix) {
      finalString = symbol + finalString;
    } else {
      finalString = finalString + symbol;
    }
  }

  return isNegative ? `-${finalString}` : finalString;
};

export const formatCurrency = (value: number | string, currency: string = 'EUR'): string => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

export const getGradientColors = (theme: any, type: string = 'primary'):[string, string, ...string[]] => {
  
  if (!theme.colors.gradient[type]) {
    return theme.colors.gradient.primary;
  }
  return theme.colors.gradient[type];
};
