<p align="center">
  <h1 align="center">patchwork-ajv</h1>
  <p align="center">AJV JSON Schema validation for <a href="https://github.com/maxjay/patchwork">patchwork</a> Engine and NodeEngine drafts.</p>
</p>

<p align="center">
  <a href="#install">Install</a> &middot;
  <a href="#usage">Usage</a> &middot;
  <a href="#patchwork-schema-extensions">Schema extensions</a> &middot;
  <a href="#api">API</a>
</p>

---

## Install

```bash
npm install @maxjay/patchwork-ajv
```

Requires `@maxjay/patchwork` as a peer dependency if you're passing Engine or NodeEngine instances.

## Usage

### Validate an Engine's draft

```ts
import { Engine } from '@maxjay/patchwork';
import { validate } from '@maxjay/patchwork-ajv';

const schema = {
  type: 'object',
  properties: {
    host: { type: 'string' },
    port: { type: 'number' },
  },
  required: ['host', 'port'],
};

const engine = new Engine({ host: 'localhost', port: 8080 });
engine.replace('$.port', 'oops'); // type mismatch

const errors = validate(engine, schema);
// [{ instancePath: '/port', keyword: 'type', message: 'must be number', ... }]
```

`validate` reads `engine.draft` and runs it through AJV. It returns an empty array when the draft is valid.

### Validate a NodeEngine (scoped lens)

```ts
const nodeEngine = engine.getNodeEngine('$.server');
const errors = validate(nodeEngine, serverSchema);
```

`nodeEngine.draft` is the subtree — validation is scoped to it.

### Validate a plain value

You don't need an Engine at all. Pass any value directly:

```ts
const errors = validate({ host: 'localhost', port: 8080 }, schema);
```

`validate` detects the presence of a `.draft` property to decide whether to unwrap.

## Patchwork schema extensions

Patchwork schemas can include `x-key` and `x-ordered` on array nodes for identity-based diffing:

```ts
const schema = {
  type: 'object',
  properties: {
    users: {
      type: 'array',
      'x-key': 'id',        // patchwork extension — identity field for diffing
      'x-ordered': true,    // patchwork extension — position changes emit as move ops
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id'],
      },
    },
  },
};

// Works fine — x-key and x-ordered are registered as no-ops in AJV
const errors = validate(engine, schema);
```

You can pass the same schema object to both `new Engine(base, { schema })` and `validate()` — no stripping or copying needed.

## API

### `validate(target, schema): ErrorObject[]`

| Parameter | Type | Description |
|---|---|---|
| `target` | `Engine \| NodeEngine \| { draft: unknown } \| unknown` | If the value has a `.draft` property, that property is validated. Otherwise the value itself is validated. |
| `schema` | `object` | Any valid JSON Schema object. Patchwork's `x-key` and `x-ordered` extensions are ignored by AJV. |

Returns AJV's [`ErrorObject[]`](https://ajv.js.org/api.html#validation-errors). Empty array means valid.

### `ErrorObject`

Re-exported from AJV for convenience:

```ts
import { type ErrorObject } from '@maxjay/patchwork-ajv';
```

Key fields:

| Field | Description |
|---|---|
| `instancePath` | JSON Pointer to the failing value (e.g. `/users/0/id`) |
| `keyword` | The failing keyword (`required`, `type`, `minimum`, …) |
| `message` | Human-readable error string |
| `params` | Keyword-specific details (e.g. `{ missingProperty: 'id' }`) |

## License

Apache-2.0
