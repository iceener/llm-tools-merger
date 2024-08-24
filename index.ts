import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const isTextFile = (filename: string): boolean => {
  const binaryExtensions: string[] = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar', '.7z', '.tar', '.gz', 
    '.exe', '.dll', '.so', '.dylib', '.class', '.jar', '.war', '.ear', '.bin', '.dat', '.db', '.sqlite', 
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.ico', '.svg', '.mp3', '.mp4', '.avi', '.mov', 
    '.wmv', '.flv',
    '.ttf', '.otf', '.woff', '.woff2', '.eot', '.fon', '.fnt', '.pfb', '.pfm', '.afm', '.bdf'
  ];
  return !binaryExtensions.includes(path.extname(filename).toLowerCase()) && 
         filename !== '.DS_Store';
};

const loadIgnorePatterns = async (dir: string): Promise<string[]> => {
  try {
    const ignoreFile = await fs.readFile(path.join(dir, '.mergeignore'), 'utf8');
    return ignoreFile.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  } catch (error) {
    return [];
  }
};

const shouldIgnore = (filePath: string, ignorePatterns: string[]): boolean => {
  const relativePath = path.relative(process.cwd(), filePath);
  const ignoreDirs: string[] = [
    '.git', '.github', 'node_modules', 'vendor', 'bower_components',
    'packages', 'dist', 'build', 'target', 'out', 'output',
    'venv', 'env', '.venv', '.env', 'virtualenv',
    'jspm_packages', 'lib', 'libs', 'third-party', 'third_party',
    'externals', 'external', 'assets', 'static', 'public', 'resources'
  ];

  return ignorePatterns.some(pattern => {
    const regexPattern = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return regexPattern.test(relativePath);
  }) || 
  ignoreDirs.some(dir => filePath.includes(`${path.sep}${dir}${path.sep}`)) ||
  ignoreDirs.some(dir => filePath.endsWith(`${path.sep}${dir}`));
};

const mergeFiles = async (dir: string, ignorePatterns: string[], shouldLog: boolean): Promise<string> => {
  const files = await fs.readdir(dir, { withFileTypes: true });
  let content = '';

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (shouldIgnore(fullPath, ignorePatterns)) {
      if (shouldLog) console.log(`Ignoring: ${fullPath}`);
      continue;
    }

    if (file.isDirectory()) {
      content += await mergeFiles(fullPath, ignorePatterns, shouldLog);
    } else if (isTextFile(file.name)) {
      try {
        const fileContent = await fs.readFile(fullPath, 'utf8');
        content += `<file location="${dir}" name="${file.name}">\n${fileContent}\n</file>\n\n`;
        if (shouldLog) console.log(`Merged: ${fullPath}`);
      } catch (error) {
        if (shouldLog) console.warn(`Skipping file ${fullPath}: ${(error as Error).message}`);
      }
    }
  }

  return content;
};

const isPathSafe = (inputPath: string): boolean => {
  const normalizedPath = path.normalize(inputPath);
  const resolvedPath = path.resolve(normalizedPath);
  return resolvedPath.startsWith(process.cwd());
};

const main = async (): Promise<void> => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  
  let targetDir = currentDir;
  const pathArgIndex = process.argv.indexOf('--path');
  if (pathArgIndex !== -1 && pathArgIndex + 1 < process.argv.length) {
    const customPath = process.argv[pathArgIndex + 1];
    if (isPathSafe(customPath)) {
      targetDir = path.resolve(customPath);
    } else {
      console.error('Error: The provided path is not safe or is outside the current working directory.');
      process.exit(1);
    }
  }

  const outputFile = path.join(targetDir, 'merged_output.md');
  const ignorePatterns = await loadIgnorePatterns(targetDir);
  const shouldLog = process.argv.includes('--log');
  const mergedContent = await mergeFiles(targetDir, ignorePatterns, shouldLog);
  await fs.writeFile(outputFile, mergedContent);
  if (shouldLog) console.log(`Merged files into ${outputFile}`);
};

main().catch(error => {
  console.error('An error occurred:', error);
  process.exit(1);
});