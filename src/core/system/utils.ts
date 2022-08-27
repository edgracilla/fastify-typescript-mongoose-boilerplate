import path from 'path'
import globby from 'globby'
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

export default {
  nanoidCustom,
  getPathInfo,
  getFiles,
  getDirs
}
