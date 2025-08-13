import {Theme} from '@/lib/supabase';

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Not available';
  return new Date(dateString).toLocaleDateString();
};

// ✅ Final version: 4 digits precision (not counting M/K suffix)
export const formatSmartNumber = (value: number, currency: string = 'EUR'): string => {
  const absValue = Math.abs(value);

  if (absValue >= 1000000) {
    // 1M+
    const abbreviated = value / 1000000;
    let formatted;
    if (abbreviated >= 1000) {
      // 1000M+ → "1000M" (4 digits + M)
      formatted = Math.round(abbreviated).toString();
    } else if (abbreviated >= 100) {
      // 100M-999M → "567M" (3 digits + M, but let's make it 4)
      formatted = abbreviated.toFixed(1); // "567.8M" (4 digits + M)
    } else if (abbreviated >= 10) {
      // 10M-99.9M → "12.34M" (4 digits + M)
      formatted = abbreviated.toFixed(2);
    } else {
      // 1M-9.999M → "1.234M" (4 digits + M)
      formatted = abbreviated.toFixed(3);
    }
    return formatCurrency(parseFloat(formatted), currency).replace(/[\d,.-]+/, formatted) + 'M';
  } else if (absValue >= 100000) {
    // 100K+
    const abbreviated = value / 1000;
    let formatted;
    if (abbreviated >= 100) {
      // 100K-999K → "567.8K" (4 digits + K)
      formatted = abbreviated.toFixed(1);
    } else {
      // This shouldn't happen since we start at 100K
      formatted = abbreviated.toFixed(2);
    }
    return formatCurrency(parseFloat(formatted), currency).replace(/[\d,.-]+/, formatted) + 'K';
  } else {
    // Show full number for anything under 100,000
    return formatCurrency(value, currency);
  }
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
