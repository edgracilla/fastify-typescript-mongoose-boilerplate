import path from 'path'
import globby from 'globby'

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
  getPathInfo,
  getFiles,
  getDirs
}
