import Ajv, { type ErrorObject } from 'ajv';

export type { ErrorObject };

type HasDraft = { draft: unknown };

function isDraftable(v: unknown): v is HasDraft {
  return typeof v === 'object' && v !== null && 'draft' in v;
}

function makeAjv(): Ajv {
  const ajv = new Ajv();
  ajv.addKeyword('x-key');
  ajv.addKeyword('x-ordered');
  return ajv;
}

export function validate(target: HasDraft | unknown, schema: object): ErrorObject[] {
  const value = isDraftable(target) ? target.draft : target;
  const ajv = makeAjv();
  const valid = ajv.validate(schema, value);
  return valid ? [] : (ajv.errors ?? []);
}
