import { FastifyInstance } from 'fastify'
import { BaseController } from '../../../core'
import { IMeta, SearchQuery } from '../../../declarations'

import TemplateModel, { ITemplate, ITemplateModel } from './model'

const bodySchema = {
  type: 'object',
  required: ['name', 'desc'],
  properties: {
    name: { type: 'string' },
    desc: { type: 'string' },
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

export default class TemplateController extends BaseController {
  private model: ITemplateModel

  constructor (fastify: FastifyInstance) {
    super({ body: bodySchema, querystring: querySchema })
    this.model = TemplateModel
    this.model._init(fastify)
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

  async search (options: SearchQuery) {
    const filter = this._mqs.parse(options)
    return await this.model._search(filter)
  }
}
