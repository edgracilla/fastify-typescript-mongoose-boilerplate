
import RedisMock from 'ioredis-mock'

import fastifyPlugin from 'fastify-plugin'
import { FastifyPluginCallback, FastifyInstance } from 'fastify'

export interface RedisMockeOptions {
  closeClient: boolean
  namespace: string,
  url?: string
}

const pluginCallback: FastifyPluginCallback<RedisMockeOptions> = (fastify, options, done) => {
  const { namespace, url } = options

  if (!fastify.redis) {
    fastify.decorate('redis', {})
  }

  if (fastify.redis[namespace]) {
    return done(new Error(`Redis '${namespace}' instance namespace has already been registered`))
  }

  try {
    fastify.redis[namespace] = new RedisMock({ host: url })
  } catch (err) {
    return done(err as Error)
  }

  if (options.closeClient === true) {
    fastify.addHook('onClose', (fastify: FastifyInstance, done: any) => {
      fastify.redis[namespace].quit(done)
    })
  }

  done()
}

export default fastifyPlugin(pluginCallback, '4.x')
