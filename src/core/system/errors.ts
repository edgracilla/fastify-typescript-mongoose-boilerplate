export class ValidationError extends Error {
  statusCode: number
  data: unknown[]

  constructor (message: string, data?: unknown[]) {
    super(message)
    this.statusCode = 400
    this.name = 'ValidationError'
    this.data = data || []
  }
}

export class AuthError extends Error {
  statusCode: number
  data: unknown[]

  constructor (message: string, data?: unknown[]) {
    super(message)
    this.statusCode = 401
    this.name = 'AuthError'
    this.data = data || []
  }
}

export class ForbiddenError extends Error {
  statusCode: number
  data: unknown[]

  constructor (message: string, data?: unknown[]) {
    super(message)
    this.statusCode = 403
    this.name = 'ForbiddenError'
    this.data = data || []
  }
}

export class NotFoundError extends Error {
  statusCode: number
  data: unknown[]

  constructor (message: string, data?: unknown[]) {
    super(message)
    this.statusCode = 404
    this.name = 'NotFoundError'
    this.data = data || []
  }
}
