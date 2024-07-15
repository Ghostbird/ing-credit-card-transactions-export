import { parse } from "node-html-parser";
import { open } from "node:fs/promises";
import { decimalCount, decimalSeparator, elementToEntry, Entry } from "./ing";

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
