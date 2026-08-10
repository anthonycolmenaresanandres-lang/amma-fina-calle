# Table Duel — room server

The live half of the bar game. Guests at one table each open the game on their
own phone, one of them starts a room and reads out a four-letter code, and the
table plays a hidden-fleet duel against each other. Step 2 (table vs table)
reuses this same server with no protocol change — a table simply becomes a side.

The web client lives in `APP/web/src/app/table-duel/`.

## What it stores

Rooms live in memory only: a code, nicknames, and grids. No database, no disk,
no secrets, no customer records. A restart drops in-progress rounds and nothing
else; empty rooms are deleted immediately and idle rooms after two hours.

Fleets never leave the server — each player is sent their own board plus, for
everyone else, only the squares already fired at. There is nothing useful to
read in the network tab.

## Run it

```bash
npm install
npm start            # listens on :8080, health at /healthz
npm test             # rule tests (9)
npx tsx src/smoke.ts ws://127.0.0.1:8080   # 3 clients play a full round
```

`smoke.ts` prints a single `SMOKE_RESULT {"ok":true,...}` line — parse that, not
the log output.

## Deploy (Render)

Render → New → Blueprint → this repo, root directory `services/table-duel`
(`render.yaml` carries the rest). No environment secrets are required; `PORT` is
supplied by the blueprint.

The blueprint asks for the **starter** plan because Render's free tier sleeps
after inactivity, and a sleeping room server means a guest scans the QR and
waits about thirty seconds for the first round. Free is fine while testing.

Once it is live, point the web app at it:

```
NEXT_PUBLIC_TABLE_DUEL_WS = wss://<your-render-host>
```

Without that variable the game page says it is not switched on yet rather than
failing at a blank screen.

## Protocol

Client → server: `create`, `join`, `place`, `fire`, `again`.
Server → client: `joined`, `state` (personalised), `error`.

Board rules live in `src/game.ts` as pure functions, which is why they can be
tested without a socket. `src/server.ts` only handles sockets, turns and
cleanup.
