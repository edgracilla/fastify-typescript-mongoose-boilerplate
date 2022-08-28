import { agent } from 'supertest'
import app from '../../../index'

import TemplateModel, { ITemplate } from '../../../src/modules/v1/template/model'

const api = agent(app.server)

let _template: ITemplate

const testData = {
  name: 'barv1',
  desc: 'foov1'
}

describe('/v1/template', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async() => {
    if (_template && _template._id) {
      await TemplateModel.deleteOne({ _id: _template._id })
    }

    await app.close()
  })

  // ------------
  // -- CREATE --
  // ------------

  describe('POST', () => {
    it('should catch required field validation', async () => {
      await api
        .post('/v1/template')
        .send({})
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: "body must have required property 'name', body must have required property 'desc'"
        })
    })

    it('should create sample', async () => {
      const ret = await api
        .post('/v1/template')
        .send(testData)
        .expect(201)

        _template = ret.body
    })
  })

  // ------------
  // -- READ --
  // ------------

  describe('GET', () => {
    it('should catch non existing record', async () => {
      const ret = await api
        .get('/v1/template/non-existing-id')
        .expect({
          statusCode: 404,
          error: 'Not found',
          message: 'Either resource not found or you are not authorized to perform the operation.'
        })
    })

    it('should read correct record - by id', async () => {
      const ret = await api
        .get(`/v1/template/${_template._id}`)
        .expect(200)

        expect(ret.body.name).toBe(testData.name)
    })

    it('should read correct record - query by name', async () => {
      const ret = await api
        .get(`/v1/template?search=${_template.name}`)
        .expect(200)

        expect(ret.body.count).toBeGreaterThan(0)
        expect(ret.body.records[0].name).toBe(_template.name)
    })
  })

  // ------------
  // -- UPDATE --
  // ------------

  describe('PATCH', () => {
    it('should update self', async () => {
      const ret = await api
        .patch(`/v1/template/${_template._id}`)
        .send({ name: 'bars' })
        .expect(200)

        expect(ret.body.name).toBe('bars')
    })
  })

  // ------------
  // -- DELETE --
  // ------------

  describe('DELETE', () => {
    it('should catch non existing record', async () => {
      await api
        .delete('/v1/template/non-existing-id')
        .expect({
          statusCode: 404,
          error: 'Not found',
          message: 'Either resource not found or you are not authorized to perform the operation.'
        })
    })

    it('should delete record', async () => {
      const ret = await api
        .delete(`/v1/template/${_template._id}`)
        .expect(204)

        if (ret.statusCode === 204) {
          _template = {} as ITemplate
        }
    })
  })
})
