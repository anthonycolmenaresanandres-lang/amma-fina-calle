# Owner Portal App Runbook

## Decision

Phase 1 is a Progressive Web App (PWA) layer over the existing `/owner/[id]` portal. It preserves one codebase, one stable owner URL, current authorization, current billing logic, and automatic web releases. No App Store account, native rewrite, or duplicated customer data is required.

Use a native wrapper later only if verified demand requires store distribution, native push, background tasks, or device APIs that the browser cannot provide.

## Architecture

For restaurant id `colattao`:

- Owner app: `/owner/colattao`
- Manifest: `/owner/colattao/manifest.webmanifest`
- Icons: `/owner/colattao/app-icon/192` and `/owner/colattao/app-icon/512`
- App id/start URL/scope: `/owner/colattao`
- Display: `standalone`

The same pattern works for every safe lowercase tenant id. The browser installation launches the owner directly at their tenant route; authentication and server authorization still run on every protected request.

## Security and caching boundary

- The manifest and generated icons are public and cacheable.
- Owner pages, sessions, menu mutations, requests, billing, Stripe, and Zelle are not added to an offline cache.
- No service worker is included in Phase 1. This avoids stale authenticated or billing state and keeps the app online-only.
- Installing the app does not grant access. A valid authorized owner session remains required.
- Never encode a credential, email, payment identifier, or token in the manifest, icon, start URL, or wall QR.

## Owner installation

### Android — Chrome

1. Open the restaurant's exact owner URL.
2. Sign in and confirm the correct business name.
3. Open Chrome's menu and choose **Install app** or **Add to Home screen**.
4. Launch the new **Fina Owner** icon and verify it returns to the same restaurant portal.

### iPhone/iPad — Safari

1. Open the exact owner URL in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**, confirm the name, and tap **Add**.
4. Launch the icon and verify the correct portal and authorization state.

### Windows/macOS — Chrome or Edge

1. Open the exact owner URL.
2. Use the install icon in the address bar or the browser's **Install app** menu item.
3. Launch the installed app window and verify the tenant route.

## New-client replication

1. Complete the standard tenant, menu, owner access, and billing onboarding gates.
2. Verify `/owner/{id}` on mobile and confirm the manifest contains the same tenant id in `id`, `start_url`, and `scope`.
3. Verify both icon sizes return PNG responses.
4. Generate the wall QR from the stable owner URL only; do not include passwords or login tokens.
5. Test the QR on a second device, then provide the installation instructions.
6. Record owner installation and owner confirmation in the private onboarding record.

## Release gate

Before production:

- run `npm.cmd run owner-app:selftest`;
- run targeted ESLint and `tsc --noEmit`;
- run the production build;
- verify manifest content type and fields;
- verify 192 and 512 icon dimensions;
- verify 320 px and 390 px owner sign-in without overflow;
- verify an installed launch still requires the correct authorized session;
- stop before merge/deploy/customer instruction without Anthony's approval.
