import mongoose from 'mongoose'
import MongoQS from 'mongo-querystring'

import { get } from 'lodash'
import { Errors } from '../../core'
import { IValidationSchema } from '../../declarations'

class BaseController {
  public _mqs: MongoQS
  private prereqs: []

  constructor (vSchema: IValidationSchema) {
    const queryableFields = Object.keys(vSchema.querystring)

    const whitelistParams = queryableFields
      .filter(Boolean)
      .reduce((accum, key) => {
        accum[key] = true
        return accum
      }, {} as Record<string, boolean>)

    this._mqs = new MongoQS({
      whitelist: whitelistParams,
      blacklist: {
        page: true,
        sort: true,
        limit: true,
        near: true,
        search: true,
      }
    })

    // -- capture prerequisite fields

    const props = vSchema.body.properties
    const fields = Object.keys(props || {})

    const ret = fields.map(field => {
      const model = get(props, `${field}.prereq`)

      if (model) {
        return [field, model]
      }
    })

    this.prereqs = ret.filter(Boolean) as []
  }

  async prereqExists (body: object) {
    const errBag = []

    for (let i = 0; i < this.prereqs.length; i++) {
      const field = this.prereqs[i][0]
      const model = this.prereqs[i][1]
      const _id = body[field]

      if (_id) {
        const exist = await mongoose
          .model(model)
          .countDocuments({ _id }, { limit: 1 })

        if (!exist) {
          errBag.push(`${field} '${_id}' does not exist.`)
        }
      }
    }

    if (errBag.length) {
      throw new Errors.ValidationError('Missing prerequisite record.', errBag)
    }
  }
}

export default BaseController
