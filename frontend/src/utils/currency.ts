const currencyFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export const formatCurrency = (value: string | number | null | undefined) => {
  const numeric = typeof value === 'string' ? Number(value) : value;
  return currencyFormatter.format(numeric || 0);
};
