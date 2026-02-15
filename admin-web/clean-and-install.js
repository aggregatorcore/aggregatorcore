#!/usr/bin/env node
/**
 * Delete node_modules and package-lock.json, then npm install.
 * Run: node clean-and-install.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;

function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) rmDir(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(dir);
}

console.log('Removing node_modules...');
rmDir(path.join(root, 'node_modules'));
console.log('Removing package-lock.json...');
try { fs.unlinkSync(path.join(root, 'package-lock.json')); } catch (_) {}
console.log('Running npm install...');
execSync('npm install', { cwd: root, stdio: 'inherit' });
console.log('Done. Run: npm run dev');
