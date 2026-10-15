export const formatterDollar = (value: number): string =>
  value !== null && value !== undefined
    ? `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : '';

export const parserDollar = (value: string): number => +value.replace(/\$\s?|(,*)/g, '');
