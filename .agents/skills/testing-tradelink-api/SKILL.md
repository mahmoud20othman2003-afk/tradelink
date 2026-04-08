# Testing TradeLink Backend API

## Overview
TradeLink is an Express.js + TypeScript backend with Sequelize ORM and SQLite. Testing is done via curl commands against a running dev server.

## Devin Secrets Needed
None — the app uses a hardcoded JWT secret for development (see `src/index.ts` or config).

## Setup Steps

1. **Install dependencies**: `npm install` from the repo root
2. **Seed the database**: `npx ts-node src/seed.ts` — this drops and recreates all tables with sample data
3. **Start the dev server**: `npx ts-node src/index.ts` — runs on port 4000 by default
4. **Obtain auth tokens**: POST to `/api/users/login` with email/password for each test user

## Test Users (from seed data)

| Role | Email | Password |
|------|-------|----------|
| Supplier | supplier@tradelink.com | password123 |
| Wholesaler | wholesale@tradelink.com | password123 |
| Retailer | retail@tradelink.com | password123 |
| Customer | ahmed@consumer.com | password123 |
| Admin | admin@tradelink.com | password123 |

## Getting Auth Tokens

```bash
# Get token for any user
curl -s -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tradelink.com","password":"password123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])"
```

Store tokens in shell variables for reuse:
```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:4000/api/users/login -H "Content-Type: application/json" -d '{"email":"admin@tradelink.com","password":"password123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
```

Tokens expire after 30 minutes. If you get 401 errors mid-testing, re-obtain tokens.

## Testing Patterns

### Curl with JSON parsing
Use `python3 -c` for inline JSON assertion checks:
```bash
curl -s http://localhost:4000/api/endpoint -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(f'field={d["data"]["field"]}')
print('PASSED' if d['data']['field'] == expected else 'FAILED')
"
```

### Checking HTTP status codes
```bash
STATUS=$(curl -s -o /tmp/response.json -w "%{http_code}" http://localhost:4000/api/endpoint)
echo "HTTP status=$STATUS"
```

### Admin-only endpoints
Admin endpoints return 403 for non-admin users. Always test auth guards by trying a non-admin token.

## API Route Groups

| Base Path | Feature | Auth Required |
|-----------|---------|---------------|
| `/api/admin/dashboard` | Dashboard stats | Admin |
| `/api/admin/users/:id/ban` | User banning | Admin |
| `/api/admin/audit-logs` | Audit logs | Admin |
| `/api/disputes` | Dispute management | Yes |
| `/api/kyc` | KYC documents | Yes (submit=supplier, review=admin) |
| `/api/commissions` | Category commissions | Admin |
| `/api/tiered-prices` | Tiered pricing | Public (read), Supplier (write) |
| `/api/flash-sales` | Flash sales | Public (read), Supplier (write) |
| `/api/coupons` | Coupons | Yes (validate), Admin (create) |
| `/api/wishlist` | Wishlist | Yes |
| `/api/follow` | Follow suppliers | Yes |
| `/api/low-stock` | Low stock alerts | Supplier |
| `/api/reviews` | Reviews & ratings | Public (read), Yes (write) |
| `/api/shipments` | Shipping & cost calc | Mixed |
| `/api/locations` | Governorates & cities | Public |

## Common Issues

- **Database locked errors**: May occur if multiple processes access SQLite simultaneously. Kill other server instances first.
- **Seeding resets everything**: `seed.ts` uses `{ force: true }` which drops all tables. Re-obtain auth tokens after reseeding.
- **Arabic text in responses**: Many error messages and some data fields use Arabic. Use `ensure_ascii=False` in Python JSON dumps for readable output.
- **Port already in use**: Kill existing processes on port 4000 before starting: `lsof -ti:4000 | xargs kill -9`
