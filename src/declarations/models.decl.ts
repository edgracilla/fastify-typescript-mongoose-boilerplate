import { Model } from 'mongoose'
import { FastifyInstance, FastifyRequest } from 'fastify'

// -- base model

export interface IBaseModelCreateOption {
  cache: boolean
}

export interface IBaseModel<T> {
  _init (fastify: FastifyInstance) : void
  _genKey (_id: string) : string

  _create (data: T, options?: IBaseModelCreateOption) : T
  _read (_id: string | object) : T
  _update (query: object, data: T, hard?: boolean) : T
  _search (query: object, otions?: ISearchParams, hasNear?: boolean) : ISearchResult
  _delete (_id: string): boolean

  _deleteMany (query: object): boolean
}

// -- search specifics

export interface ISampleQuery {
  name: string | string[]
  foo: string
}

export interface ITemplateQuery {
  name: string | string[]
  bar: string
}

// --

export interface ISearchParams {
  sort?: string
  page?: number
  limit?: number
  search?: string
}

export interface ISearchResult {
  page: number
  count: number
  limit: number
  pages: number
  records: Array<object>
}

// -- request specifics

export type AppRequest = FastifyRequest<{
  Params: { _id: string }
  Querystring: SearchQuery
  Body: AppDoc
  Meta: IMeta
}>

export interface IMeta {
  _user: {
    _id?: string
    name?: string
    email?: string
  }
  _access: {
    _id?: string
    foo?: string
    bar?: string
  }
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
