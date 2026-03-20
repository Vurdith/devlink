const fs = require('fs');
const path = require('path');

const dirsToChange = ['monitoring', 'security', 'supabase', 'events'];
const filesToChange = ['email', 'cache', 'rate-limit', 'storage'];

const changeMap = {};
for (const dir of dirsToChange) {
  changeMap[`src/lib/${dir}`] = `src/server/${dir}`;
}
for (const file of filesToChange) {
  changeMap[`src/lib/${file}`] = `src/server/${file}`;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [oldImport, newImport] of Object.entries(changeMap)) {
    const regex = new RegExp(oldImport, 'g');
    
    if (regex.test(content)) {
      content = content.replace(regex, newImport);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
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

walk(path.join(process.cwd(), 'scripts'));
