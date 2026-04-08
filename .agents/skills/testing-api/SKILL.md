# Testing TradeLink API

## Prerequisites

- Node.js installed
- `npm install` completed
- sqlite3 native module may need rebuilding: `npm rebuild sqlite3`

## Setup

1. **Seed the database** (resets all data):
   ```bash
   rm -f database.sqlite && npx ts-node src/seed.ts
   ```

2. **Start the dev server** (port 4000):
   ```bash
   npx ts-node src/index.ts
   # or: npm run dev (uses nodemon for auto-reload)
   ```

3. **Fix permission issues** — If `ts-node` or `tsc` show "Permission denied":
   ```bash
   chmod +x node_modules/.bin/ts-node node_modules/.bin/tsc node_modules/.bin/nodemon
   ```

## Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

### Getting a token
```bash
curl -s -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmed@consumer.com","password":"password123"}'
```

### Seeded accounts (all password: `password123`)
| Role | Email | Notes |
|------|-------|-------|
| Admin | admin@tradelink.com | Can manage users, zones |
| Supplier | supplier@tradelink.com | Can be reviewed |
| Wholesaler | wholesale@tradelink.com | Can be reviewed |
| Retailer | retail@tradelink.com | Standard user |
| Customer | ahmed@consumer.com | Standard user |

## Key API Endpoints

### Reviews
- `GET /api/reviews/top-suppliers` — Public, no auth
- `GET /api/reviews/top-products` — Public, no auth
- `GET /api/reviews/:target_type/:target_id` — Public (target_type = "supplier" or "product")
- `POST /api/reviews` — Auth required, body: `{target_type, target_id, rating, comment}`
- `PUT /api/reviews/:id` — Auth required (owner only)
- `DELETE /api/reviews/:id` — Auth required (owner or admin)

### Shipping
- `GET /api/shipments/zones` — List all shipping zones
- `POST /api/shipments/calculate-cost` — Body: `{origin_governorate, destination_governorate, weight_kg}`
- `POST /api/shipments/zones` — Admin only, create zone
- `PUT /api/shipments/zones/:id` — Admin only, update zone

### Locations
- `GET /api/locations/governorates` — List all 27 Egyptian governorates
- `GET /api/locations/governorates/:id/cities` — Cities in a governorate (ID is 1-indexed)
- `GET /api/locations/search?q=<query>` — Search locations by name (Arabic text)
- `GET /api/locations/egypt` — Full location dump

## Testing Notes

- **Database**: SQLite file at `database.sqlite` in project root. Delete it before re-seeding.
- **Arabic text in curl**: Use URL-encoded strings for query params. For JSON bodies, raw Arabic UTF-8 works.
- **Shipping cost math**: Same-zone = `base_cost + weight * cost_per_kg`. Cross-zone = `max(base_costs) + weight * max(cost_per_kg) + 15 EGP surcharge`.
- **Governorate IDs are positional**: Based on array index in `locations_eg.json`, not stored in DB. They change if the JSON file is reordered.
- **Duplicate review prevention**: A user can only review a given target (supplier/product) once. Returns 409 on duplicate.
- **No CI configured**: TypeScript check with `npx tsc --noEmit` is the main validation step.
- **JWT secret**: Defined in `src/middleware/auth.ts` via `process.env.JWT_SECRET` (falls back to a default for dev).

## Devin Secrets Needed

None required for local testing. JWT uses a dev-only default fallback.
