export const CURRENCY_CODE = 'PKR';
export const CURRENCY_SYMBOL = 'Rs. ';

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0.00';
  return `Rs. ${Number(amount).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatShortCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Number(amount).toFixed(0)}`;
};
