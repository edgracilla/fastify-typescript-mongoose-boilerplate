import { FastifyRedis } from '@fastify/redis'

import { IMeta } from './models.decl'
import { ControllerClasses } from './controllers.decl'

export * from './models.decl';
export * from './controllers.decl';

declare module 'fastify' {
  interface FastifyInstance {
    apiErr (reply: FastifyReply, error: Error) : void
    apiResp (reply: FastifyReply, payload: unknown | null, code?: number) : void

    apiModules: string[]
    redis: FastifyRedis

    controllers: { [key: string]: ControllerClasses },
  }

  interface FastifyRequest {
    meta: IMeta
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
