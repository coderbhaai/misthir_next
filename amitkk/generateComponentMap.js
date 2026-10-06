const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname);
const outputPath = path.join(root, "componentMaps.ts");

// Folders to completely ignore at the root level
const EXCLUDE_FOLDERS = ["components", "lib"];

function normalize(p) { return p.replace(/\\/g, "/"); }

function validateMap(map, mapName) {
  Object.entries(map).forEach(([key, value]) => {
    if (!key) console.error(`❌ Empty key in ${mapName}`);
    if (!value || typeof value.path !== "string" || !value.path.startsWith("./")) {
      console.error(`❌ Invalid import path for key: ${key} in ${mapName}`, value);
    }
  });
}

// Collect .ts/.tsx files immediately inside a given folder
function collectImmediateFiles(folderPath, baseRoot) {
  const result = {};
  if (!fs.existsSync(folderPath)) return result;

  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      const key = path.basename(entry.name, path.extname(entry.name));
      const rel = normalize(
        path.relative(baseRoot, path.join(folderPath, entry.name)).replace(/\.(ts|tsx)$/, "")
      );
      result[key] = { path: `./${rel}`, translate: true };
    }
  }
  return result;
}

// Recursively find all directories matching a specific name (e.g., "seller" or "user")
function findAllMatchingDirs(dir, targetName, results = []) {
  if (!fs.existsSync(dir)) return results;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);
      if (entry.name === targetName) {
        results.push(fullPath);
      }
      findAllMatchingDirs(fullPath, targetName, results);
    }
  }
  return results;
}

// 1. Admin / General top-level files (files directly inside root subfolders like basic, address, audit, etc.)
function getAdminFiles() {
  const result = {};
  const entries = fs.readdirSync(root, { withFileTypes: true });

  for (const entry of entries) {
    if (
      entry.isDirectory() && 
      !EXCLUDE_FOLDERS.includes(entry.name) && 
      entry.name !== "seller" && 
      entry.name !== "user"
    ) {
      const folderPath = path.join(root, entry.name);
      // Collect files directly inside this folder (e.g., amitkk/basic/*.tsx, amitkk/address/*.tsx)
      Object.assign(result, collectImmediateFiles(folderPath, root));
    }
  }
  return result;
}

// 2. Role maps for all "seller" folders found recursively anywhere in the project
function getRoleMap(roleName) {
  const result = {};
  const matchingDirs = findAllMatchingDirs(root, roleName);

  for (const dir of matchingDirs) {
    const files = collectImmediateFiles(dir, root);
    Object.assign(result, files);
  }

  return result;
}

// Optional: Internal specialized map if you still need portfolio/blog nested pages/regional structure
function collectInternalMap() {
  const componentMap = {};
  const INTERNAL_MODULES = ["portfolio", "blog"];
  const INTERNAL_SUBDIRS = ["pages", "regional"];

  for (const moduleName of INTERNAL_MODULES) {
    for (const sub of INTERNAL_SUBDIRS) {
      const dir = path.join(root, moduleName, sub);
      if (!fs.existsSync(dir)) continue;

      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;

        const slug = file.replace(/\.(ts|tsx)$/, "");
        const rel = normalize(
          path.relative(root, path.join(dir, file)).replace(/\.(ts|tsx)$/, "")
        );

        componentMap[slug] = { path: `./${rel}`, translate: true };
      }
    }
  }
  return componentMap;
}

function formatLoaderMap(name, map) {
  const entries = Object.entries(map)
    .map(([k, v]) => `  "${k}": { loader: () => import("${v.path}"), translate: ${v.translate} },`)
    .join("\n");

  return `export const ${name}: Record<string, { loader: () => Promise<any>; translate: boolean }> = {
${entries}
};`;
}

try {
  const admin = getAdminFiles();
  const seller = getRoleMap("seller");
  const user = getRoleMap("user");
  const internal = collectInternalMap();

  validateMap(admin, "adminComponentMap");
  validateMap(seller, "sellerComponentMap");
  validateMap(user, "userComponentMap");
  validateMap(internal, "internalComponentMap");

  const output = `// 🚨 AUTO-GENERATED FILE. DO NOT EDIT.

${formatLoaderMap("adminComponentMap", admin)}

${formatLoaderMap("sellerComponentMap", seller)}

${formatLoaderMap("userComponentMap", user)}

${formatLoaderMap("internalComponentMap", internal)}

export default {
  adminComponentMap,
  sellerComponentMap,
  userComponentMap,
  internalComponentMap,
};
`;

  fs.writeFileSync(outputPath, output, "utf-8");
  console.log("✅ componentMaps.ts successfully regenerated with all folder files.");
} catch (err) {
  console.error("❌ Generator failed:", err);
}