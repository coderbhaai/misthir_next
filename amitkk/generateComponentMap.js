const fs = require("fs");
const path = require("path");

const amitkkRoot = path.resolve(__dirname, ".");
const outputPath = path.resolve(amitkkRoot, "componentMap.ts");

function getFiles(dir, prefix = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = {};

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      Object.assign(result, getFiles(fullPath, path.join(prefix, entry.name)));
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      const name = path.basename(entry.name, path.extname(entry.name)).toLowerCase();
      
      const relativePath = fullPath.replace(amitkkRoot + path.sep, "");
      const normalizedPath = relativePath.replace(/\\/g, '/');
      
      // REMOVE FILE EXTENSION - FIXES THE ERROR
      const importPath = `./${normalizedPath.replace(/\.(tsx|ts)$/, '')}`;
      
      result[name] = importPath;
    }
  }

  return result;
}

try {
  const files = getFiles(amitkkRoot);

  const mapEntries = Object.entries(files)
    .map(([key, importPath]) => `  "${key}": () => import("${importPath}"),`)
    .join("\n");

  const output = `// AUTO-GENERATED FILE. DO NOT EDIT.
const componentMap: Record<string, () => Promise<any>> = {
${mapEntries}
};

export default componentMap;
`;

  fs.writeFileSync(outputPath, output);
  console.log("✅ componentMap.ts generated at:", outputPath);

} catch (error) {
  console.error("Error generating component map:", error);
}