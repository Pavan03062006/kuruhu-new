# Catalyst TTS function

This folder deploys as a Zoho Catalyst **Advanced I/O** function named `tts`.

Configure these environment variables separately in the Catalyst Development and
Production environments:

- `CATALYST_CLIENT_ID`
- `CATALYST_CLIENT_SECRET`
- `CATALYST_TTS_REFRESH_TOKEN`
- `CATALYST_ORG` (optional when using the existing project organization)
- `CATALYST_REDIRECT_URI` (must match the OAuth client's registered redirect URI;
  defaults to `http://www.zoho.com/catalyst`)
- `TTS_ALLOWED_ORIGINS` (optional comma-separated custom domains)

`CATALYST_TTS_REFRESH_TOKEN` must be the refresh token returned by Zoho's OAuth
token exchange for the `QuickML.deployment.READ` scope. Request offline access
when authorizing so Zoho returns a refresh token. Do not store the temporary
authorization code in this variable, and never commit any token to this
repository.

After deploying, the production function URL has this form:

```text
https://<project-domain>.catalystserverless.com/server/tts/
```

Set that URL as `NEXT_PUBLIC_TTS_FUNCTION_URL` in the Slate build environment
when the frontend should call the function directly. If it is not set, the
chatbot uses the same-origin `/api/tts/` route. When Zoho TTS is unavailable, the
chatbot automatically falls back to the browser's speech synthesis engine.
