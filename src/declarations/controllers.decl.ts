import { FastifyInstance } from 'fastify'
import { IMeta, SearchQuery, ISearchResult } from './index'
import { AppDoc, ITemplateModel, ISampleModel } from './index'

declare class BaseController {
  public getSchema: {}
  public postSchema: {}
  public patchSchema: {}

  create (data: AppDoc, meta: IMeta): Promise<AppDoc>
  read (_id: string, meta: IMeta): Promise<AppDoc>
  update (_id: string, data: AppDoc, meta: IMeta): Promise<AppDoc>
  delete (_id: string, meta: IMeta): Promise<boolean>
  search (options: SearchQuery): Promise<ISearchResult>
}

export declare class SampleController extends BaseController {
  private model: ISampleModel
  constructor (fastify: FastifyInstance)
}

export declare class TemplateController extends BaseController {
  private model: ITemplateModel
  constructor (fastify: FastifyInstance)
}

export type ControllerClasses = TemplateController | SampleController
