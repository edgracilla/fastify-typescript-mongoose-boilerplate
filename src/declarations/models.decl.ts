import { Model } from 'mongoose'
import { IBaseModel } from './base.decl'

// -- search specifics

export interface ISampleQuery {
  name: string | string[]
  foo: string
}

export interface ITemplateQuery {
  name: string | string[]
  bar: string
}

// -- module documents

export interface ISample {
  _id?: string
  foo: string
  bar: string
  beer?: string
}

export interface ITemplate {
  _id?: string
  name: string
  desc: string
}

export interface ISampleModel extends Model<ISample>, IBaseModel<ISample> {}
export interface ITemplateModel extends Model<ITemplate>, IBaseModel<ITemplate> {}

export type AppDoc = ISample | ITemplate
export type SearchQuery = ISampleQuery | ITemplateQuery
