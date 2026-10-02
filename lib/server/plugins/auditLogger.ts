import mongoose, { Schema, Document, Query } from "mongoose";
import AuditLog from "lib/models/basic/AuditLog";
import { getUserIdFromToken } from "../tokenUtils";
import { getRequestContext } from "../requestContext";

export function auditLoggerPlugin(schema: Schema) {
  const IGNORED_FIELDS = ["createdAt", "updatedAt", "meta_id", "media_id"];

  const isSameValue = (a: any, b: any): boolean => {
    if (a == null && b == null) return true;
    if (a instanceof mongoose.Types.ObjectId) a = a.toString();
    if (b instanceof mongoose.Types.ObjectId) b = b.toString();
    return String(a) === String(b);
  };

  const resolveUserId = async (req: any): Promise<string | null> => {
    try {
      if (!req) return null;
      if (req.user_id) return req.user_id;
      return await getUserIdFromToken(req);
    } catch {
      return null;
    }
  };

  const updateHook = async function (
    this: Query<any, any>,
    next: Function
  ) {
    try {
      const context = getRequestContext();
      const req = context?.req || null;
      const user_id = context?.user_id ?? (req ? await resolveUserId(req) : null);

      const model = this.model; // ✅ NO Model<> CAST
      const modelName = model.modelName;

      const query = this.getQuery();
      const update = this.getUpdate() || {};
      const found = (await model.findOne(query).lean()) as Record<string, any> | null;
      if (!found) return next();

      const changes: any[] = [];
      const rawUpdate = this.getUpdate() ?? {};
      const updateObj = rawUpdate as Record<string, any>;
      const operators = ["$set", "$unset", "$inc", "$push", "$pull"];

      for (const op of operators) {
        const opValue = updateObj[op];

        if (opValue && typeof opValue === "object") {
          for (const [field, newValue] of Object.entries(opValue)) {
            if (IGNORED_FIELDS.includes(field)) continue;

            const oldValue = (found as any)[field];
            if (!isSameValue(oldValue, newValue)) {
              changes.push({
                field_name: field,
                old_value: oldValue,
                new_value: newValue,
              });
            }
          }
        }
      }

      for (const [field, newValue] of Object.entries(update)) {
        if (field.startsWith("$") || IGNORED_FIELDS.includes(field)) continue;
        const oldValue = (found as any)[field];
        if (!isSameValue(oldValue, newValue)) {
          changes.push({
            field_name: field,
            old_value: oldValue,
            new_value: newValue,
          });
        }
      }

      if (changes.length) {
        await AuditLog.create({
          module: modelName,
          module_id: found._id,
          user_id,
          changes,
        });
      }

      next();
    } catch (err) {
      console.error("[AUDIT] Error logging update:", err);
      next();
    }
  };

  schema.post("save", async function (doc: Document) {
    try {
      const context = getRequestContext();
      const req = context?.req || null;
      const user_id = context?.user_id ?? (req ? await resolveUserId(req) : null);

      const modelName =
        (doc.constructor as { modelName?: string })?.modelName ?? "UnknownModel";

      await AuditLog.create({
        module: modelName,
        module_id: doc._id,
        user_id,
        changes: [
          { field_name: "created_or_updated", old_value: null, new_value: doc },
        ],
      });
    } catch {}
  });

  schema.pre("findOneAndUpdate", updateHook);
  schema.pre("updateOne", updateHook);
  schema.pre("updateMany", updateHook);
}
