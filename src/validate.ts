import Ajv, { type ErrorObject, type Options } from 'ajv';

export type { ErrorObject, Options };

type HasDraft = { draft: unknown };

function isDraftable(v: unknown): v is HasDraft {
  return typeof v === 'object' && v !== null && 'draft' in v;
}

function makeAjv(options?: Options): Ajv {
  const ajv = new Ajv(options);
  ajv.addKeyword('x-key');
  ajv.addKeyword('x-ordered');
  return ajv;
}

export function validate(target: HasDraft | unknown, schema: object, options?: Options): ErrorObject[] {
  const value = isDraftable(target) ? target.draft : target;
  const ajv = makeAjv(options);
  const valid = ajv.validate(schema, value);
  return valid ? [] : (ajv.errors ?? []);
}
