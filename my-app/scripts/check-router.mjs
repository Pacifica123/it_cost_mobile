import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const tabsDir = path.join(root, 'app', 'it-cost', '(tabs)');
const allowedTabFiles = new Set(['_layout.tsx', 'menu.tsx', 'export.tsx']);

const files = fs.existsSync(tabsDir)
  ? fs.readdirSync(tabsDir).filter((name) => /\.(tsx?|jsx?)$/.test(name))
  : [];

const unexpected = files.filter((name) => !allowedTabFiles.has(name));

if (unexpected.length) {
  console.error('❌ В app/it-cost/(tabs) найдены лишние файлы, которые Expo Router может показать как вкладки:');
  for (const name of unexpected) console.error(`- ${name}`);
  console.error('Переместите расчётные экраны в app/it-cost/ или запустите npm run cleanup:stale-tabs.');
  process.exit(1);
}

console.log('✅ Router structure ok: bottom tabs contain only menu/export');
