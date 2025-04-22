import { HTMLElement } from 'node-html-parser';
import { Entry } from './model';
import { minorUnitDecimals, stringAmount } from './currency';

export const decimalSeparator = '.';
export const decimalCount = 2;
export const statementSelector = `ing-ow-expandable-item`;
export const csvHeaderLine = `Date,Description,Currency,Amount,Exchange rate,Original currency,Original amount,Conversion fee\n`;
// ING‌ outputs a correct minus sign. Javascript only parses hyphens (word break characters) as negative prefix in numbers. Took me a LONG time to figure that out.
export const minusSign = '−';

export const parseDate = ([_, yearString, monthString, dayString]: [
  unknown,
  string,
  string,
  string
]) =>
  new Date(
    parseInt(yearString),
    parseInt(monthString) - 1,
    parseInt(dayString),
    0,
    0,
    0
  );

//Note: I remove the decimal separator and treat the number as the smallest currency unit.
//      This can safely be done, because that's how ING outputs it. E.g. euros are always written with two decimals.
//      This prevents floating point errors. E.g. the number 0.3 is not accurately representable in Javascript,
//      but every integer written with 15 characters or less IS accurately representable.
//      I don't think anyone has credit card statements with amounts that involve more than 15 character numbers.
//Note: At the moment the amount of decimals used for the currency is discarded. So values for currencies that use
//      a different number than the value of `decimalPlaces` will be wrong.
//      See: https://en.wikipedia.org/wiki/ISO_4217
//      Examples: Japanese Yen, Icelandic króna,
export const parseAmountString = (amount: string) =>
  amount != null
    ? parseInt(
        amount
          // Trim whitespace and currency abbreviations
          .replace(minusSign, '-')
          .replaceAll(/[^-0-9]/gm, '')
      )
    : amount;

export const elementToEntry = (entryElement: HTMLElement) =>
  ({
    amount: parseAmountString(
      entryElement.querySelector('.expandable-value>span').innerText
    ),
    currency:
      entryElement.parentNode.parentNode.parentNode.querySelector('span.hidden')
        .innerText,
    conversionFee: parseAmountString(
      entryElement.querySelector('dd[aria-labelledby="details-item-id-2"]>span')
        ?.innerText
    ),
    date: new Date(
      entryElement
        .querySelector('dd[aria-labelledby="details-item-id-0"] time')
        .getAttribute('datetime')
    ),
    description: entryElement
      .querySelector('.expandable-title')
      .innerText.trim()
      .replaceAll(/[\s\n]+/gm, ' '),
    exchangeRate: entryElement.querySelector(
      'dd[aria-labelledby="details-item-id-3"]>span'
    )?.innerText,
    originalAmount: parseAmountString(
      entryElement.querySelector('dd[aria-labelledby="details-item-id-1"]>span')
        ?.innerText
    ),
    originalCurrency: entryElement
      .querySelector('dd[aria-labelledby="details-item-id-1"]>span')
      ?.innerText.match(/([a-zA-Z]+)/)[1],
  } as Entry);

export const entryToCsvLine = (entry: Entry) =>
  `${entry.date.getFullYear()}-${
    entry.date.getMonth() + 1
  }-${entry.date.getDate()},"${entry.description}",${
    entry.currency
  },${stringAmount(
    entry.amount,
    minorUnitDecimals(entry.currency),
    decimalSeparator
  )},${entry.exchangeRate ?? ''},${entry.originalCurrency ?? ''},${stringAmount(
    entry.originalAmount,
    minorUnitDecimals(entry.originalCurrency),
    decimalSeparator
  )},${stringAmount(
    entry.conversionFee,
    minorUnitDecimals(entry.currency),
    decimalSeparator
  )}\n`;
