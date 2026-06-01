import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const staleTabsDir = path.join(projectRoot, 'app', 'it-cost', '(tabs)');
const staleScreenFiles = [
  'NPV.tsx',
  'ahp.tsx',
  'capital_expenditures.tsx',
  'criteria_importance.tsx',
  'electricity.tsx',
  'genetic_optimization.tsx',
  'it_infrastructure.tsx',
  'operating_expenses.tsx',
  'software.tsx',
  'technical_equipment.tsx',
];

let removed = 0;

for (const filename of staleScreenFiles) {
  const filePath = path.join(staleTabsDir, filename);

  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
    removed += 1;
    console.log(`🧹 Removed stale tab route: ${path.relative(projectRoot, filePath)}`);
  }
}

if (removed === 0) {
  console.log('✅ No stale tab routes found');
}
