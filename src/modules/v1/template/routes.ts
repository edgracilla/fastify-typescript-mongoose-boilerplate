import { FastifyInstance } from 'fastify'
import { AppRequest } from '../../../declarations'
import { getPathInfo } from '../../../core/system/utils'

const route = async (fastify: FastifyInstance) => {
  const { apiResp, apiErr, api } = fastify
  const { resource, version } = getPathInfo(__dirname)

  const ctl = api[version].controllers[resource]

  /** create */

  fastify.post(`/${resource}`, ctl.postSchema, async (request: AppRequest, reply) => {
    const { body, meta } = request

    return ctl.create(body, meta)
      .then(ret => apiResp(reply, ret, 201))
      .catch(err => apiErr(reply, err))
  })

  /** read */

  fastify.get(`/${resource}/:_id`, async (request: AppRequest, reply) => {
    const { params, meta } = request

    return ctl.read(params._id, meta)
      .then(ret => apiResp(reply, ret))
      .catch(err => apiErr(reply, err))
  })

  /** update */

  fastify.patch(`/${resource}/:_id`, ctl.patchSchema, async (request: AppRequest, reply) => {
    const { params, body, meta } = request

    return ctl.update(params._id, body, meta)
      .then(ret => apiResp(reply, ret))
      .catch(err => apiErr(reply, err))
  })

  /** delete */

  fastify.delete(`/${resource}/:_id`, async (request: AppRequest, reply) => {
    const { params, meta } = request

    return ctl.delete(params._id, meta)
      .then(ret => apiResp(reply, ret, 204))
      .catch(err => apiErr(reply, err))
  })

  /** search */

  fastify.get(`/${resource}`, ctl.getSchema, async (request: AppRequest, reply) => {
    const { query, meta } = request

    return ctl.search(query)
      .then(ret => apiResp(reply, ret))
      .catch(err => apiErr(reply, err))
  })
}


export default route
