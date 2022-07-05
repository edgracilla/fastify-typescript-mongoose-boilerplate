import { Model } from 'mongoose'
import { FastifyInstance } from 'fastify'
import { FastifyRedis } from '@fastify/redis'

declare module 'fastify' {
  interface FastifyInstance {
    apiErr (reply: FastifyReply, error: Error) : void
    apiResp (reply: FastifyReply, payload: unknown | null, code?: number) : void

    apiModules: string[]
    redis: FastifyRedis
  }

  interface FastifyRequest {
    meta: IMeta
  }
}

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
  _search (query: object, otions?: ISearchOptions, hasNear?: boolean) : ISearchResult
  _delete (_id: string): boolean

  _deleteMany (query: object): boolean
}

// -- request specific

export interface IValidationSchema {
  body: {
    type?: string
    required?: string[]
    properties?: object
  }
  querystring: object
}

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

export interface ISearchOptions {
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

// -- Module Documents

export interface ISample {
  _id?: string
  foo: string
  bar: string
}

export interface ITemplate {
  _id?: string
  name: string
  desc: string
}

export interface ISampleModel extends Model<ISample>, IBaseModel<ISample> {}
export interface ITemplateModel extends Model<ITemplate>, IBaseModel<ITemplate> {}

export type AppDoc = ISample | ITemplate

export default {}
