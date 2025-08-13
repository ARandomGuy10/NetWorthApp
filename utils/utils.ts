export const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString();
  };

// ✅ Fixed: Smart number formatting that only abbreviates when necessary
export const formatSmartNumber = (value: number, currency: string = 'EUR'): string => {
  const absValue = Math.abs(value);
  
  // Only abbreviate if 6+ digits (100,000+) since 5 digits fit in the UI
  if (absValue >= 100000000) { // 100M+
    const abbreviated = value / 1000000;
    // Use minimal decimal places, remove if it's a whole number
    const formatted = abbreviated % 1 === 0 ? abbreviated.toString() : abbreviated.toFixed(1);
    return formatCurrency(abbreviated, currency).replace(abbreviated.toString(), formatted) + 'M';
  } else if (absValue >= 100000) { // 100K+
    const abbreviated = value / 1000;
    // Use minimal decimal places, remove if it's a whole number  
    const formatted = abbreviated % 1 === 0 ? abbreviated.toString() : abbreviated.toFixed(1);
    return formatCurrency(abbreviated, currency).replace(abbreviated.toString(), formatted) + 'K';
  } else {
    // Show full number for anything under 100,000 (5 digits or less)
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

export const makeGradientColors = (theme: any): [string, string, string] => {
    // Use theme's specific gradient colors if available
    if (theme.gradient && theme.gradient.colors) {
      const { colors } = theme.gradient;
      return [colors[0], colors[1], colors[2] || colors[1]];
    }
    
    // Fallback for themes without gradient property
    return [
      theme.colors.background.primary,
      theme.colors.background.tertiary,
      theme.colors.primary + '30'
    ];
  };
  