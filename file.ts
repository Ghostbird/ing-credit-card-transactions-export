import { open } from 'node:fs/promises';

export const writeOut = await (
  async (output: {
    write: (chunk: string) => void;
  }): Promise<(line: string) => void> =>
  (line: string) =>
    output.write(line)
)(
  process.argv[3]
    ? (await open(process.argv[3], 'w')).createWriteStream()
    : process.stdout
);

export async function readInput(): Promise<string> {
  const chunks = [];
  for await (const chunk of process.argv[2]
    ? (await open(process.argv[2])).createReadStream()
    : process.stdin)
    chunks.push(chunk);
  return chunks.join('');
}
