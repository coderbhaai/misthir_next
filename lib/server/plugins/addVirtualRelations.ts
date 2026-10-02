import { Schema } from 'mongoose';

export interface VirtualRelationConfig {
  populateName: string;
  outputName: string;
  ref: string;
  foreignField: string;
  extractIdField: string;
  match?: Record<string, any>;
  justOne?: boolean;     
}

export const addVirtualRelations = (schema: Schema, relations: VirtualRelationConfig[]) => {
  for (const rel of relations) {
    const { populateName, outputName, ref, foreignField, extractIdField, match, justOne = false, } = rel;

    schema.virtual(populateName, {
      ref,
      localField: "_id",
      foreignField,
      justOne,
      ...(match ? { match } : {}),
    });

    if (outputName) {
      schema.virtual(outputName).get(function (this: any) {
        const value = this[populateName];

        if (!value) {
          return justOne ? null : [];
        }

        if (justOne) {
          return value?.[extractIdField] ?? null;
        }

        return Array.isArray(value)
          ? value
              .map((item: any) => item?.[extractIdField])
              .filter(Boolean)
          : [];
      });
    }
  }
};