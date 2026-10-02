process.env.ESLINT_USE_FLAT_CONFIG = "false";
const fs = require("fs");
const path = require("path");
const madge = require("madge");
const { LegacyESLint: ESLint } = require("eslint/use-at-your-own-risk");
const ts = require("typescript");

/**
 * ==========================================
 * CONFIG
 * ==========================================
 */

const CONFIG = {
  targets: ["pages", "app", "src", "components", "contexts", "hooks", "lib", "amitkk"],
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  ignore: ["node_modules", ".next", "dist", "build", "coverage", "out", ".turbo", ".git"],
  alwaysInclude: ["pages/_app.tsx", "app/layout.tsx", "contexts/Providers.tsx"],
  skipTraversal: [".next"],
  bannedImports: ["@mui/", "@emotion/"],
  shadcnPatterns: ["@/components/ui/", "@amitkk/components/ui/", "components/ui/"],
};

const AUDIT_DIR = path.join(__dirname, "audit");
if (!fs.existsSync(AUDIT_DIR)) {
  fs.mkdirSync(AUDIT_DIR);
}

function normalizePath(filePath = "") {
  return filePath.replace(/\\/g, "/");
}

function readFile(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function hasValidExtension(file) {
  return CONFIG.extensions.includes(path.extname(file));
}

function isIgnored(file) {
  const normalizedFile = normalizePath(file);
  return CONFIG.ignore.some((ignorePath) => {
    const normalizedIgnore = normalizePath(ignorePath);
    return normalizedFile.includes(normalizedIgnore);
  });
}

function shouldSkipTraversal(file) {
  const normalizedFile = normalizePath(file);
  return CONFIG.skipTraversal.some((skipPath) => normalizedFile.includes(normalizePath(skipPath)));
}

function writeFile(fileName, data = []) {
  const uniqueData = [...new Set(data)].filter(Boolean).sort();
  fs.writeFileSync(path.join(AUDIT_DIR, fileName), uniqueData.join("\n"), "utf8");
  console.log(`✔ Generated ${fileName}`);
}

function collectFiles(targetPath) {
  const files = [];
  if (!fs.existsSync(targetPath)) {
    return files;
  }

  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (hasValidExtension(targetPath) && !isIgnored(targetPath)) {
      files.push(normalizePath(targetPath));
    }
    return files;
  }

  const items = fs.readdirSync(targetPath);
  items.forEach((item) => {
    const fullPath = path.join(targetPath, item);
    if (isIgnored(fullPath)) {
      return;
    }

    const childStat = fs.statSync(fullPath);
    if (childStat.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (childStat.isFile() && hasValidExtension(fullPath)) {
      files.push(normalizePath(fullPath));
    }
  });

  return files;
}

async function buildGraph() {
  return madge(".", {
    fileExtensions: ["ts", "tsx", "js", "jsx"],
    tsConfig: "./tsconfig.json",
    excludeRegExp: CONFIG.ignore.map((i) => `^${normalizePath(i)}`),
  });
}

const globalReachableFiles = new Set();
const globalBannedFiles = new Set();
const globalBannedChains = new Set();
const globalShadcnFiles = new Set();
const globalCircular = new Set();

function getReachableFiles(graphObj, entry) {
  const visited = new Set();

  function scan(file) {
    const normalizedFile = normalizePath(file);
    if (isIgnored(normalizedFile)) {
      return;
    }
    if (visited.has(normalizedFile)) {
      return;
    }
    visited.add(normalizedFile);
    globalReachableFiles.add(normalizedFile);

    if (shouldSkipTraversal(normalizedFile)) {
      return;
    }

    const imports = graphObj[file] || [];
    imports.forEach(scan);
  }

  scan(entry);
  CONFIG.alwaysInclude.forEach(scan);
  return [...visited];
}

function detectBannedImports(file) {
  const content = readFile(file);
  return CONFIG.bannedImports.some((item) => content.includes(item));
}

function detectShadcn(file) {
  const content = readFile(file);
  return CONFIG.shadcnPatterns.some((item) => content.includes(item));
}

function getBannedChains(graphObj, entry) {
  const chains = [];

  function scan(file, chain = [], visited = new Set()) {
    const normalizedFile = normalizePath(file);

    if (visited.has(normalizedFile)) {
      return;
    }
    if (isIgnored(normalizedFile)) {
      return;
    }

    visited.add(normalizedFile);
    const imports = graphObj[file] || [];
    const content = readFile(normalizedFile);
    const hasBannedImport = CONFIG.bannedImports.some((item) => content.includes(item));

    if (hasBannedImport) {
      chains.push([...chain, normalizedFile].join(" -> "));
    }

    if (shouldSkipTraversal(normalizedFile)) {
      return;
    }
    imports.forEach((imp) => {
      scan(imp, [...chain, normalizedFile], visited);
    });
  }

  scan(entry);
  CONFIG.alwaysInclude.forEach((file) => {
    scan(file);
  });
  return [...new Set(chains)];
}

async function runEslint(files) {
  try {
    const validLintableFiles = files.filter((file) => {
      const normalized = normalizePath(file);
      return (
        /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(normalized) &&
        !normalized.endsWith(".d.ts") &&
        !normalized.includes("/node_modules/")
      );
    });

    if (validLintableFiles.length === 0) {
      return [];
    }

    const eslint = new ESLint({ fix: false });
    const results = await eslint.lintFiles(validLintableFiles);
    const issues = new Set();

    results.forEach((result) => {
      result.messages.forEach((msg) => {
        issues.add(
          [
            normalizePath(result.filePath),
            `[${msg.ruleId || "parser-error"}]`,
            `Line ${msg.line || 0}`,
            msg.message,
          ].join(" | ")
        );
      });
    });

    return [...issues];
  } catch (error) {
    console.error("ESLint execution error:", error.message);
    return [`ESLint Execution Failure | [error] | Line 0 | ${error.message}`];
  }
}

function getDiagnostics(files) {
  const configPath = ts.findConfigFile("./", ts.sys.fileExists, "tsconfig.json");
  if (!configPath) {
    throw new Error("Could not find tsconfig.json");
  }

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath)
  );
  const program = ts.createProgram(files, {
    ...parsedConfig.options,
    noEmit: true,
    skipLibCheck: true,
  });
  
  return [
    ...program.getSemanticDiagnostics(),
    ...program.getSyntacticDiagnostics(),
  ];
}

function getTypeScriptErrors(diagnostics) {
  const errors = new Set();
  diagnostics.forEach((d) => {
    // Skip missing module diagnostics here if we want them separate, or keep all. Let's keep general TS errors here.
    const file = normalizePath(d.file?.fileName || "unknown");
    const line = d.file?.getLineAndCharacterOfPosition(d.start || 0).line + 1;
    const message = ts.flattenDiagnosticMessageText(d.messageText, " ");
    errors.add([file, `Line ${line}`, message].join(" | "));
  });
  return [...errors];
}

function getMissingModules(diagnostics) {
  const missing = new Set();
  diagnostics.forEach((d) => {
    const message = ts.flattenDiagnosticMessageText(d.messageText, " ");
    // TypeScript code 2307 is "Cannot find module..."
    if (d.code === 2307 || message.includes("Cannot find module")) {
      const file = normalizePath(d.file?.fileName || "unknown");
      const line = d.file?.getLineAndCharacterOfPosition(d.start || 0).line + 1;
      missing.add([file, `Line ${line}`, message].join(" | "));
    }
  });
  return [...missing];
}

function getNextJsIssues(files) {
  const issues = new Set();

  files.forEach((file) => {
    const content = readFile(file);
    const lines = content.split("\n");

    const hasClientHook =
      content.includes("useState(") ||
      content.includes("useEffect(") ||
      content.includes("useRef(") ||
      content.includes("useContext(") ||
      content.includes("useReducer(");

    const hasClientDirective =
      content.includes('"use client"') || content.includes("'use client'");

    if (file.endsWith(".tsx") && hasClientHook && !hasClientDirective) {
      issues.add(`${file}:1:1 - Missing 'use client' directive`);
    }

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      if (lineText.includes("<img ")) {
        issues.add(`${file}:${lineNum}:1 - Use next/image instead of raw <img> tag`);
      }
      if (lineText.includes("<a href=")) {
        issues.add(`${file}:${lineNum}:1 - Use next/link instead of raw <a> tag`);
      }
      if (
        (/<img\s/.test(lineText) || /<Image\s/.test(lineText)) &&
        !lineText.includes("alt=")
      ) {
        issues.add(`${file}:${lineNum}:1 - Image missing 'alt' attribute`);
      }
      if (lineText.includes("console.log(")) {
        issues.add(`${file}:${lineNum}:1 - Remove console.log statement`);
      }
      if (lineText.includes(": any") || lineText.includes("<any>")) {
        issues.add(`${file}:${lineNum}:1 - Avoid using explicit 'any' type`);
      }
      if (lineText.includes("style={{")) {
        issues.add(`${file}:${lineNum}:1 - Avoid inline styles; use Tailwind CSS`);
      }
      if (/\bvar\s+\w+/.test(lineText)) {
        issues.add(`${file}:${lineNum}:1 - Use 'let' or 'const' instead of 'var'`);
      }
      if (/http:\/\/[^\s"']+/.test(lineText) && !lineText.includes("localhost")) {
        issues.add(`${file}:${lineNum}:1 - Insecure HTTP link detected (use HTTPS)`);
      }
      if (/(api_key|secret_key|password|jwt_secret)\s*[:=]\s*["'][^"']+["']/i.test(lineText)) {
        issues.add(`${file}:${lineNum}:1 - Potential hardcoded secret or API key detected`);
      }
    });
  });

  return [...issues];
}

async function getCircularDependencies(graph) {
  const circular = graph.circular();
  return circular.map((c) => c.join(" -> "));
}

function writeMarkdownReport(summaryData) {
  const mdContent = `# 📊 Project Audit Report

**Generated Date:** ${new Date().toLocaleString()}

## 📈 Overview Summary

| Metric | Count | Status |
| :--- | :---: | :---: |
| **Total Reachable Files** | \`${summaryData.totalFiles}\` | 📁 |
| **Shadcn UI Files** | \`{summaryData.shadcnFiles}\` | 🧩 |
| **Missing Modules / Imports** | \`${summaryData.missingModulesCount}\` | ${summaryData.missingModulesCount > 0 ? "❌" : "✅"} |
| **Banned Import Files** | \`${summaryData.bannedFiles}\` | ${summaryData.bannedFiles > 0 ? "⚠️" : "✅"} |
| **Banned Import Chains** | \`${summaryData.bannedChains}\` | ${summaryData.bannedChains > 0 ? "⚠️" : "✅"} |
| **ESLint Errors** | \`${summaryData.eslintCount}\` | ${summaryData.eslintCount > 0 ? "❌" : "✅"} |
| **TypeScript Errors** | \`${summaryData.tsCount}\` | ${summaryData.tsCount > 0 ? "❌" : "✅"} |
| **Next.js & Code Issues** | \`${summaryData.nextCount}\` | ${summaryData.nextCount > 0 ? "⚠️" : "✅"} |
| **Circular Dependencies** | \`${summaryData.circularCount}\` | ${summaryData.circularCount > 0 ? "❌" : "✅"} |

---

## ❌ Missing Modules & Unresolved Imports
${
  summaryData.missingModulesList.length === 0
    ? "_No missing modules detected._"
    : summaryData.missingModulesList.map((m) => `- \`${m}\``).join("\n")
}

---

## 🚨 Critical Code & Next.js Issues
${
  summaryData.nextIssues.length === 0
    ? "_No Next.js or code quality issues found._"
    : summaryData.nextIssues.slice(0, 50).map((issue) => `- \`${issue}\``).join("\n")
}

---

## 🔄 Circular Dependencies
${
  summaryData.circular.length === 0
    ? "_No circular dependencies detected._"
    : summaryData.circular.map((c) => `- \`${c}\``).join("\n")
}
`;

  fs.writeFileSync(path.join(AUDIT_DIR, "audit-report.md"), mdContent, "utf8");
  console.log("✔ Generated audit-report.md");
}

async function run() {
  console.log("\n🔍 STARTING PROJECT AUDIT\n");
  const targetFiles = [];

  CONFIG.targets.forEach((target) => {
    targetFiles.push(...collectFiles(target));
  });

  const uniqueFiles = [...new Set(targetFiles.filter((file) => !isIgnored(file)))];
  console.log(`✔ Found ${uniqueFiles.length} initial targets`);

  const graph = await buildGraph();
  const graphObj = graph.obj();
  const circular = await getCircularDependencies(graph);
  circular.forEach((i) => globalCircular.add(i));

  for (const file of uniqueFiles) {
    const reachableFiles = getReachableFiles(graphObj, file);
    const bannedFiles = reachableFiles.filter(detectBannedImports);
    bannedFiles.forEach((i) => globalBannedFiles.add(i));
    const shadcnFiles = reachableFiles.filter(detectShadcn);
    shadcnFiles.forEach((i) => globalShadcnFiles.add(i));
    const bannedChains = getBannedChains(graphObj, file);
    bannedChains.forEach((i) => globalBannedChains.add(i));
  }

  const allFiles = [...globalReachableFiles];
  console.log(`✔ Total Reachable Files: ${allFiles.length}`);

  const diagnostics = getDiagnostics(allFiles);
  const eslintIssues = await runEslint(allFiles);
  const tsErrors = getTypeScriptErrors(diagnostics);
  const missingModules = getMissingModules(diagnostics);
  const nextIssues = getNextJsIssues(allFiles);

  writeFile("reachable-files.txt", allFiles);
  writeFile("banned-import-files.txt", [...globalBannedFiles]);
  writeFile("banned-import-chains.txt", [...globalBannedChains]);
  writeFile("shadcn-files.txt", [...globalShadcnFiles]);
  writeFile("missing-modules.txt", missingModules);
  writeFile("eslint-errors.txt", eslintIssues);
  writeFile("typescript-errors.txt", tsErrors);
  writeFile("nextjs-issues.txt", nextIssues);
  writeFile("circular-dependencies.txt", [...globalCircular]);

  const summary = [
    `Total Reachable Files: ${allFiles.length}`,
    `Shadcn Files: ${globalShadcnFiles.size}`,
    `Missing Modules: ${missingModules.length}`,
    `Banned Import Files: ${globalBannedFiles.size}`,
    `Banned Import Chains: ${globalBannedChains.size}`,
    `ESLint Errors: ${eslintIssues.length}`,
    `TypeScript Errors: ${tsErrors.length}`,
    `Next.js & Code Issues: ${nextIssues.length}`,
    `Circular Dependencies: ${globalCircular.size}`,
  ];

  writeFile("summary.txt", summary);

  writeMarkdownReport({
    totalFiles: allFiles.length,
    shadcnFiles: globalShadcnFiles.size,
    missingModulesCount: missingModules.length,
    bannedFiles: globalBannedFiles.size,
    bannedChains: globalBannedChains.size,
    eslintCount: eslintIssues.length,
    tsCount: tsErrors.length,
    nextCount: nextIssues.length,
    circularCount: globalCircular.size,
    missingModulesList: missingModules,
    nextIssues,
    circular: [...globalCircular],
    bannedChainsList: [...globalBannedChains],
  });

  console.log("\n🎉 PROJECT AUDIT COMPLETE\n");
}

run();