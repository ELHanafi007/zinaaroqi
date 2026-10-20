# OpenWA free mode

For a standalone server installation, upload this folder and follow **[DEPLOY.md](DEPLOY.md)**. Configure the website connection in **Dashboard → WhatsApp → WhatsApp server settings**.

The app uses `POST /api/messages/sendText` to send the saved public listing title, category, listing type, availability, formatted price, room details, full description, property URL, Google Maps URL and TikTok video link. Arabic/English labels are chosen before sending; saved titles/descriptions are not automatically translated. Images are excluded from WhatsApp messages. It does not use paid interactive buttons. Owner and tenant details are excluded. The service config ignores license keys so an invalid paid key cannot block free startup.

## Local setup

From the project root:

```sh
npm run openwa:setup
npm run openwa:start
```

Setup generates missing `OPENWA_API_URL` and `OPENWA_API_KEY` settings in ignored `.env.local`, preserving existing values. Startup loads `.env` and `.env.local`, installs isolated dependencies on first run, and runs OpenWA under Node 22.22.2. Compatible Effect packages are pinned in the service package.

If an old service is running, stop it with Ctrl+C first. Keep the new terminal open. Sign in as admin at `http://localhost:3000/dashboard/whatsapp` and scan the QR using WhatsApp → Linked devices. Existing authenticated browser profiles are preserved.

## Sending

Listing staff can open a public property and use **Send from office WhatsApp**. Enter an international recipient number and send. Free automation may restrict sending to numbers that are not saved contacts. In that case use the existing **Share on WhatsApp** action to send manually. Do not automatically retry an ambiguous send; check the office WhatsApp first.

## Remote deployment

Run OpenWA on a persistent browser host, separate from the website. Set `OPENWA_API_URL` to an authenticated HTTPS gateway and `OPENWA_API_KEY` to the matching secret on the website server. Also configure `SITE_URL` to the public property website.

Forward `POST /api/messages/sendText`; if pairing remotely, also forward `GET /health` with gateway-enforced API-key authentication. OpenWA's own health route is public and contains pairing data, so never expose it without gateway authentication. The app's pairing endpoint is admin-only and returns only the QR image and sanitized status.

OpenWA is unofficial WhatsApp automation; account restrictions remain possible. References: [API methods](https://openwa.dev/docs/reference/client/messages), [setup](https://openwa.dev/docs/getting-started/easy-api).

The app now also requires authenticated `GET /office/connection`, supplied by
`server.mjs`. Restart with `npm run openwa:start` after updating. This checks the
active WhatsApp browser UI because OpenWA 5.1 account methods can fail even
while `/health` retains a ready startup snapshot. Forward this endpoint through
the private gateway along with the existing endpoints.

Run the website and WhatsApp independently in two terminals:

```sh
# Terminal 1 — website only
npm run dev

# Terminal 2 — office WhatsApp only
npm run openwa
```

`npm run openwa:start` remains available as an alias. Restarting the website
no longer restarts the WhatsApp service.

Incoming WhatsApp TikTok lookup:
- A private incoming message containing a TikTok URL triggers the authenticated
  `POST /api/webhooks/whatsapp` endpoint on the website.
- The default endpoint is `http://127.0.0.1:3000/api/webhooks/whatsapp`.
  Set `WHATSAPP_WEBHOOK_URL` when the website runs elsewhere (HTTPS remotely).
- Replies match public listings by video ID or saved link, resolve TikTok short
  links, and use Arabic by default (`WHATSAPP_REPLY_LOCALE=en` for English).
- Unknown links receive no reply. Private listings and office-only owner/tenant
  information are excluded. Message IDs are stored to prevent duplicate sends.
- Restart `npm run openwa` once to enable the incoming message listener.
