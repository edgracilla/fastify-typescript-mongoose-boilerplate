import { FastifyInstance, FastifyRequest } from 'fastify'

import { TemplateModel } from '../models'
import { BaseController } from '../../core'
import { ITemplate, ITemplateModel, IValidationSchema, IMeta } from '../../declarations'

interface ITemplateQuery {
  name: string | string[]
}

export type TemplateRequest = FastifyRequest<{
  Params: { _id: string }
  Querystring: ITemplateQuery
  Body: ITemplate
  Meta: IMeta
}>

export const vSchema: IValidationSchema = {
  body: {
    type: 'object',
    required: ['name', 'desc'],
    properties: {
      name: { type: 'string' },
      desc: { type: 'string' },
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

export default class TemplateController extends BaseController {
  public resource: string
  private model: ITemplateModel

  constructor (fastify: FastifyInstance) {
    super(vSchema)

    this.model = TemplateModel
    this.model._init(fastify)
    this.resource = TemplateModel.collection.name
  }

  /** create */

  async create (data: ITemplate, meta: IMeta) {
    return await this.model._create(data)
  }

  /** read */

  async read (_id: string) {
    return await this.model._read(_id)
  }

  /** update */

  async update (_id: string, data: ITemplate, meta: IMeta) {
    return await this.model._update({ _id }, data)
  }

  /** delete */

  async delete (_id: string, meta: IMeta) {
    return await this.model._delete(_id)
  }

  /** search */

  async search (options: ITemplateQuery) {
    const filter = this._mqs.parse(options)
    return await this.model._search(filter)
  }
}
