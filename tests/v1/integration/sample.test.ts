import { agent } from 'supertest'
import app from '../../../index'

import SampleModel, { ISample } from '../../../src/modules/v1/sample/model'

const api = agent(app.server)

let _sample: ISample

const testData = {
  foo: 'barv1',
  bar: 'foov1'
}

describe('/v1/sample', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async() => {
    if (_sample && _sample._id) {
      await SampleModel.deleteOne({ _id: _sample._id })
    }

    await app.close()
  })

  // ------------
  // -- CREATE --
  // ------------

  describe('POST', () => {
    it('should catch required field validation', async () => {
      await api
        .post('/v1/sample')
        .send({})
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: "body must have required property 'foo', body must have required property 'bar'"
        })
    })

    it('should create sample', async () => {
      const ret = await api
        .post('/v1/sample')
        .send(testData)
        .expect(201)

        _sample = ret.body
    })
  })

  // ------------
  // -- READ --
  // ------------

  describe('GET', () => {
    it('should catch non existing record', async () => {
      const ret = await api
        .get('/v1/sample/non-existing-id')
        .expect({
          statusCode: 404,
          error: 'Not found',
          message: 'Either resource not found or you are not authorized to perform the operation.'
        })
    })

    it('should read correct record - by id', async () => {
      const ret = await api
        .get(`/v1/sample/${_sample._id}`)
        .expect(200)

        expect(ret.body.foo).toBe(testData.foo)
    })

    it('should read correct record - query by name', async () => {
      const ret = await api
        .get(`/v1/sample?search=${_sample.foo}`)
        .expect(200)

        expect(ret.body.count).toBeGreaterThan(0)
        expect(ret.body.records[0].foo).toBe(_sample.foo)
    })
  })

  // ------------
  // -- UPDATE --
  // ------------

  describe('PATCH', () => {
    it('should update self', async () => {
      const ret = await api
        .patch(`/v1/sample/${_sample._id}`)
        .send({ foo: 'bars' })
        .expect(200)

        expect(ret.body.foo).toBe('bars')
    })
  })

  // ------------
  // -- DELETE --
  // ------------

  describe('DELETE', () => {
    it('should catch non existing record', async () => {
      await api
        .delete('/v1/sample/non-existing-id')
        .expect({
          statusCode: 404,
          error: 'Not found',
          message: 'Either resource not found or you are not authorized to perform the operation.'
        })
    })

    it('should delete record', async () => {
      const ret = await api
        .delete(`/v1/sample/${_sample._id}`)
        .expect(204)

        if (ret.statusCode === 204) {
          _sample = {} as ISample
        }
    })
  })
})
