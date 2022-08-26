import { FastifyInstance } from 'fastify'

import { BaseController } from './base.decl'
import { ITemplateModel, ISampleModel } from './models.decl'

export declare class SampleController extends BaseController {
  public model: ISampleModel
  constructor (fastify: FastifyInstance)
}

export declare class TemplateController extends BaseController {
  public model: ITemplateModel
  constructor (fastify: FastifyInstance)
}

export type ControllerClasses = TemplateController | SampleController
