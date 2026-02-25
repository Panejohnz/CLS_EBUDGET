const fs = require('fs');
const path = require('path');

const foldersToClean = [
  'dist',
  '.angular',
  'node_modules/.cache'
];

const filesToClean = [
  '.angular-cli.json'
];

console.log('🧹 กำลังเคลียร์ cache และไฟล์ที่ไม่จำเป็น...\n');

let totalSize = 0;

function getFolderSize(folderPath) {
  let size = 0;
  try {
    if (fs.existsSync(folderPath)) {
      const stats = fs.statSync(folderPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(folderPath);
        files.forEach(file => {
          const filePath = path.join(folderPath, file);
          try {
            const fileStats = fs.statSync(filePath);
            if (fileStats.isDirectory()) {
              size += getFolderSize(filePath);
            } else {
              size += fileStats.size;
            }
          } catch (err) {
            // Skip files that can't be accessed
          }
        });
      } else {
        size = stats.size;
      }
    }
  } catch (err) {
    // Skip folders that can't be accessed
  }
  return size;
}

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    const size = getFolderSize(folderPath);
    fs.readdirSync(folderPath).forEach(file => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
    return size;
  }
  return 0;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Clean folders
foldersToClean.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (fs.existsSync(folderPath)) {
    console.log(`📁 กำลังลบ: ${folder}`);
    const size = deleteFolderRecursive(folderPath);
    totalSize += size;
    console.log(`   ✅ ลบเสร็จแล้ว (${formatBytes(size)})\n`);
  } else {
    console.log(`📁 ${folder} - ไม่พบโฟลเดอร์\n`);
  }
});

// Clean files
filesToClean.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`📄 กำลังลบ: ${file}`);
    const stats = fs.statSync(filePath);
    fs.unlinkSync(filePath);
    totalSize += stats.size;
    console.log(`   ✅ ลบเสร็จแล้ว (${formatBytes(stats.size)})\n`);
  }
});

console.log(`\n✨ เคลียร์เสร็จสิ้น! ประหยัดพื้นที่: ${formatBytes(totalSize)}\n`);
console.log('💡 คำแนะนำ:');
console.log('   - ใช้ "npm install" เพื่อติดตั้ง dependencies ใหม่');
console.log('   - ใช้ "npm run build" เพื่อ build โปรเจคใหม่\n');

