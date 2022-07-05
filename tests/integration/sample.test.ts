import { agent } from 'supertest'
import app from '../../index'

import { ISample } from '../../src/declarations'
import { SampleModel } from '../../src/modules/models'

const api = agent(app.server)

let _sample: ISample

describe('sample', () => {
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

  describe('Create Sample', () => {
    it('should catch required field validation', async () => {
      await api
        .post('/sample')
        .send({})
        .expect({
          statusCode: 400,
          error: 'Bad Request',
          message: "body must have required property 'foo', body must have required property 'bar'"
        })
    })

    it('should create sample', async () => {
      const ret = await api
        .post('/sample')
        .send({ foo: 'bar', bar: 'foo' })
        .expect(201)

        _sample = ret.body
    })
  })

  // ------------
  // -- READ --
  // ------------

  describe('Read', () => {
    it('should catch non existing record', async () => {
      const ret = await api
        .get('/sample/non-existing-id')
        .expect({
          statusCode: 404,
          error: 'Not found',
          message: 'Either resource not found or you are not authorized to perform the operation.'
        })
    })

    it('should read correct record - by id', async () => {
      const ret = await api
        .get(`/sample/${_sample._id}`)
        .expect(200)

        expect(ret.body.foo).toBe('bar')
    })

    it('should read correct record - query by name', async () => {
      const ret = await api
        .get(`/sample?search=${_sample.foo}`)
        .expect(200)

        expect(ret.body.count).toBe(1)
        expect(ret.body.records[0].foo).toBe(_sample.foo)
    })
  })

  // ------------
  // -- UPDATE --
  // ------------

  describe('Update', () => {
    it('should update self', async () => {
      const ret = await api
        .patch(`/sample/${_sample._id}`)
        .send({ foo: 'bars' })
        .expect(200)

        expect(ret.body.foo).toBe('bars')
    })
  })

  // ------------
  // -- DELETE --
  // ------------

  describe('Delete', () => {
    it('should catch non existing record', async () => {
      await api
        .delete('/sample/non-existing-id')
        .expect({
          statusCode: 404,
          error: 'Not found',
          message: 'Either resource not found or you are not authorized to perform the operation.'
        })
    })

    it('should delete record', async () => {
      const ret = await api
        .delete(`/sample/${_sample._id}`)
        .expect(204)

        if (ret.statusCode === 204) {
          _sample = {} as ISample
        }
    })
  })
})
