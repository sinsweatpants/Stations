#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createHash } from 'crypto';

// تحليل الاعتماديات الثابتة
function analyzeStaticDependencies() {
  const dependencies = new Map();
  const dependents = new Map();
  
  function scanFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath);
    
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return;
    
    // استخراج الاستيرادات
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // تحويل المسارات النسبية إلى مسارات مطلقة
    const resolvedImports = imports.map(imp => {
      if (imp.startsWith('.')) {
        const resolved = path.resolve(path.dirname(filePath), imp);
        const ext = path.extname(resolved);
        if (!ext) {
          // جرب الإضافات الشائعة
          for (const ext of ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']) {
            if (fs.existsSync(resolved + ext)) {
              return resolved + ext;
            }
          }
        }
        return resolved;
      }
      // معالجة المسارات المطلقة
      if (imp.startsWith('@/')) {
        const resolved = path.resolve(imp.replace('@/', 'src/'));
        // جرب الإضافات الشائعة
        for (const ext of ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']) {
          if (fs.existsSync(resolved + ext)) {
            return resolved + ext;
          }
        }
        return resolved;
      }
      if (imp.startsWith('@shared/')) {
        const resolved = path.resolve(imp.replace('@shared/', 'shared/'));
        for (const ext of ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']) {
          if (fs.existsSync(resolved + ext)) {
            return resolved + ext;
          }
        }
        return resolved;
      }
      if (imp.startsWith('@server/')) {
        const resolved = path.resolve(imp.replace('@server/', 'server/'));
        for (const ext of ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx']) {
          if (fs.existsSync(resolved + ext)) {
            return resolved + ext;
          }
        }
        return resolved;
      }
      return imp;
    }).filter(imp => {
      if (!imp || imp.startsWith('node_modules')) return false;
      // تحقق من وجود الملف
      return fs.existsSync(imp) || fs.existsSync(imp + '.ts') || fs.existsSync(imp + '.tsx') || fs.existsSync(imp + '.js') || fs.existsSync(imp + '.jsx');
    });
    
    dependencies.set(filePath, resolvedImports);
    
    resolvedImports.forEach(imp => {
      if (!dependents.has(imp)) {
        dependents.set(imp, []);
      }
      dependents.get(imp).push(filePath);
    });
  }
  
  // مسح جميع الملفات
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        scanFile(fullPath);
      }
    }
  }
  
  // مسح الملفات في المجلد الجذر
  function scanRootFiles() {
    const items = fs.readdirSync('.');
    
    for (const item of items) {
      const fullPath = path.join('.', item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(item))) {
        scanFile(fullPath);
      }
    }
  }
  
  // مسح المجلدات الرئيسية
  ['src', 'server', 'shared'].forEach(dir => {
    if (fs.existsSync(dir)) {
      scanDirectory(dir);
    }
  });
  
  // مسح الملفات في المجلد الجذر
  scanRootFiles();
  
  return { dependencies, dependents };
}

// تحليل الملفات غير المستخدمة
function findUnusedFiles(dependencies, dependents) {
  const unused = [];
  const entryPoints = [
    'src/main.tsx',
    'src/App.tsx',
    'server/index.ts',
    'server/routes.ts'
  ];
  
  const visited = new Set();
  
  function markAsUsed(filePath) {
    if (visited.has(filePath)) return;
    
    // تحقق من وجود الملف في dependencies
    if (!dependencies.has(filePath)) {
      // إذا لم يكن في dependencies، تحقق من وجوده في الملفات
      const allFiles = Array.from(dependencies.keys());
      if (!allFiles.includes(filePath)) return;
    }
    
    visited.add(filePath);
    const deps = dependencies.get(filePath) || [];
    deps.forEach(dep => markAsUsed(dep));
  }
  
  // بدء من نقاط الدخول
  entryPoints.forEach(entry => {
    if (fs.existsSync(entry)) {
      // استخدام نفس تنسيق المسارات المستخدم في dependencies
      const normalizedPath = entry.replace(/\//g, '\\');
      markAsUsed(normalizedPath);
    }
  });
  
  // إضافة الملفات التي يتم استيرادها من نقاط الدخول
  const allFiles = Array.from(dependencies.keys());
  allFiles.forEach(file => {
    if (visited.has(file)) {
      const deps = dependencies.get(file) || [];
      deps.forEach(dep => {
        if (allFiles.includes(dep)) {
          markAsUsed(dep);
        }
      });
    }
  });
  
  // العثور على الملفات غير المستخدمة
  for (const [filePath] of dependencies) {
    if (!visited.has(filePath)) {
      const stat = fs.statSync(filePath);
      unused.push({
        path: filePath,
        size: stat.size,
        lastModified: stat.mtime,
        dependents: dependents.get(filePath) || []
      });
    }
  }
  
  return unused;
}

// تحليل التكرار
function findDuplicates() {
  const fileHashes = new Map();
  const duplicates = [];
  
  function scanFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const hash = createHash('md5').update(content).digest('hex');
    
    if (fileHashes.has(hash)) {
      duplicates.push({
        original: fileHashes.get(hash),
        duplicate: filePath,
        size: stat.size
      });
    } else {
      fileHashes.set(hash, filePath);
    }
  }
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        scanFile(fullPath);
      }
    }
  }
  
  ['src', 'server', 'shared'].forEach(dir => {
    if (fs.existsSync(dir)) {
      scanDirectory(dir);
    }
  });
  
  return duplicates;
}

// تحليل Git
function analyzeGitHistory() {
  const gitInfo = new Map();
  
  try {
    // الحصول على قائمة بجميع الملفات في Git
    const files = execSync('git ls-files', { encoding: 'utf8' }).trim().split('\n');
    
    for (const file of files) {
      if (!fs.existsSync(file)) continue;
      
      try {
        // آخر تعديل
        const lastCommit = execSync(`git log -1 --format="%H %ct" -- "${file}"`, { encoding: 'utf8' }).trim();
        const [hash, timestamp] = lastCommit.split(' ');
        
        // أول ظهور
        const firstCommit = execSync(`git log --follow --format="%H" -- "${file}" | tail -1`, { encoding: 'utf8' }).trim();
        
        gitInfo.set(file, {
          lastCommit: hash,
          lastCommitTime: parseInt(timestamp),
          firstCommit: firstCommit
        });
      } catch (e) {
        // تجاهل الملفات التي لا يمكن تتبعها
      }
    }
  } catch (e) {
    console.warn('Git analysis failed:', e.message);
  }
  
  return gitInfo;
}

// تنفيذ التحليل
function main() {
  console.log('تحليل الاعتماديات...');
  const { dependencies, dependents } = analyzeStaticDependencies();
  
  console.log('البحث عن الملفات غير المستخدمة...');
  const unused = findUnusedFiles(dependencies, dependents);
  
  console.log('البحث عن الملفات المكررة...');
  const duplicates = findDuplicates();
  
  console.log('تحليل تاريخ Git...');
  const gitInfo = analyzeGitHistory();
  
  // إنشاء التقرير
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: dependencies.size,
      unusedFiles: unused.length,
      duplicateFiles: duplicates.length,
      totalSize: unused.reduce((sum, file) => sum + file.size, 0)
    },
    unusedFiles: unused,
    duplicates: duplicates,
    dependencies: Object.fromEntries(dependencies),
    dependents: Object.fromEntries(dependents),
    gitInfo: Object.fromEntries(gitInfo)
  };
  
  fs.writeFileSync('cleanup/analysis_report.json', JSON.stringify(report, null, 2));
  console.log('تم حفظ التقرير في cleanup/analysis_report.json');
  
  // طباعة ملخص
  console.log('\n=== ملخص التحليل ===');
  console.log(`إجمالي الملفات: ${report.summary.totalFiles}`);
  console.log(`الملفات غير المستخدمة: ${report.summary.unusedFiles}`);
  console.log(`الملفات المكررة: ${report.summary.duplicateFiles}`);
  console.log(`إجمالي الحجم المحذوف: ${(report.summary.totalSize / 1024).toFixed(2)} KB`);
}

main();
