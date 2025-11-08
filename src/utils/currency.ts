// Utility functions for formatting currency values

export const formatPrice = (amount: number, currencyCode: string = 'NGN'): string => {
  // Handle edge cases
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }

  // Format the amount with proper decimal places
  const locale = currencyCode === 'NGN' ? 'en-NG' : 'en-US';
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return formattedAmount;
};

export const formatPriceWithoutCurrency = (amount: number): string => {
  // Handle edge cases
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }

  // Format the amount without currency symbol
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const parsePrice = (priceString: string): number => {
  // Remove currency symbols and commas, then parse to float
  const cleaned = priceString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

const currencyUtils = {
  formatPrice,
  formatPriceWithoutCurrency,
  parsePrice
};

export default currencyUtils;