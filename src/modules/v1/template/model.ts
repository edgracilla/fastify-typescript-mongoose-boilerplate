import BaseModel from '../../../core/base/model'

import { Schema, model, models } from 'mongoose'
import { ITemplate, ITemplateModel } from '../../../declarations'
import { getPathInfo, nanoidCustom } from '../../../core/system/utils'

const { resource, modelName } = getPathInfo(__dirname)

const schema = new Schema<ITemplate>({
  _id: {
    type: String,
    default: nanoidCustom()
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
