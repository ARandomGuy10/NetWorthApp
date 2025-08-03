export const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString();
  };
  

  export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
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
  };