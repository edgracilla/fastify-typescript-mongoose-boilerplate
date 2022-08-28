import path from 'path'
import globby from 'globby'
import MongoQS from 'mongo-querystring'
import { customAlphabet } from 'nanoid'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'

export const nanoidCustom = () => {
  return customAlphabet(alphabet, 21)()
}

export const getDirs = (srcPath: string) => {
  return globby
    .sync(srcPath, { onlyDirectories: true })
    .map(dir => path.basename(dir))
}

export const getFiles = (srcPath: string) => {
  return globby.sync(srcPath)
}

export const getPathInfo = (_dirname: string) => {
  const resource = path.basename(_dirname)
  const version = path.basename(path.resolve(_dirname, '..'))
  const modelName = `${version}-${resource}`

  return { resource, version, modelName }
}

export const makeMongoQS = (params: string[]) => {
  const whiteParams = params
    .filter(Boolean)
    .reduce((accum, key) => {
      accum[key] = true
      return accum
    }, {} as Record<string, boolean>)

  return new MongoQS({
    whitelist: whiteParams,
    blacklist: {
      page: true,
      sort: true,
      limit: true,
      near: true,
      search: true,
    }
  })
}

export default {
  nanoidCustom,
  getPathInfo,
  getFiles,
  getDirs
}
