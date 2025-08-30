const fs = require("fs");
const path = require("path");

const amitkkRoot = path.resolve(__dirname);
const outputPath = path.resolve(amitkkRoot, "componentMap.ts");

function getFilesFromDirectSubfolders(root) {
  const result = {};
  const subfolders = fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  for (const folder of subfolders) {
    const folderPath = path.join(root, folder.name);
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      // ✅ Only files directly inside the folder
      if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name)) {
        const name = path.basename(entry.name, path.extname(entry.name)).toLowerCase();
        const relativePath = `${folder.name}/${entry.name}`.replace(/\\/g, "/");
        const importPath = `./${relativePath.replace(/\.(tsx|ts)$/, "")}`;
        result[name] = importPath;
      }
    }
  }

  return result;
}

try {
  const files = getFilesFromDirectSubfolders(amitkkRoot);

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
