import { FastifyRedis } from '@fastify/redis'
import { FastifyInstance, FastifyRequest } from 'fastify'

import { ControllerClasses } from './controllers.decl'
import { SearchQuery, AppDoc } from './models.decl'

// -- app/system base

declare module 'fastify' {
  interface FastifyInstance {
    apiErr (reply: FastifyReply, error: Error) : void
    apiResp (reply: FastifyReply, payload: unknown | null, code?: number) : void

    config: AppConfig
    redis: FastifyRedis
    api: { [version: string]: ModuleStructure }
  }

  interface FastifyRequest {
    meta: IMeta
  }
}

export interface AppConfig {
  redis: {}
  fastify: {}
  mongodb: {}

  env: string
  port: number
  root: string
  cache: boolean
}

export interface ModuleStructure {
  modules: string[],
  controllers: { [key: string]: ControllerClasses },
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

export interface IValidationSchema {
  body: {
    type?: string
    required?: string[]
    properties?: object
  }
  querystring: object
}

// -- controller base

export declare class BaseController {
  public getSchema: {}
  public postSchema: {}
  public patchSchema: {}

  create (data: AppDoc, meta: IMeta): Promise<AppDoc>
  read (_id: string, meta: IMeta): Promise<AppDoc>
  update (_id: string, data: AppDoc, meta: IMeta): Promise<AppDoc>
  delete (_id: string, meta: IMeta): Promise<boolean>
  search (options: SearchQuery): Promise<ISearchResult>
}

// -- model base

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

export interface IBaseModelCreateOption {
  cache: boolean
}

// -- search base

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
