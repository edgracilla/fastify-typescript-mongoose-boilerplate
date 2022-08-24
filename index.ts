import fastify from 'fastify'

import path from 'path'
import dotenv from 'dotenv'

import cors from '@fastify/cors'
import fredis from '@fastify/redis'
import helmet from '@fastify/helmet'
import formbody from '@fastify/formbody'

// import auth from './src/core/system/auth'

import sysUtil from './src/core/system/utils'
import dbService from './src/core/database/mongo'
import apiReactor from './src/core/system/reactor'
import mockRedis from './src/core/database/redis-mock'

import { ModuleStructure } from './src/declarations'

dotenv.config()

const port = +(process.env.PORT || 8080)
const NODE_ENV = process.env.NODE_ENV || 'development'

const isInTest = NODE_ENV === 'test'
const isInDev = NODE_ENV === 'development'

const redis = isInTest
  ? mockRedis
  : fredis

const ajvConfig = {
  customOptions: {
    allErrors: true
  }
}

const loggerConfig = isInDev
  ? { transport: { target: 'pino-pretty', options: { translateTime: true } } }
  : !isInTest

// -- initialize

const app = fastify({
  logger: loggerConfig, // TODO: why stack trace included?
  ajv: ajvConfig,
})

app.register(helmet)
app.register(formbody)
app.register(apiReactor)

app.register(dbService, {
  type: process.env.MONGO_TYPE,
  dbURL: process.env.MONGO_URL,
  sslCA: process.env.MONGO_SSL_CA,
  recordset: process.env.MONGO_RS,
  dbName: process.env.MONGO_DB_NAME,
})

app.register(redis, {
  closeClient: true,
  namespace: NODE_ENV,
  url: process.env.REDIS_URL,
})

app.register(cors, {
  origin: (origin, cb) => {
    if(origin === void 0 || /localhost/.test(origin) || /\.tiedups\.com$/.test(origin)){
      cb(null, true)
      return
    }

    cb(new Error(`[CORS] Not allowed! ${origin}`), false)
  }
})

app.decorate('controllers', {})
app.decorate('api', {})

// -- app loader

app.after(async () => {
  const versions = sysUtil.getDirs(`./src/modules/*`)

  for (const version of versions) {
    const modules = sysUtil.getDirs(`./src/modules/${version}/*`)
    const routes = sysUtil.getFiles(`./src/modules/${version}/*/routes.ts`)
    const ctlPaths = sysUtil.getFiles(`./src/modules/${version}/*/controller.ts`)

    const  module: ModuleStructure = { modules, controllers: {} }

    ctlPaths.map(async (ctlPath) => {
      const CtlClass = await import(ctlPath.replace('.ts', ''))
      const resource = path.basename(path.dirname(ctlPath))
      const controller = new CtlClass.default(app)

      module.controllers[resource] = controller
      app.api[version] = module
    })

    routes.map(routePath => {
      const route = import(routePath.replace('.ts', ''))
      app.register(route, { prefix: `/${version}` })
    })
  }
})

// -- app init

if (!isInTest) {
  app.ready(err => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    } else {
      app.listen({ port });
    }
  })
}

// -- app exit handler

const sigFn: { [key: string ] : any } = {}
const SIGNALS = ['SIGHUP', 'SIGINT', 'SIGTERM'] as const

SIGNALS.map(signal => {
  sigFn[signal] = function () {
    app.log.info(`[${signal}] Terminating process..`)

    if (isInDev) {
      app.redis[NODE_ENV].flushall()
    }

    app.redis[NODE_ENV].disconnect()

    app.close().then(() => {
      app.log.info('Server successfully closed!')
      process.exit(1)
    }, (err) => {
      app.log.error(err)
    })

    process.removeListener(signal, sigFn[signal])
  }

  process.on(signal, sigFn[signal])
})

export default app
