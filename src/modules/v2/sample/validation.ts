import { pick } from 'lodash'

const body = {
  type: 'object',
  required: ['foo', 'bar'],
  properties: {
    foo: { type: 'string' },
    bar: { type: 'string' },
  }
}

const query = {
  _id: {
    anyOf: [
      { type: 'string', maxLength: 30 },
      { type: 'array', items: { type: 'string', maxLength: 30 } }
    ]
  }
}

export default {
  postSchema: { schema: { body } },
  getSchema: { schema: { querystring: query } },
  patchSchema: { schema: { body: pick(body, ['type', 'properties']) } },
  query,
}
