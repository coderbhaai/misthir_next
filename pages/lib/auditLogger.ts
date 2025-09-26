// lib/auditLogger.ts
import mongoose, { Schema, Document, Model, Query, CallbackWithoutResultAndOptionalError } from "mongoose";
import { AsyncLocalStorage } from "async_hooks";
import { AuditLog } from "lib/models/basic/AuditLog";

const reqStorage = new AsyncLocalStorage<any>();

export function withRequestContext<T>(req: any, fn: () => Promise<T>) {
  return reqStorage.run(req, fn);
}

export function getRequest(): any {
  return reqStorage.getStore();
}

function getUserIdFromToken(req: any): mongoose.Types.ObjectId | null {
  return req?.user?._id || null;
}

export function auditLoggerPlugin(schema: Schema) {
  console.log(`[AUDIT] Plugin attached to collection: ${schema?.options?.collection}`);

  // ------------------ SAVE HOOK ------------------
  schema.post("save", async function (doc: Document) {
    try {
      const req = getRequest();
      const userId = req ? getUserIdFromToken(req) : null;
      const modelName = (doc.constructor as unknown as Model<any>).modelName || "UnknownModel";

      console.log(`[AUDIT] save fired for ${modelName}`);

      await AuditLog.create({
        model_type: modelName,
        model_id: doc._id,
        user_id: userId,
        changes: [{ field_name: "created_or_updated", old_value: null, new_value: doc }],
      });

      console.log(`[AUDIT] Changes logged for ${modelName}`);
    } catch (err) {
      console.error("[AUDIT] Error logging save:", err);
    }
  });

  // ------------------ FINDONEANDUPDATE HOOK ------------------
  const updateHook = async function (
    this: Query<any, any>,
    next: CallbackWithoutResultAndOptionalError
  ) {
    try {
      const req = (this as any).getOptions()?.context?.req || getRequest();
      const userId = req ? getUserIdFromToken(req) : null;

      const update = this.getUpdate() || {};
      const updateObj = update as Record<string, any>; // ⚡ Cast for TS indexing

      const query = this.getQuery();
      const model = this.model as Model<any>;
      const modelName = (model as unknown as Model<any>).modelName || "UnknownModel";

      console.log(`[AUDIT] findOneAndUpdate fired for ${modelName}`, { query, update: updateObj });

      const docToUpdate = await model.findOne(query);
      if (!docToUpdate) {
        console.log(`[AUDIT] No document found for ${modelName}, skipping log`);
        return next();
      }

      const changes: any[] = [];

      // ---------- Unwrap common update operators ----------
      const operators = ["$set", "$unset", "$inc", "$push", "$pull", "$setOnInsert"];
      for (const op of operators) {
        if (updateObj[op] && typeof updateObj[op] === "object") {
          for (const [field, newValue] of Object.entries(updateObj[op])) {
            const oldValue = (docToUpdate as any)[field];
            if (String(oldValue) !== String(newValue)) {
              changes.push({
                field_name: field,
                old_value: oldValue,
                new_value: newValue,
              });
            }
          }
        }
      }

      // ---------- Direct assignment (top-level fields without $ operators) ----------
      for (const [field, newValue] of Object.entries(updateObj)) {
        if (!field.startsWith("$")) {
          const oldValue = (docToUpdate as any)[field];
          if (String(oldValue) !== String(newValue)) {
            changes.push({
              field_name: field,
              old_value: oldValue,
              new_value: newValue,
            });
          }
        }
      }

      if (changes.length > 0) {
        await AuditLog.create({
          model_type: modelName,
          model_id: docToUpdate._id,
          user_id: userId,
          changes,
        });
        console.log(`[AUDIT] Changes logged for ${modelName}`, changes);
      } else {
        console.log(`[AUDIT] No changes detected for ${modelName}`);
      }
    } catch (err) {
      console.error("[AUDIT] Error logging findOneAndUpdate:", err);
    }

    next();
  };

  schema.pre("findOneAndUpdate", updateHook);
  schema.pre("updateOne", updateHook);
  schema.pre("updateMany", updateHook);
}
