import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Analyzing bundle size...\n');

// Build the project
console.log('Building project...');
execSync('npm run build', { stdio: 'inherit' });

// Get dist folder stats
const distPath = path.join(process.cwd(), 'dist');
const getDirectorySize = (dirPath) => {
  let totalSize = 0;
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  });
  
  return totalSize;
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const totalSize = getDirectorySize(distPath);
console.log(`\n📦 Total bundle size: ${formatBytes(totalSize)}`);

// Analyze individual files
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  console.log('\n📄 Asset breakdown:');
  const assets = fs.readdirSync(assetsPath);
  
  assets.forEach(asset => {
    const assetPath = path.join(assetsPath, asset);
    const stats = fs.statSync(assetPath);
    console.log(`  ${asset}: ${formatBytes(stats.size)}`);
  });
}

// Performance recommendations
console.log('\n💡 Performance Recommendations:');
if (totalSize > 2 * 1024 * 1024) { // 2MB
  console.log('  ⚠️  Bundle size is large. Consider:');
  console.log('     - Implementing code splitting');
  console.log('     - Using dynamic imports');
  console.log('     - Tree shaking unused code');
}

if (totalSize > 5 * 1024 * 1024) { // 5MB
  console.log('  🚨 Bundle size is very large. Immediate action needed!');
}

console.log('\n✅ Analysis complete!');