import { parse, HTMLElement } from "node-html-parser";
import { open } from "node:fs/promises";

export const decimalSeparator = ".";
export const decimalCount = 2;
// ING‌ outputs a correct minus sign. Javascript only parses hyphens (word break characters) as negative prefix in numbers. Took me a LONG time to figure that out.
export const minusSign = "−";

export interface Entry {
  amount: number;
  currency: string;
  date: Date;
  conversionFee?: number;
  description: string;
  exchangeRate?: string;
  originalAmount?: number;
  originalCurrency?: string;
}

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
          .replace(minusSign, "-")
          .replaceAll(/[^-0-9]/gm, "")
      )
    : amount;
export const elementToEntry = (entryElement: HTMLElement) =>
  ({
    amount: parseAmountString(
      entryElement.querySelector(".expandable-value>span").innerText
    ),
    currency:
      entryElement.parentNode.parentNode.parentNode.querySelector("span.hidden")
        .innerText,
    conversionFee: parseAmountString(
      entryElement.querySelector('dd[aria-labelledby="details-item-id-2"]>span')
        ?.innerText
    ),
    date: new Date(
      entryElement
        .querySelector('dd[aria-labelledby="details-item-id-0"] time')
        .getAttribute("datetime")
    ),
    description: entryElement
      .querySelector(".expandable-title")
      .innerText.trim()
      .replaceAll(/[\s\n]+/gm, " "),
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

export const csvStringAmount = (
  amount: number,
  decimalPlaces: number = decimalCount,
  decimalSep: string = decimalSeparator
) =>
  amount != null
    ? `${`${amount}`.slice(0, -decimalPlaces)}${decimalSep}${`${amount}`.slice(
        -decimalPlaces
      )}`
    : "";

export const entryToCsvLine = (entry: Entry) =>
  `${entry.date.getFullYear()}-${
    entry.date.getMonth() + 1
  }-${entry.date.getDate()},"${entry.description}",${
    entry.currency
  },${csvStringAmount(entry.amount)},${entry.exchangeRate ?? ""},${
    entry.originalCurrency ?? ""
  },${csvStringAmount(entry.originalAmount)},${csvStringAmount(
    entry.conversionFee
  )}\n`;

export const writeOut = await (
  async (output: {
    write: (chunk: string) => void;
  }): Promise<(line: string) => void> =>
  (line: string) =>
    output.write(line)
)(
  process.argv[3]
    ? (await open(process.argv[3], "w")).createWriteStream()
    : process.stdout
);

export async function readInput(): Promise<string> {
  const chunks = [];
  for await (const chunk of process.argv[2]
    ? (await open(process.argv[2])).createReadStream()
    : process.stdin)
    chunks.push(chunk);
  return chunks.join("");
}

writeOut(
  `Date,Description,Currency,Amount,Exchange rate,Original currency,Original amount,Conversion fee\n`
);
parse(await readInput())
  .querySelectorAll(`[data-tag-name="ing-ow-expandable-item"]`)
  .map(elementToEntry)
  .map(entryToCsvLine)
  .map(writeOut);
