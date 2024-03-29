import fastify from 'fastify'

import cors from '@fastify/cors'
import fredis from '@fastify/redis'
import helmet from '@fastify/helmet'
import formbody from '@fastify/formbody'

import sysUtil from './core/system/utils'
import dbService from './core/database/mongo'
import apiReactor from './core/system/reactor'
import mockRedis from './core/database/redis-mock'

export default function app (config: any) {
  const redis = config.env === 'test' ? mockRedis : fredis

  const server = fastify(config.fastify)

  server.register(helmet)
  server.register(formbody)
  server.register(apiReactor)

  server.register(redis, config.redis)
  server.register(dbService, config.mongodb)
  server.register(cors, { origin: '*' }) // !!

  server.decorate('modules', {})
  server.decorate('config', config)

  // -- app loader

  server.after(async () => {
    const versions = sysUtil.getDirs(`${config.root}/src/modules/*`)

    for (const version of versions) {
      const modules = sysUtil.getDirs(`${config.root}/src/modules/${version}/*`)
      const routes = sysUtil.getFiles(`${config.root}/src/modules/${version}/*/routes.{ts,js}`)

      server.modules[version] = modules

      routes.map(async (routePath) => {
        const route = await import(routePath)
        server.register(route, { prefix: `/${version}` })
      })
    }
  })

  // -- app init

  if (config.env !== 'test') {
    server.ready(err => {
      if (err) {
        server.log.error(err)
        process.exit(1)
      } else {
        server.listen({ port: config.port });
      }
    })
  }

  return server
}
