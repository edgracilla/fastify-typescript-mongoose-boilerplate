import { pick } from 'lodash'
import { FastifyInstance } from 'fastify'
import TemplateController, { vSchema, TemplateRequest } from './controller';

const route = async (fastify: FastifyInstance) => {
  const { apiResp, apiErr } = fastify
  const ctl = new TemplateController(fastify)

  const { body, querystring } = vSchema
  const postSchema = { schema: { body } }
  const getSchema = { schema: { querystring } }
  const patchSchema = { schema: { body: pick(body, ['type', 'properties']) } }

  /** create */

  fastify.post(`/${ctl.resource}`, postSchema, async (request: TemplateRequest, reply) => {
    const { body, meta } = request

    return ctl.create(body, meta)
      .then(ret => apiResp(reply, ret, 201))
      .catch(err => apiErr(reply, err))
  })

  /** read */

  fastify.get(`/${ctl.resource}/:_id`, async (request: TemplateRequest, reply) => {
    const { params } = request

    return ctl.read(params._id)
      .then(ret => apiResp(reply, ret))
      .catch(err => apiErr(reply, err))
  })

  /** update */

  fastify.patch(`/${ctl.resource}/:_id`, patchSchema, async (request: TemplateRequest, reply) => {
    const { params, body, meta } = request

    return ctl.update(params._id, body, meta)
      .then(ret => apiResp(reply, ret))
      .catch(err => apiErr(reply, err))
  })

  /** delete */

  fastify.delete(`/${ctl.resource}/:_id`, async (request: TemplateRequest, reply) => {
    const { params, meta } = request

    return ctl.delete(params._id, meta)
      .then(ret => apiResp(reply, ret, 204))
      .catch(err => apiErr(reply, err))
  })

  /** search */

  fastify.get(`/${ctl.resource}`, getSchema, async (request: TemplateRequest, reply) => {
    const { query, meta } = request

    return ctl.search(query)
      .then(ret => apiResp(reply, ret))
      .catch(err => apiErr(reply, err))
  })
}


export default route
