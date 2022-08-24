import { FastifyInstance } from 'fastify'
import { BaseController } from '../../../core'
import { IMeta, SearchQuery } from '../../../declarations'

import SampleModel, { ISample, ISampleModel } from './model'

const bodySchema = {
  type: 'object',
  required: ['foo', 'bar'],
  properties: {
    foo: { type: 'string' },
    bar: { type: 'string' },
  }
}

const querySchema = {
  _id: {
    anyOf: [
      { type: 'string', maxLength: 30 },
      { type: 'array', items: { type: 'string', maxLength: 30 } }
    ]
  }
}

export default class SampleController extends BaseController {
  private model: ISampleModel

  constructor (fastify: FastifyInstance) {
    super({ body: bodySchema, querystring: querySchema })
    this.model = SampleModel
    this.model._init(fastify)
  }

  /** create */

  async create (data: ISample, meta: IMeta) {
    return await this.model._create(data)
  }

  /** read */

  async read (_id: string) {
    return await this.model._read(_id)
  }

  /** update */

  async update (_id: string, data: ISample, meta: IMeta) {
    return await this.model._update({ _id }, data)
  }

  /** delete */

  async delete (_id: string, meta: IMeta) {
    return await this.model._delete(_id)
  }

  /** search */

  async search (options: SearchQuery) {
    const filter = this._mqs.parse(options)

    // TODO: handle search query

    return await this.model._search(filter)
  }
}
