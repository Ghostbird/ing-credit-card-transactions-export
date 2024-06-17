# ING Credit Card transactions export

The Dutch ING bank offers downloads of account transactions in the widely supported CSV format, for all accounts. All accounts, except credit cards, that is. For credit cards you can only get a paper statement by mail within 5 working days. The mind boggles.

Luckily they've got a web page where you can view all transactions in a single page, and you've got this script.

## Requirements

`node` and `npx` binaries in your path. I've used node 22.3 but other versions may work too.

## Getting the data

1. Navigate to your My ING credit card page.
2. Click the "Load previous period" button, until you see all transactions you want to export.
3. Save the web page as HTML.
    Note: That feature is bugged and doesn't work in my Firefox 115.11.0esr, in Chromium it works.
4. Run the script using `tsx`. Data can be piped in and out, or file names can be provided. If only one file name is provided, that file name is treated as input, and the output is written to stdout:
    ```
    npx tsx main.ts INFILE OUTFILE
    npx tsx main.ts INFILE > OUTFILE
    npx tsx main.tx < INFILE > OUTFILE
    ```
## Data structure

Note that there are two types of credit card transactions. Those in your native currency, and those in a foreign currency. The former ones only fill the first few columns of the CSV. The latter contains information about the target currency and amount, exchange rate and conversion fees.

## Limitations

The script is currently not set-up to handle credit card payments in currencies whose minor unit is not a hundredth. You'll run into issues when you've paid in e.g. Japanese Yen or Icelandic Króna. Check https://en.wikipedia.org/wiki/ISO_4217#List_of_ISO_4217_currency_codes to see which currencies apply.

To facilitate that, add a currency-code to decimal places lookup function, call it with the original currency code of the current transaction and pass the result as a second argument to `csvStringAmount`. Then if you've got that working, please make a PR.
