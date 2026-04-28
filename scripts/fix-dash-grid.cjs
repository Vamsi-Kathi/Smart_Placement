const fs = require('fs');
const file = 'src/components/Student/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');
const target = "      <div className=\"dash-grid-top\" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', margin: '1rem 0 2rem' }}>";
const replacement = "      <div className=\"dash-grid-actions\" style={{ display: 'grid', gap: '1.5rem', margin: '1rem 0 2rem' }}>";
const idx = content.indexOf(target);
if (idx === -1) {
  console.log('Target string not found!');
  process.exit(1);
}
const count = content.split(target).length - 1;
console.log('Found', count, 'matches');
if (count === 1) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content);
  console.log('Replacement done successfully.');
} else {
  console.log('Multiple matches, doing single replacement at first occurrence');
  content = content.substring(0, idx) + replacement + content.substring(idx + target.length);
  fs.writeFileSync(file, content);
  console.log('Replacement done at first occurrence.');
}
