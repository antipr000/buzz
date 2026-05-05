# 🐝 Buzz — Event App

A full-stack event discovery and ticketing platform.

- **Backend (`be/`)** — FastAPI + SQLAlchemy 2.0, database & auth via [Supabase](https://supabase.com), managed by [uv](https://github.com/astral-sh/uv)
- **Frontend (`fe/`)** — React Native (Expo SDK 54) with NativeWind, targeting Android & iOS

---

## Prerequisites

| Tool | Install |
|------|---------|
| [uv](https://github.com/astral-sh/uv) (Python ≥ 3.12) | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| [Node.js](https://nodejs.org/) ≥ 20 LTS | From nodejs.org |
| [Android Studio](https://developer.android.com/studio) | For local dev builds & emulator |
| [Supabase account](https://supabase.com) | Free tier — provides Postgres DB and auth |

---

## Running Locally

### Backend

> Run from the `be/` directory.

```bash
cd be
cp .env.example .env   # fill in Supabase DB credentials and other values
uv sync
uv run alembic upgrade head
uv run main.py
```

**Supabase DB credentials** — get them from **Supabase Dashboard → Project Settings → Database → Session Pooler**:

```ini
DB_HOST=aws-0-<region>.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.<your-project-ref>
DB_PASSWORD=<your-db-password>
SUPABASE_URL=https://<your-project-ref>.supabase.co
```

API runs at **http://localhost:8000** · Swagger docs at **http://localhost:8000/docs**

---

### Frontend

> Run from the `fe/` directory.

```bash
cd fe
cp .env.example .env   # fill in Supabase keys, API URL, Google Places key
npm install
npx expo start
```

**`EXPO_PUBLIC_API_URL`** — depends on how your phone is connected:

| Connection | Command | URL to use |
|---|---|---|
| with USB | `adb reverse tcp:8000 tcp:8000` | `http://localhost:8000/api/v1` |
| with Wi-Fi | — | `http://<your-computer-IP>:8000/api/v1` |

Run `adb reverse` once after plugging in. Then `localhost` on the phone tunnels straight to your machine.

---

### Web (browser)

```bash
cd fe
npx expo start 
```

Opens at **http://localhost:8081**. Most features work in the browser. Native-only APIs (camera, Razorpay, haptics) won't work on web.




## Running on a Device

### Expo Go (quick testing)

1. Install **[Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)** on your Android phone
2. Run `npx expo start` in `fe/`
3. Scan the QR code

> ⚠️ Expo Go doesn't support custom native modules (Razorpay, camera). Use a dev build for those.

---

### Local Development Build (via Android Studio)

A dev build is a full native APK installed directly on your device or emulator — supports all native modules.

**1. Build the APK locally**
```bash
cd fe
npx expo run:android
```
This compiles native code, installs the APK on your connected device/emulator, and starts Metro automatically. usb debugging should be enabled on your device and device should be connnected to the computer.

---


---

## Testing

### Backend

```bash
cd be
uv run pytest           # run all tests
uv run pytest -v        # verbose
uv run pytest tests/test_events_core.py::test_to_camel   # single test
```

---

## Environment Variables

### Backend (`be/.env`)

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Supabase session pooler host |
| `DB_PORT` | `5432` |
| `DB_NAME` | `postgres` |
| `DB_USER` | `postgres.<project-ref>` |
| `DB_PASSWORD` | DB password from Supabase |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID |
| `GCS_EVENT_COVERS_BUCKET` | GCS bucket for event covers |
| `GCS_PROFILE_AVATARS_BUCKET` | GCS bucket for avatars |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `PAYMENT_WEBHOOK_SECRET` | Razorpay webhook secret |

### Frontend (`fe/.env`)

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `EXPO_PUBLIC_API_URL` | Backend URL with `/api/v1` — use LAN IP for local dev |
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places API key |
| `EXPO_PUBLIC_RAZORPAY_CHECKOUT_LOGO_URL` | Logo URL in Razorpay sheet (optional) |

---

## Useful Links

- [FastAPI](https://fastapi.tiangolo.com/) · [SQLAlchemy 2.0](https://docs.sqlalchemy.org/en/20/) · [Alembic](https://alembic.sqlalchemy.org/en/latest/) · [uv](https://github.com/astral-sh/uv)
- [Supabase Docs](https://supabase.com/docs) · [Supabase JWKS](https://supabase.com/docs/guides/auth/jwks)
- [Expo Docs](https://docs.expo.dev/) · [Expo Router](https://docs.expo.dev/router/introduction/) · [NativeWind](https://www.nativewind.dev/)
- [Razorpay API](https://razorpay.com/docs/api/) 
