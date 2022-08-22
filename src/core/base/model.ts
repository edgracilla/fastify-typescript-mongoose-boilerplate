import { Redis } from 'ioredis'
import { Model } from 'mongoose'
import { FastifyInstance } from 'fastify'
import { detailedDiff } from 'deep-object-diff'
import { cloneDeep, isEqual, get } from 'lodash'

import serialize from 'fast-safe-stringify'

import { ISearchParams, IBaseModelCreateOption, AppDoc } from '../../declarations'

class BaseModel extends Model {
  static env: string
  static redis: Redis
  static cache: boolean
  static resource: string

  /** init */

  static _init(fastify: FastifyInstance) {
    this.env = process.env.NODE_ENV || 'development'
    this.cache = process.env.CACHE === 'true'
    this.resource = this.collection.name
    this.redis = fastify.redis[this.env]
  }

  /** create */

  static async _create(data: AppDoc, options: IBaseModelCreateOption = { cache: true }) {
    const cache = options.cache
    const model = new this()

    let doc = await model.set(data).save()

    doc = doc.toObject()

    if (this.cache && cache) {
      const key = this._genKey(doc._id)
      await this.redis.set(key, serialize(doc))
    }

    doc.changeLog = { created: true }

    return doc
  }

  /** read */

  static async _read (_id: string | object) {
    let doc = null

    if (!_id) return null

    if (typeof _id === 'object') {
      return await this.findOne(_id).exec()
    }

    if (this.cache) {
      const key = this._genKey(_id)
      const strDoc = await this.redis.get(key)

      doc = JSON.parse(strDoc || 'null')
    }

    if (!doc) {
      doc = await this.findOne({ _id }).exec()
      if (!doc) return doc

      doc = doc.toObject()

      if (this.cache) {
        const key = this._genKey(doc._id)
        await this.redis.set(key, serialize(doc))
      }
    }

    return doc
  }

  /** update */

  static async _update(query: object, update: AppDoc, hard: boolean = false) {
    let doc = await this.findOne(query).exec()
    if (!doc) return null

    const updKeys = Object.keys(update)

    const plainDoc = doc.toObject()
    const oldDoc = cloneDeep(plainDoc)

    const mergeUnique = function (arr1: Array<unknown>, arr2: Array<unknown>) {
      return arr1.concat(arr2).reduce((accum: Array<unknown>, item: unknown) => {
        for (let i = 0; i < accum.length; i++) {
          if (isEqual(accum[i], item)) return accum
        }

        return [...accum, item]
      }, [])
    }

    if (hard) {
      // hard update (if array, overwrite array values with new ones)
      updKeys.forEach(key => { doc[key] = get(update, key) })
    } else {
      // soft update (if array, append new items to existing array)
      const updClone: { [key: string]: any } = cloneDeep(update)

      updKeys.forEach((key: string) => {
        doc[key] = Array.isArray(doc[key])
          ? mergeUnique(plainDoc[key], updClone[key])
          : updClone[key]
      })
    }

    const modifieds = doc.modifiedPaths()
    let updDoc = await doc.save()

    updDoc = updDoc.toObject()

    if (this.cache) {
      const key = this._genKey(updDoc._id)
      await this.redis.set(key, serialize(updDoc))
    }

    if (modifieds.length) {
      updDoc.changeLog = detailedDiff(oldDoc, updDoc)
      updDoc.modifieds = modifieds
    }

    return updDoc
  }

  /** delete */

  static async _delete(_id: string) {
    let doc = await this.findOne({ _id }).exec()

    if (!doc) return null

    await doc.remove()

    if (this.cache) {
      const key = this._genKey(_id)
      await this.redis.del(key)
    }

    return true
  }

  static async _deleteMany(query: object) {
    let docs = []

    if (this.cache) {
      docs = await this.find(query).select('_id').exec()
    }

    let ret = await this.deleteMany(query)

    if (this.cache && ret.deletedCount) {
      const pipe = this.redis.pipeline()
      const keys = docs.map(item => this._genKey(item._id))

      // @ts-ignore: del rejects string[]
      await pipe.del(keys).exec()
    }

    return true
  }

  /** search */

  static async _search(filter: object, options: ISearchParams = {}, hasNear: boolean = false) {
    let { sort, page, limit } = options

    // TODO: cache ttl 10-15min use node-cache

    const query = this.find(filter)
    const cquery = this.find(filter)

    page = +(page || 1)
    limit = +(limit || 25)

    query.lean()
    query.limit(limit)
    query.skip(limit * (page > 0 ? page - 1 : 0))

    if (sort) {
      query.collation({ locale: 'en' })
      query.sort(sort)
    }

    let docs = await query.exec()

    const count = hasNear
      ? await cquery.count() // deprecated but working with $near query
      : await cquery.countDocuments() // throws Invalid context err if it has $near

    return {
      page,
      count,
      limit,
      pages: Math.ceil(count / limit),
      records: docs
    }
  }

  /** helper */

  private static _genKey (_id: string) {
    return `${this.env}:${this.resource}:${_id}`
  }
}

export default BaseModel
