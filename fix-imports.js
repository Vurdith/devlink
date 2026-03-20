const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dirsToChange = ['monitoring', 'security', 'supabase', 'events'];
const filesToChange = ['email', 'cache', 'rate-limit', 'storage'];

const changeMap = {};
for (const dir of dirsToChange) {
  changeMap[`@/lib/${dir}`] = `@/server/${dir}`;
}
for (const file of filesToChange) {
  changeMap[`@/lib/${file}`] = `@/server/${file}`;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [oldImport, newImport] of Object.entries(changeMap)) {
    // Regex to match imports. e.g. from "@/lib/monitoring/foo" or import("@/lib/monitoring/foo")
    // Also covers "@/lib/email" exact match
    const regex = new RegExp(`(['"])${oldImport}(/.*?)?(['"])`, 'g');
    
    if (regex.test(content)) {
      content = content.replace(regex, `$1${newImport}$2$3`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  }
}

walk(path.join(process.cwd(), 'src'));
processFile(path.join(process.cwd(), 'src/instrumentation.ts'));
