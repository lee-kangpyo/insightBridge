export const CARD_FORMATS = [
  { value: 'raw', label: '원문' },
  { value: 'number', label: '숫자' },
  { value: 'percent', label: '퍼센트' },
  { value: 'currency', label: '통화' },
];

export const DEFAULT_CARD_ITEM = {
  label: '',
  content: '',
  color: '#002c5a',
  format: 'raw',
  decimalPlaces: 0,
  thousandSeparator: true,
  percentBase: '0to100',
  prefix: '',
  suffix: '',
  nullDisplay: '-',
};
