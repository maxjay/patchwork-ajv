import Ajv, { type ErrorObject, type Options, type KeywordDefinition } from 'ajv';

export type { ErrorObject, Options, KeywordDefinition };

type HasDraft = { draft: unknown };

function isDraftable(v: unknown): v is HasDraft {
  return typeof v === 'object' && v !== null && 'draft' in v;
}

function makeAjv(options?: Options, keywords?: KeywordDefinition[]): Ajv {
  const ajv = new Ajv(options);
  ajv.addKeyword('x-key');
  ajv.addKeyword('x-ordered');
  keywords?.forEach(k => ajv.addKeyword(k));
  return ajv;
}

export function validate(target: HasDraft | unknown, schema: object, options?: Options, keywords?: KeywordDefinition[]): ErrorObject[] {
  const value = isDraftable(target) ? target.draft : target;
  const ajv = makeAjv(options, keywords);
  const valid = ajv.validate(schema, value);
  return valid ? [] : (ajv.errors ?? []);
}
