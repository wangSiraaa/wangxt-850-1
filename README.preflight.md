# Trae Preflight

This folder is prepared for `wangxt-850-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18150
- API_PORT: 19150
- WEB_PORT: 20150
- DB_PORT: 21150
- REDIS_PORT: 22150

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
