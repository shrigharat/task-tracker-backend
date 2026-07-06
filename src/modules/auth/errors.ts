class InvalidCredentialsError extends Error {
  name = 'InvalidCredentialsError'
}

class UserEmailNotRegisteredError extends InvalidCredentialsError {
  constructor() {
    super('UserEmailNotRegisteredError')
    this.message = 'User email not registered'
  }
}
class UserEmailPasswordMismatchError extends InvalidCredentialsError {
  constructor() {
    super('UserEmailPasswordMismatchError')
    this.message = 'User email and password mismatch'
  }
}
class UserEmailAlreadyExistsError extends InvalidCredentialsError {
  constructor() {
    super('UserEmailAlreadyExistsError')
    this.message = 'User email already exists'
  }
}
class InvalidFormDataError extends InvalidCredentialsError {
  constructor() {
    super('InvalidFormDataError')
    this.message = 'Invalid form data'
  }
}

export {
  UserEmailNotRegisteredError,
  UserEmailPasswordMismatchError,
  UserEmailAlreadyExistsError,
  InvalidFormDataError,
}
