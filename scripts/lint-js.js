const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const CHECK_DIRS = ['src', 'test', 'models'];
const CHECK_FILES = ['server.js', 'jest.config.js'];

function collectJavaScriptFiles(entryPath, files = []) {
    if (!fs.existsSync(entryPath)) {
        return files;
    }

    const stat = fs.statSync(entryPath);

    if (stat.isDirectory()) {
        for (const child of fs.readdirSync(entryPath).sort()) {
            collectJavaScriptFiles(path.join(entryPath, child), files);
        }

        return files;
    }

    if (entryPath.endsWith('.js')) {
        files.push(entryPath);
    }

    return files;
}

const files = [
    ...CHECK_FILES.map(file => path.join(ROOT_DIR, file)),
    ...CHECK_DIRS.flatMap(dir => collectJavaScriptFiles(path.join(ROOT_DIR, dir)))
].filter(file => fs.existsSync(file));

let hasError = false;

for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], {
        encoding: 'utf8'
    });

    if (result.status !== 0) {
        hasError = true;
        process.stderr.write(result.stderr || result.stdout);
    }
}

if (hasError) {
    process.exit(1);
}

console.log(`Checked syntax for ${files.length} JavaScript files.`);
