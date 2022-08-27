import dotenv from 'dotenv'
import app from './src/app'

dotenv.config()

// -- app configs

const root = __dirname
const port = +(process.env.PORT || 8080)
const env = process.env.NODE_ENV || 'development'
const cache = process.env.CACHE === 'true'

const logger = env === 'development'
  ? { transport: { target: 'pino-pretty', options: { translateTime: true } } }
  : env !== 'test'

const mongodb = {
  type: process.env.MONGO_TYPE,
  dbURL: process.env.MONGO_URL,
  sslCA: process.env.MONGO_SSL_CA,
  recordset: process.env.MONGO_RS,
  dbName: process.env.MONGO_DB_NAME,
}

const redis = {
  namespace: env,
  closeClient: true,
  url: process.env.REDIS_URL,
}

const ajv = {
  customOptions: {
    allErrors: true
  }
}

const appConfig = {
  fastify: { logger, ajv },
  mongodb, redis, env, port,
  cache, root,
}

const server = app(appConfig)

// -- app exit handler

const sigFn: { [key: string ] : any } = {}
const SIGNALS = ['SIGHUP', 'SIGINT', 'SIGTERM'] as const

SIGNALS.map(signal => {
  sigFn[signal] = function () {
    server.log.info(`[${signal}] Terminating process..`)

    if (env !== 'production') {
      server.redis[env].flushall()
    }

    server.redis[env].disconnect()

    server.close().then(() => {
      server.log.info('Server successfully closed!')
      process.exit(1)
    }, (err) => {
      server.log.error(err)
    })

    process.removeListener(signal, sigFn[signal])
  }

  process.on(signal, sigFn[signal])
})

export default server
