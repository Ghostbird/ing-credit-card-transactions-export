import { parse } from 'node-html-parser';
import {
  csvHeaderLine,
  elementToEntry,
  entryToCsvLine,
  statementSelector,
} from './ing';
import { readInput, writeOut } from './file';

parse(await readInput())
  .querySelectorAll(statementSelector)
  .map(elementToEntry)
  .map(entryToCsvLine)
  .toSpliced(0, 0, csvHeaderLine)
  .map(writeOut);
