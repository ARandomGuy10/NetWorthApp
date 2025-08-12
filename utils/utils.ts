export const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString();
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
  