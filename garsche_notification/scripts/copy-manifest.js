const fs = require('fs');
const path = require('path');

// 環境変数からどのファイルを使うかを決定
const env = process.argv[2] || 'main';  // デフォルトは 'main'

// コピー元とコピー先のファイルパスを設定
const srcPath = path.join(__dirname, '..', 'manifests', `${env}.json`);
const destPath = path.join(__dirname, '..', 'manifest.json');

// ファイルをコピー（上書き）
fs.copyFileSync(srcPath, destPath);

console.log(`Copied ${env}.json to manifest.json`);
