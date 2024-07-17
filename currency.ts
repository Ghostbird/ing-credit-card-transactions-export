/** Returns minor unit decimals taken from https://en.wikipedia.org/wiki/ISO_4217#Active_codes_(list_one) */
export const minorUnitDecimals = (currencyCode: string) =>
  ({
    BHD: 3,
    BIF: 0,
    CLF: 4,
    CLP: 0,
    DJF: 0,
    GNF: 0,
    IQD: 3,
    ISK: 0,
    JOD: 3,
    JPY: 0,
    KMF: 0,
    KRW: 0,
    KWD: 3,
    LYD: 3,
    OMR: 3,
    PYG: 0,
    RWF: 0,
    TND: 3,
    UGX: 0,
    UYI: 0,
    UYW: 4,
    VND: 0,
    VUV: 0,
    XAF: 0,
    XOF: 0,
    XPF: 0,
  }[currencyCode] ??
  /* All other currencies are assumed to have 2 decimals for their minor unit */
  2);

export const stringAmount = (
  amount: number,
  decimalPlaces: number = 2,
  decimalSep: string = '.'
) =>
  amount != null
    ? `${`${amount}`.slice(0, -decimalPlaces || undefined)}${
        decimalPlaces ? `${decimalSep}${`${amount}`.slice(-decimalPlaces)}` : ''
      }`
    : '';
