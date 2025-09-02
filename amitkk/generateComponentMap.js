const fs = require("fs");
const path = require("path");

const amitkkRoot = path.resolve(__dirname);
const outputPath = path.resolve(amitkkRoot, "componentMaps.ts");

// folder configs
const includeFolders = {
  admin: [], // handled by default rule (direct subfolders)
  seller: ["product/seller"],
  user: ["product/user"],
};

function collectFiles(folderPath, baseRoot) {
  const result = {};
  if (!fs.existsSync(folderPath)) return result;

  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name)) {
      const name = path.basename(entry.name, path.extname(entry.name)).toLowerCase();
      const relativePath = path
        .relative(baseRoot, path.join(folderPath, entry.name))
        .replace(/\\/g, "/");
      const importPath = `./${relativePath.replace(/\.(tsx|ts)$/, "")}`;
      result[name] = importPath;
    }
  }
  return result;
}

function getAdminFiles(root) {
  const result = {};
  const subfolders = fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  for (const folder of subfolders) {
    const folderPath = path.join(root, folder.name);
    Object.assign(result, collectFiles(folderPath, root));
  }

  return result;
}

function getFilesFromFolders(root, folders) {
  const result = {};
  for (const folder of folders) {
    const specialPath = path.join(root, folder);
    Object.assign(result, collectFiles(specialPath, root));
  }
  return result;
}

function formatMap(name, files) {
  const entries = Object.entries(files)
    .map(([key, importPath]) => `  "${key}": () => import("${importPath}"),`)
    .join("\n");

  return `export const ${name}: Record<string, () => Promise<any>> = {
${entries}
};\n`;
}

try {
  const adminFiles = getAdminFiles(amitkkRoot);
  const sellerFiles = getFilesFromFolders(amitkkRoot, includeFolders.seller);
  const userFiles = getFilesFromFolders(amitkkRoot, includeFolders.user);

  const output = `// AUTO-GENERATED FILE. DO NOT EDIT.

${formatMap("adminComponentMap", adminFiles)}
${formatMap("sellerComponentMap", sellerFiles)}
${formatMap("userComponentMap", userFiles)}

export default {
  adminComponentMap,
  sellerComponentMap,
  userComponentMap,
};
`;

  fs.writeFileSync(outputPath, output);
  console.log("✅ componentMaps.ts generated at:", outputPath);
} catch (error) {
  console.error("❌ Error generating component maps:", error);
}
