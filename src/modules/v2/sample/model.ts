import { nanoid } from 'nanoid'
import { BaseModel } from '../../../core'
import { Schema, model, models } from 'mongoose'

import { getPathInfo } from '../../../core/system/utils'
import { ISample, ISampleModel } from '../../../declarations'

const { resource, modelName } = getPathInfo(__dirname)

const schema = new Schema<ISample>({
  _id: {
    type: String,
    default: () => nanoid()
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
