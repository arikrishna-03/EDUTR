const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Frontend for Vercel deployment...');
try {
  execSync('npm --prefix frontend install', { stdio: 'inherit' });
  execSync('npm --prefix frontend run build', { stdio: 'inherit' });

  const srcDist = path.join(__dirname, 'frontend', 'dist');
  const targetDist = path.join(__dirname, 'dist');

  if (fs.existsSync(srcDist)) {
    if (fs.existsSync(targetDist)) {
      fs.rmSync(targetDist, { recursive: true, force: true });
    }
    fs.cpSync(srcDist, targetDist, { recursive: true });
    console.log('Successfully copied frontend/dist to root dist/');
  } else {
    console.error('Error: frontend/dist directory was not created by build step.');
    process.exit(1);
  }
} catch (error) {
  console.error('Vercel build script failed:', error);
  process.exit(1);
}
