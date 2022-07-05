import mongoose from 'mongoose'
import fastifyPlugin from 'fastify-plugin'
import { FastifyPluginCallback } from 'fastify'

export interface MongooseOptions {
  dbURL?: string
  dbName?: string

  type?: string
  sslCA?: string
  recordset?: string
}

const pluginCallback: FastifyPluginCallback<MongooseOptions> = (fastify, options, done) => {
  const logger = fastify.log
  const dbURL = options.dbURL || 'mongodb://localhost:27017'

  options = Object.assign({}, options, {
    serverSelectionTimeoutMS: 1000 * 8,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })

  delete options.dbURL
  let isRegistered = false

  mongoose
    .connect(dbURL, options)
    .then(db => {
      logger.info(`Connected to MongoDB (${options.dbName})`)

      db.connection.on('disconnected', () => {
        logger.info('Diconnected from MongoDB.')
      })

      db.connection.on('reconnected', () => {
        logger.info('Reconnected to MongoDB.')
      })

      if (!isRegistered) {
        isRegistered = true

        fastify
          .decorate('mongo', db)
          .addHook('onClose', function (fastify, done) {
            db.connection.close(() => {
              done()
            })
          })
      }

      done()
    })
    .catch(err => {
      logger.info(err.message)
      done(err)
    })
}

export default fastifyPlugin(pluginCallback)
