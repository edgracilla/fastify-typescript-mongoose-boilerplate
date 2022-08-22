import fastify from 'fastify'

import path from 'path'
import dotenv from 'dotenv'
import globby from 'globby'

import cors from '@fastify/cors'
import fredis from '@fastify/redis'
import helmet from '@fastify/helmet'
import formbody from '@fastify/formbody'

// import decl from './src/declarations'
// import auth from './src/core/system/auth'
import dbService from './src/core/database/mongo'
import apiReactor from './src/core/system/reactor'
import mockRedis from './src/core/database/redis-mock'

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
  logger: loggerConfig,
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

// -- app loader

app.after(async () => {

  const modules = globby
    .sync(`./src/modules/*/*`, { onlyDirectories: true })
    .map(dir => path.basename(dir))

  app.decorate('apiModules', modules)
  // app.addHook('preValidation', auth(modules, app.redis[NODE_ENV]))

  globby
    .sync(`./src/modules/**/controller.ts`)
    .map(async (ctlPath) => {
      const ctlClass = await import(ctlPath.replace('.ts', ''))
      const resource = path.basename(path.dirname(ctlPath))
      const ctl = new ctlClass.default(app)

      app.controllers[resource] = ctl
    })

  globby
    .sync(`./src/modules/**/routes.ts`)
    .map(route => app.register(import(route.replace('.ts', ''))))

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

process.on('message', message => {
  console.log('--', message)
  if (message === 'shutdown') {
    process.exit(0)
  }
});

// TODO: bug on pm2 exit

export default app
