import { ZodTypeAny } from 'zod';

import { JsonSchema } from '../types';

function getDescription(def: unknown): string | undefined {
  if (def && typeof def === 'object' && 'description' in (def as Record<string, unknown>)) {
    const desc = (def as { description?: unknown }).description;
    return typeof desc === 'string' ? desc : undefined;
  }
  return undefined;
}

export function zodToJsonSchema(schema: ZodTypeAny): JsonSchema {
  const rawDef = (schema as ZodTypeAny)._def as unknown;

  if (!rawDef) {
    return { type: 'object' };
  }

  const def = rawDef as { typeName?: unknown; [key: string]: unknown };
  const description = getDescription(def);
  const typeName = String(def.typeName);

  switch (typeName) {
    case 'ZodString': {
      return {
        type: 'string',
        ...(description ? { description } : {}),
      };
    }

    case 'ZodNumber': {
      return {
        type: 'number',
        ...(description ? { description } : {}),
      };
    }

    case 'ZodBoolean': {
      return {
        type: 'boolean',
        ...(description ? { description } : {}),
      };
    }

    case 'ZodArray': {
      const itemType = (def as { type?: unknown }).type as ZodTypeAny | undefined;
      return {
        type: 'array',
        items: itemType ? zodToJsonSchema(itemType) : {},
        ...(description ? { description } : {}),
      };
    }

    case 'ZodObject': {
      const properties: Record<string, JsonSchema> = {};
      const required: string[] = [];

      const shapeFn = (def as { shape?: unknown }).shape as (() => unknown) | undefined;
      const shape = typeof shapeFn === 'function' ? (shapeFn() as Record<string, ZodTypeAny>) : {};

      for (const [key, fieldSchema] of Object.entries(shape)) {
        const zodField = fieldSchema as ZodTypeAny;
        properties[key] = zodToJsonSchema(zodField);

        const fieldDefUnknown = (zodField as ZodTypeAny)._def as unknown;
        const fieldTypeName = String((fieldDefUnknown as { typeName?: unknown })?.typeName);

        if (fieldTypeName !== 'ZodOptional' && fieldTypeName !== 'ZodDefault') {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {}),
        ...(description ? { description } : {}),
      };
    }

    case 'ZodOptional': {
      const innerType = (def as { innerType?: unknown }).innerType as ZodTypeAny | undefined;
      return innerType ? zodToJsonSchema(innerType) : {};
    }

    case 'ZodDefault': {
      const innerType = (def as { innerType?: unknown }).innerType as ZodTypeAny | undefined;
      const defaultValueFn = (def as { defaultValue?: () => unknown }).defaultValue;
      const innerSchema = innerType ? zodToJsonSchema(innerType) : {};
      return {
        ...innerSchema,
        ...(typeof defaultValueFn === 'function' ? { default: defaultValueFn() } : {}),
      };
    }

    case 'ZodEnum': {
      const values = (def as { values?: unknown }).values as
        | Array<string | number | boolean | null>
        | undefined;
      return {
        type: 'string',
        ...(Array.isArray(values) ? { enum: values } : {}),
        ...(description ? { description } : {}),
      };
    }

    case 'ZodUnion': {
      const options = (def as { options?: unknown }).options as ZodTypeAny[] | undefined;
      return {
        oneOf: options ? options.map(opt => zodToJsonSchema(opt)) : [],
        ...(description ? { description } : {}),
      };
    }

    case 'ZodRecord': {
      return {
        type: 'object',
        additionalProperties: true,
        ...(description ? { description } : {}),
      };
    }

    default: {
      return { type: 'object' };
    }
  }
}
