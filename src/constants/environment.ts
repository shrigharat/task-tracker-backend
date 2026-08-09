import { config } from 'dotenv'

config()

const requiredEnvironmentVariables = [
  'MONGO_URI',
  'REDIS_URI',
  'REDIS_PASSWORD',
  'RABBITMQ_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'ENVIRONMENT_TYPE',
  'PORT',
  'CORS_ALLOWED_ORIGINS',
]

const ENVIRONMENT_CONFIG = {
  MONGO_URI: process.env.MONGO_URI!,
  REDIS_URI: process.env.REDIS_URI!,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
  RABBITMQ_URI: process.env.RABBITMQ_URI!,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
  ENVIRONMENT_TYPE: process.env.ENVIRONMENT_TYPE!,
  PORT: parseInt(process.env.PORT!) || 4000,
  CORS_ALLOWED_ORIGINS: (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}

const checkMissingRequiredEnvironmentVariables = (config: typeof ENVIRONMENT_CONFIG) => {
  for (const variable of requiredEnvironmentVariables) {
    if (!process.env[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`)
    }
  }

  if (config.CORS_ALLOWED_ORIGINS.length === 0) {
    throw new Error('CORS_ALLOWED_ORIGINS must contain at least one origin')
  }
}

export { ENVIRONMENT_CONFIG, checkMissingRequiredEnvironmentVariables }
