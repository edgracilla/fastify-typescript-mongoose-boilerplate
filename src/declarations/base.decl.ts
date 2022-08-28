import { FastifyRedis } from '@fastify/redis'
import { FastifyInstance, FastifyRequest } from 'fastify'

import { SearchQuery } from './models.decl'

// -- app/system base

declare module 'fastify' {
  interface FastifyInstance {
    apiErr (reply: FastifyReply, error: Error) : void
    apiResp (reply: FastifyReply, payload: unknown | null, code?: number) : void

    config: AppConfig
    redis: FastifyRedis
    modules: { [version: string]: string[] }
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

// -- model base

export interface IBaseModel<T> {
  _init (fastify: FastifyInstance) : void
  _genKey (_id: string) : string

  _create (data: T, options?: ICreateOption) : T
  _read (_id: string | object) : T
  _update (query: object, data: T, hard?: boolean) : T
  _search (query: object, otions?: ISearchParams, hasNear?: boolean) : ISearchResult
  _delete (_id: string): boolean

  _deleteMany (query: object): boolean
}

export interface ICreateOption {
  cache: boolean
}

// -- request specifics

export type AppRequest = FastifyRequest<{
  Params: { _id: string }
  Querystring: SearchQuery
  Body: unknown
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
