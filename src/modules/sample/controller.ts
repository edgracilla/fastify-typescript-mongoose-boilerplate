import { FastifyInstance, FastifyRequest } from 'fastify'

import { SampleModel } from '../models'
import { BaseController } from '../../core'
import { ISample, ISampleModel, IValidationSchema, IMeta } from '../../declarations'

interface ISampleQuery {
  foo: string | string[]
}

export type SampleRequest = FastifyRequest<{
  Params: { _id: string }
  Querystring: ISampleQuery
  Body: ISample
  Meta: IMeta
}>

export const vSchema: IValidationSchema = {
  body: {
    type: 'object',
    required: ['foo', 'bar'],
    properties: {
      foo: { type: 'string' },
      bar: { type: 'string' },
    }
  },
  querystring: {
    _id: {
      anyOf: [
        { type: 'string', maxLength: 30 },
        { type: 'array', items: { type: 'string', maxLength: 30 } }
      ]
    }
  }
}

export default class SampleController extends BaseController {
  public resource: string
  private model: ISampleModel

  constructor (fastify: FastifyInstance) {
    super(vSchema)

    this.model = SampleModel
    this.model._init(fastify)
    this.resource = SampleModel.collection.name
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

  async search (options: ISampleQuery) {
    const filter = this._mqs.parse(options)
    return await this.model._search(filter)
  }
}
