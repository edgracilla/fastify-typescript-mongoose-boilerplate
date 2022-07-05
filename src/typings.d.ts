declare module 'mongo-querystring' {
  export = class MongoQS {
    constructor(options: any)
    public parse (params: any): any
  }
}

declare module 'ioredis-mock' {
  import Redis from 'ioredis'
  export default Redis
}
