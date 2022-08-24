import { nanoid } from 'nanoid'
import { BaseModel } from '../../../core'
import { Schema, model, models } from 'mongoose'

import { getPathInfo } from '../../../core/system/utils'
import { ITemplate, ITemplateModel } from '../../../declarations'

const { resource, modelName } = getPathInfo(__dirname)

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

export { ITemplate, ITemplateModel }
export default models[modelName] as ITemplateModel || model<ITemplate, ITemplateModel>(modelName, schema, resource)
