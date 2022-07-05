import path from 'path'

import { nanoid } from 'nanoid'
import { BaseModel } from '../../core'
import { Schema, model } from 'mongoose'
import { ITemplate, ITemplateModel } from '../../declarations'

const resource = path.basename(__dirname)

const schema = new Schema<ITemplate>({
  _id: {
    type: String,
    default: () => nanoid()
  },
  name: {
    type: String,
    trim: true,
  },
  desc: {
    type: String,
    trim: true,
  },
}, {
  minimize: false,
  timestamps: true,
})

schema.loadClass(BaseModel)

export default model<ITemplate, ITemplateModel> (resource, schema, resource)

