import ctl from './controller'
import vld from './validation'

import { ISample } from './model'
import { AppRequest } from '../../../declarations'
import { getPathInfo } from '../../../core/system/utils'

import { FastifyInstance } from 'fastify'

async function routes (fastify: FastifyInstance) {
  const { resource } = getPathInfo(__dirname)
  const { apiResp, apiErr } = fastify

  /** create */

  fastify.post(`/${resource}`, vld.postSchema, async (request: AppRequest, reply) => {
    const { body, meta } = request

    return ctl.create(body as ISample, meta)
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

  fastify.patch(`/${resource}/:_id`, vld.patchSchema, async (request: AppRequest, reply) => {
    const { params, body, meta } = request

    return ctl.update(params._id, body as ISample, meta)
      .then(ret => apiResp(reply, ret))
      .catch(err => apiErr(reply, err))
  })

  /** delete */

  fastify.delete(`/${resource}/:_id`, async (request: AppRequest, reply) => {
    const { params, meta } = request

    return ctl.del(params._id, meta)
      .then(ret => apiResp(reply, ret, 204))
      .catch(err => apiErr(reply, err))
  })

  /** search */

  fastify.get(`/${resource}`, vld.getSchema, async (request: AppRequest, reply) => {
    const { query, meta } = request

    return ctl.search(query)
      .then(ret => apiResp(reply, ret))
      .catch(err => apiErr(reply, err))
  })
}


export default routes
