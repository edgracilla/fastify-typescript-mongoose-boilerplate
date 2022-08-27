import BaseModel from '../../../core/base/model'

import { Schema, model, models } from 'mongoose'
import { ISample, ISampleModel } from '../../../declarations'
import { getPathInfo, nanoidCustom } from '../../../core/system/utils'

const { resource, modelName } = getPathInfo(__dirname)

const schema = new Schema<ISample>({
  _id: {
    type: String,
    default: nanoidCustom()
  },
  foo: {
    type: String,
    trim: true,
  },
  bar: {
    type: String,
    trim: true,
  },
  beer: {
    type: String,
    trim: true,
  },
}, {
  minimize: false,
  timestamps: true,
})

schema.loadClass(BaseModel)

export { ISample, ISampleModel }
export default models[modelName] as ISampleModel || model<ISample, ISampleModel>(modelName, schema, resource)
