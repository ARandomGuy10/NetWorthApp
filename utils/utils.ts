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

  

  /* export const formatCurrency = (amount: number | string, currency: string = 'EUR'): string => {
    const currencySymbols: { [key: string]: string } = {
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥',
      INR: '₹',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      SEK: 'kr'
    };
  
    const symbol = currencySymbols[currency] || currency;
    
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount)).replace(/^/, symbol);
  }; */