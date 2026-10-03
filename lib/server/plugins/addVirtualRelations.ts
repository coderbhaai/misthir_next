import { Schema } from 'mongoose';

export interface VirtualRelationConfig {
    populateName: string;
    outputName?: string;
    ref: string;
    localField?: string;
    foreignField: string;
    extractIdField?: string;
    match?: Record<string, any>;
    justOne?: boolean;     
}

export const addVirtualRelations = (schema: Schema, relations: VirtualRelationConfig[]) => {
    for (const rel of relations) {
        const { 
            populateName, 
            outputName, 
            ref, 
            localField = "_id", 
            foreignField, 
            extractIdField, 
            match, 
            justOne = false 
        } = rel;

        // 1. Register the standard Mongoose virtual relation (enables .populate())
        schema.virtual(populateName, {
            ref,
            localField,
            foreignField,
            justOne,
            ...(match ? { match } : {}),
        });

        // If an outputName is provided, register it as well so you can query/populate it interchangeably
        if (outputName && outputName !== populateName) {
            schema.virtual(outputName, {
                ref,
                localField,
                foreignField,
                justOne,
                ...(match ? { match } : {}),
            });
        }

        // 2. If an extraction field is specified, create a virtual getter for ID mapping
        if (extractIdField && outputName) {
            const getterName = `${outputName}_ids`; // e.g., skus_ids
            schema.virtual(getterName).get(function (this: any) {
                const value = this[outputName] || this[populateName];

                if (!value) {
                    return justOne ? null : [];
                }

                if (justOne) {
                    return value?.[extractIdField] ?? null;
                }

                return Array.isArray(value)
                    ? value.map((item: any) => item?.[extractIdField] ?? item).filter(Boolean)
                    : [];
            });
        }
    }
};