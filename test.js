import { readFile } from 'fs/promises';

(async () => {
  const file = await readFile('src/services/requestLaunchs.json', 'utf-8');
  console.log(JSON.parse(file));
})();

