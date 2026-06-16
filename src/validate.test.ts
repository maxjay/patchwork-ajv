import { describe, it, expect } from 'vitest';
import { validate } from './validate.js';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    tags: {
      type: 'array',
      'x-key': '$self',
      items: { type: 'string' },
    },
    items: {
      type: 'array',
      'x-key': 'id',
      'x-ordered': true,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          value: { type: 'number' },
        },
        required: ['id'],
      },
    },
  },
  required: ['name'],
};

describe('validate', () => {
  it('returns [] for a valid draft', () => {
    const engine = { draft: { name: 'Alice', age: 30 } };
    expect(validate(engine, schema)).toEqual([]);
  });

  it('returns errors when a required field is missing', () => {
    const engine = { draft: { age: 30 } };
    const errors = validate(engine, schema);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].keyword).toBe('required');
  });

  it('returns errors for a type mismatch', () => {
    const engine = { draft: { name: 42 } };
    const errors = validate(engine, schema);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].keyword).toBe('type');
  });

  it('does not error on patchwork x-key / x-ordered fields in schema', () => {
    const engine = {
      draft: {
        name: 'Bob',
        tags: ['a', 'b'],
        items: [{ id: 'x', value: 1 }],
      },
    };
    expect(validate(engine, schema)).toEqual([]);
  });

  it('returns errors for invalid items in an x-key array', () => {
    const engine = {
      draft: {
        name: 'Bob',
        items: [{ value: 1 }], // missing required 'id'
      },
    };
    const errors = validate(engine, schema);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts a plain value instead of an engine', () => {
    expect(validate({ name: 'Alice' }, schema)).toEqual([]);
    expect(validate({}, schema).length).toBeGreaterThan(0);
  });

  it('returns [] for an empty schema (anything is valid)', () => {
    expect(validate({ draft: { whatever: true } }, {})).toEqual([]);
  });

  it('passes ajv options through (e.g. $data references)', () => {
    const schemaWithData = {
      type: 'object',
      properties: {
        min: { type: 'number' },
        value: { type: 'number', minimum: { $data: '1/min' } },
      },
    };
    expect(validate({ min: 5, value: 10 }, schemaWithData, { $data: true })).toEqual([]);
    expect(validate({ min: 5, value: 3 }, schemaWithData, { $data: true }).length).toBeGreaterThan(0);
  });
});
