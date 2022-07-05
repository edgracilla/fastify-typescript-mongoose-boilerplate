import path from 'path'

import { nanoid } from 'nanoid'
import { BaseModel } from '../../core'
import { Schema, model } from 'mongoose'
import { ISample, ISampleModel } from '../../declarations'

const resource = path.basename(__dirname)

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
}, {
  minimize: false,
  timestamps: true,
})

schema.loadClass(BaseModel)

export default model<ISample, ISampleModel> (resource, schema, resource)

