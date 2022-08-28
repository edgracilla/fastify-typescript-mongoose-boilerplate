import vld from './validation'

import Model, { ITemplate } from './model'
import { makeMongoQS } from '../../../core/system/utils'
import { IMeta, SearchQuery } from '../../../declarations'

const mqs = makeMongoQS(Object.keys(vld.query))

export async function create (data: ITemplate, meta: IMeta) {
  return await Model._create(data)
}

export async function read (_id: string, meta: IMeta) {
  return await Model._read(_id)
}

export async function update (_id: string, data: ITemplate, meta: IMeta) {
  return await Model._update({ _id }, data)
}

export async function del (_id: string, meta: IMeta) {
  return await Model._delete(_id)
}

export async function search (options: SearchQuery) {
  const filter = mqs.parse(options)
  return await Model._search(filter)
}

export default { create, read, update, del, search }
