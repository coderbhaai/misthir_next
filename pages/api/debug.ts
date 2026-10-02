import fs from "fs";
import path from "path";

const DEBUG_FILE = path.join( process.cwd(), "logs", "debug.log" );

export function clearDebugFile() {
  try {
    fs.mkdirSync(path.dirname(DEBUG_FILE), { recursive: true });

    fs.writeFileSync( DEBUG_FILE, `\n========== resolve_route START ${new Date().toISOString()} ==========\n\n`, "utf8" );
  } catch (error) {
    console.error("❌ Failed to clear resolve_route debug file:", error);
  }
}

export function debug(label: string, data?: any) {
  try {
    const output = data === undefined
      ? label
      : `${label}\n${JSON.stringify(
          data,
          (key, value) => {
            if (key === "buffer") return "[Buffer]";

            if (
              value &&
              typeof value === "object" &&
              typeof value.toString === "function"
            ) {
              if (
                value._bsontype === "ObjectID" ||
                value._bsontype === "ObjectId"
              ) {
                return value.toString();
              }
            }

            return value;
          },
          2
        )}`;

    fs.appendFileSync( DEBUG_FILE, `${output}\n\n`, "utf8" );
  } catch (error) {
    console.error("❌ Failed to write resolve_route debug:", error);
  }
}