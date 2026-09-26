# Friend fork archive note

> **Removed from this repo:** 25 September 2026  
> The nested partner tree (`vendor/friend-metacity/`, formerly `metacity/`) was deleted after merge Phases 0–10. All product assets, landing, Disaster Lab, AI Command, and Twin layers live under **root** `frontend/` + `backend/`.

## What we kept (attribution)

| Path | Why |
|---|---|
| `frontend/public/assets/**` | 42 GLBs used by City Twin |
| `docs/assets/ASSET_LICENSES.md` | License obligations |
| `docs/assets/ASSET_SOURCES.md` | Source inventory |
| `docs/assets/CREDITS_FRIEND_FORK.md` | Partner / upstream credits |
| `docs/merge/ASSET_INVENTORY.md` | Path mapping history |

## What we do **not** keep

- Friend FastAPI / living-city backend
- Friend Vite app / compose / Redis
- Duplicate GLB trees under vendor

If you need the original friend git history later, restore from your partner’s remote or a local backup — it is no longer vendored here.

See also: `docs/merge/ENHANCEMENTS_BACKLOG.md` (optional future ports stay flag-gated).
