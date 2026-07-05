const JWT_CONFIG = Object.freeze({
  ISSUER: 'task-tracker-backend',
  AUDIENCE: 'task-tracker-frontend',
  SUBJECT: 'task-tracker-token',
  ACCESS_TOKEN_EXPIRATION: '15m',
  REFRESH_TOKEN_EXPIRATION: '30d',
})

export { JWT_CONFIG }
