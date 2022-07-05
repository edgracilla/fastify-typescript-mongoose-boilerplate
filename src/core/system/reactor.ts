import fastifyPlugin from 'fastify-plugin'
import { FastifyReply, FastifyPluginCallback } from 'fastify'
import { NotFoundError, AuthError, ForbiddenError, ValidationError } from './errors'

interface IErrorContent {
  error: string
  message: string
  statusCode: number
  data?: unknown[]
}

function apiResp (reply: FastifyReply, payload: object | boolean | null, code = 200) {
  if (!payload) {
    return reply
      .code(404)
      .send({
        statusCode: 404,
        error: 'Not found',
        message: 'Either resource not found or you are not authorized to perform the operation.'
      })
  }

  if (code === 204) {
    return reply.code(code).send()
  } else {
    return reply.code(code).send(payload)
  }
}

export function apiErr (reply: FastifyReply, error: unknown) {
  if (
    error instanceof AuthError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError ||
    error instanceof ValidationError
  ) {
    const content: IErrorContent = {
      error: error.name,
      message: error.message,
      statusCode: error.statusCode,
    }

    if (error.data.length) {
      content.data = error.data
    }

    return reply
      .code(error.statusCode)
      .send(content)
  }

  console.log('---- DEBUG START DEBUG ----')
  console.log(error) // TODO: to stackdriver, sentry or alike
  console.log('---- DEBUG END DEBUG ----')

  return reply
    .code(500)
    .send({
      statusCode: 500,
      error: 'Internal server error.',
      message: 'An unexpected error has occurred. Kindly contact support.'
    })
}

const inject: FastifyPluginCallback = (fastify, options, done) => {
  fastify.decorate('apiResp', apiResp)
  fastify.decorate('apiErr', apiErr)

  done()
}

export default fastifyPlugin(inject)
