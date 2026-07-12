var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/dotenv@17.4.2/node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/.pnpm/dotenv@17.4.2/node_modules/dotenv/lib/main.js"(exports, module) {
    "use strict";
    var fs = __require("fs");
    var path = __require("path");
    var os = __require("os");
    var crypto2 = __require("crypto");
    var TIPS = [
      "\u25C8 encrypted .env [www.dotenvx.com]",
      "\u25C8 secrets for agents [www.dotenvx.com]",
      "\u2301 auth for agents [www.vestauth.com]",
      "\u2318 custom filepath { path: '/custom/path/.env' }",
      "\u2318 enable debugging { debug: true }",
      "\u2318 override existing { override: true }",
      "\u2318 suppress logs { quiet: true }",
      "\u2318 multiple files { path: ['.env.local', '.env'] }"
    ];
    function _getRandomTip() {
      return TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    function parseBoolean(value) {
      if (typeof value === "string") {
        return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
      }
      return Boolean(value);
    }
    function supportsAnsi() {
      return process.stdout.isTTY;
    }
    function dim(text) {
      return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
    }
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.error(`\u26A0 ${message}`);
    }
    function _debug(message) {
      console.log(`\u2506 ${message}`);
    }
    function _log(message) {
      console.log(`\u25C7 ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
      const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (debug || !quiet) {
        _log("loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
      let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("no encoding is specified (UTF-8 is used by default)");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`failed to load ${path2} ${e.message}`);
          }
          lastError = e;
        }
      }
      const populated = DotenvModule.populate(processEnv, parsedAll, options);
      debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
      quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
      if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injected env (${keysCount}) from ${shortPaths.join(",")} ${dim(`// tip: ${_getRandomTip()}`)}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config2(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`you set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto2.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      const populated = {};
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
            populated[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
          populated[key] = parsed[key];
        }
      }
      return populated;
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config: config2,
      decrypt,
      parse,
      populate
    };
    module.exports.configDotenv = DotenvModule.configDotenv;
    module.exports._configVault = DotenvModule._configVault;
    module.exports._parseVault = DotenvModule._parseVault;
    module.exports.config = DotenvModule.config;
    module.exports.decrypt = DotenvModule.decrypt;
    module.exports.parse = DotenvModule.parse;
    module.exports.populate = DotenvModule.populate;
    module.exports = DotenvModule;
  }
});

// src/index.ts
import { Hono as Hono2 } from "hono";
import { serve } from "@hono/node-server";

// src/lib/mongo/client.ts
import mongoose from "mongoose";
var _client;
var connect = async (mongoUri) => {
  if (!_client) {
    _client = await mongoose.connect(mongoUri, { authSource: "admin" });
    _client.connection.on("connected", () => {
      console.log("Connected to MongoDB");
    });
    _client.connection.on("error", (err) => {
      console.error("Error connecting to MongoDB", err);
    });
    _client.connection.on("disconnected", () => {
      console.log("Disconnected from MongoDB");
    });
    _client.connection.on("reconnected", () => {
      console.log("Reconnected to MongoDB");
    });
    _client.connection.on("reconnectFailed", (err) => {
      console.error("Reconnect failed", err);
    });
    _client.connection.on("close", () => {
      console.log("Connection closed");
    });
    _client.connection.on("fullsetup", () => {
      console.log("Full setup");
    });
  }
  return _client;
};

// src/lib/redis/client.ts
import { createClient } from "redis";
var _client2;
var connectRedis = async (redisUri, redisPassword) => {
  if (!_client2) {
    _client2 = createClient({
      url: redisUri,
      password: redisPassword
    });
    await _client2.connect();
    _client2.on("error", (err) => {
      console.error("Redis error", err);
    });
    _client2.on("connect", () => {
      console.log("Redis connected");
    });
    _client2.on("disconnect", () => {
      console.log("Redis disconnected");
    });
  }
  return _client2;
};

// src/modules/auth/routes.ts
import { Hono } from "hono";

// src/modules/auth/request-schema.ts
import z from "zod";
var UserRegistrationSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(32)
});
var UserLoginSchema = UserRegistrationSchema;

// src/modules/auth/service.ts
import { compare, hash } from "bcrypt";

// src/modules/auth/mongo-model.ts
import mongoose2 from "mongoose";
var _userSchema = new mongoose2.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }
});
var User = mongoose2.model("User", _userSchema);

// src/modules/auth/errors.ts
var InvalidCredentialsError = class extends Error {
  name = "InvalidCredentialsError";
};
var UserEmailNotRegisteredError = class extends InvalidCredentialsError {
  constructor() {
    super("UserEmailNotRegisteredError");
    this.message = "User email not registered";
  }
};
var UserEmailPasswordMismatchError = class extends InvalidCredentialsError {
  constructor() {
    super("UserEmailPasswordMismatchError");
    this.message = "User email and password mismatch";
  }
};
var UserEmailAlreadyExistsError = class extends InvalidCredentialsError {
  constructor() {
    super("UserEmailAlreadyExistsError");
    this.message = "User email already exists";
  }
};
var InvalidFormDataError = class extends InvalidCredentialsError {
  constructor() {
    super("InvalidFormDataError");
    this.message = "Invalid form data";
  }
};

// src/constants/jwt.ts
var JWT_CONFIG = Object.freeze({
  ISSUER: "task-tracker-backend",
  AUDIENCE: "task-tracker-frontend",
  SUBJECT: "task-tracker-token",
  ACCESS_TOKEN_EXPIRATION: "15m",
  REFRESH_TOKEN_EXPIRATION: "30d"
});

// src/modules/auth/service.ts
import jwt from "jsonwebtoken";

// src/constants/environment.ts
var import_dotenv = __toESM(require_main());
(0, import_dotenv.config)();
var requiredEnvironmentVariables = [
  "MONGO_URI",
  "REDIS_URI",
  "REDIS_PASSWORD",
  "RABBITMQ_URI",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "ENVIRONMENT_TYPE",
  "PORT"
];
var ENVIRONMENT_CONFIG = {
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URI: process.env.REDIS_URI,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  RABBITMQ_URI: process.env.RABBITMQ_URI,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ENVIRONMENT_TYPE: process.env.ENVIRONMENT_TYPE,
  PORT: parseInt(process.env.PORT) || 4e3
};
var checkMissingRequiredEnvironmentVariables = (config2) => {
  for (const variable of requiredEnvironmentVariables) {
    if (!process.env[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  }
};

// src/modules/auth/service.ts
import { setCookie } from "hono/cookie";
var checkIfUserExists = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new UserEmailNotRegisteredError();
  }
  const isMatchingPassword = await compare(password, user.password);
  if (!isMatchingPassword) {
    throw new UserEmailPasswordMismatchError();
  }
  return user;
};
var createUser = async (email, password) => {
  try {
    const hashedPassword = await hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });
    return newUser;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11e3) {
      throw new UserEmailAlreadyExistsError();
    }
    throw error;
  }
};
var createAccessToken = async (userId) => {
  const accessToken = jwt.sign({ userId }, ENVIRONMENT_CONFIG.ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRATION,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
    subject: JWT_CONFIG.SUBJECT
  });
  return accessToken;
};
var setAccessTokenInCookie = async (context, accessToken) => {
  setCookie(context, "access_token", accessToken, {
    httpOnly: true,
    secure: ENVIRONMENT_CONFIG.ENVIRONMENT_TYPE === "production",
    path: "/",
    maxAge: 60 * 15,
    // 15 minutes
    sameSite: "lax"
  });
};
var setRefreshTokenInCookie = async (context, refreshToken) => {
  setCookie(context, "refresh_token", refreshToken, {
    httpOnly: true,
    secure: ENVIRONMENT_CONFIG.ENVIRONMENT_TYPE === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    // 30 days
    sameSite: "lax"
  });
};
var createRefreshToken = async (userId) => {
  const refreshToken = jwt.sign({ userId }, ENVIRONMENT_CONFIG.REFRESH_TOKEN_SECRET, {
    expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRATION,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
    subject: JWT_CONFIG.SUBJECT
  });
  return refreshToken;
};

// src/lib/rmq/config.ts
var USER_SIGNUP_EMAIL_QUEUE = "user-signup-email";

// src/lib/rmq/publishers/user-signup.publisher.ts
var publishUserSignupEmail = async (recipientEmail, channel) => {
  await channel.assertQueue(USER_SIGNUP_EMAIL_QUEUE, { durable: true });
  const event = {
    id: crypto.randomUUID(),
    name: "user-signup-email",
    version: "v1",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    data: {
      recipientEmail
    }
  };
  const isPublished = channel.sendToQueue(
    USER_SIGNUP_EMAIL_QUEUE,
    Buffer.from(JSON.stringify(event))
  );
  if (!isPublished) {
    console.error(`Failed to publish user signup email to ${recipientEmail}`);
  } else {
    console.log(`Sent user signup email to ${recipientEmail}`);
  }
  return isPublished;
};

// src/lib/rmq/client.ts
import { connect as connect2 } from "amqplib";
var _client3;
var connectRMQ = async (uri) => {
  if (!_client3) {
    _client3 = await connect2(uri);
    _client3.on("error", (err) => {
      console.error("RMQ error", err);
    });
    _client3.on("close", () => {
      console.log("RMQ disconnected");
    });
  }
  return _client3;
};

// src/lib/rmq/channels/user-signup-email.ts
var _userSignupEmailChannel;
var initializeUserSignupEmailChannel = async () => {
  if (!_client3) {
    throw new Error("RMQ client not connected");
  }
  if (_userSignupEmailChannel) return;
  _userSignupEmailChannel = await _client3.createChannel();
};

// src/modules/auth/controller.ts
var validateUserRegistrationRequest = async (context) => {
  const formData = await context.req.formData();
  const email = formData.get("email")?.toString().toLowerCase() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const parsed = UserRegistrationSchema.safeParse({ email, password });
  if (!parsed.success) {
    throw new InvalidFormDataError();
  }
  return parsed.data;
};
var registerUser = async (context) => {
  const parsedData = await validateUserRegistrationRequest(context);
  try {
    await createUser(parsedData.email, parsedData.password);
    if (_userSignupEmailChannel) {
      await publishUserSignupEmail(parsedData.email, _userSignupEmailChannel);
    }
    return context.json({ success: true, message: "User registered successfully" }, 201);
  } catch (error) {
    console.error(error);
    if (error instanceof UserEmailAlreadyExistsError) {
      return context.json(
        {
          message: "User with this email already exists",
          error: error.message,
          success: false
        },
        409
      );
    }
    if (error instanceof InvalidFormDataError) {
      return context.json(
        {
          message: "Invalid form data",
          error: error.message,
          success: false
        },
        400
      );
    }
    return context.json(
      {
        message: "Failed to register user",
        error: "Something went wrong",
        success: false
      },
      500
    );
  }
};
var validateUserLoginRequest = async (context) => {
  const formData = await context.req.formData();
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const parsed = UserLoginSchema.safeParse({ email, password });
  if (!parsed.success) {
    throw new InvalidFormDataError();
  }
  return parsed.data;
};
var loginUser = async (context) => {
  const parsedData = await validateUserLoginRequest(context);
  try {
    const user = await checkIfUserExists(parsedData.email, parsedData.password);
    const accessToken = await createAccessToken(user._id.toString());
    const refreshToken = await createRefreshToken(user._id.toString());
    await setAccessTokenInCookie(context, accessToken);
    await setRefreshTokenInCookie(context, refreshToken);
    await _client2?.set(`refresh:${user._id}`, refreshToken, {
      expiration: {
        type: "EX",
        value: 60 * 60 * 24 * 30
        // 30 days
      }
    });
    return context.json({ success: true, message: "Login successful" }, 200);
  } catch (error) {
    console.error(error);
    if (error instanceof InvalidFormDataError) {
      return context.json(
        {
          message: "Invalid form data",
          error: error.message,
          success: false
        },
        400
      );
    }
    if (error instanceof UserEmailNotRegisteredError) {
      return context.json(
        {
          message: "User email not registered",
          error: error.message,
          success: false
        },
        401
      );
    }
    if (error instanceof UserEmailPasswordMismatchError) {
      return context.json(
        {
          message: "User email and password mismatch",
          error: error.message,
          success: false
        },
        401
      );
    }
    return context.json(
      {
        message: "Failed to login",
        error: "Something went wrong",
        success: false
      },
      500
    );
  }
};

// src/modules/auth/routes.ts
var authRouter = new Hono();
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

// src/index.ts
var app = new Hono2();
app.route("/auth", authRouter);
var startServer = async () => {
  checkMissingRequiredEnvironmentVariables(ENVIRONMENT_CONFIG);
  await connect(ENVIRONMENT_CONFIG.MONGO_URI).catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });
  await connectRedis(ENVIRONMENT_CONFIG.REDIS_URI, ENVIRONMENT_CONFIG.REDIS_PASSWORD).catch(
    (err) => {
      console.error("Error connecting to Redis", err);
      process.exit(1);
    }
  );
  await connectRMQ(ENVIRONMENT_CONFIG.RABBITMQ_URI).catch((err) => {
    console.error("Error connecting to RMQ", err);
    process.exit(1);
  });
  await initializeUserSignupEmailChannel().catch((err) => {
    console.error("Error initializing user signup email channel", err);
    process.exit(1);
  });
  serve({
    ...app,
    port: ENVIRONMENT_CONFIG.PORT
  });
};
startServer().catch((err) => {
  console.error("Fatal error: could not start server", err);
  process.exit(1);
});
