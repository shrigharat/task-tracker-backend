# Backend TODOs

Deferred improvements (from auth review):

1. Refresh token storage hardening
- Store hashed refresh tokens (not raw token values) in Redis.
- Add token rotation + `jti` tracking to prevent replay.
- Support revocation per session/device instead of single key per user.

2. Hot-reload safe model export pattern
- Change model export to `mongoose.models.User || mongoose.model('User', schema)`.
- Avoid model overwrite/redefinition issues in watch/dev mode.

3. Switch auth payloads from `formData()` to JSON
- Update `/auth/register` and `/auth/login` to parse `req.json()`.
- Validate `Content-Type: application/json` and keep Zod validation.

4. Harden Mongo connection singleton for concurrency
- Initialize client holder to `null`.
- Add a shared `connectPromise` lock so parallel callers await one connect attempt.
- Keep startup bootstrap gated on successful connection.
