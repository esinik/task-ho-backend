# TaskHo Backend (Express + MongoDB)

## Başlatma

```bash
cp .env.sample .env
docker compose up -d  # Mongo ve mongo-express (8081) ayağa kalkar
npm install
npm run seed
npm run dev
```

API kökü: `http://localhost:${PORT:-4000}/api`

### Kaynaklar

- `GET /api/tasks?tab=&customer=&type=&overdue=`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

- `GET /api/fees?customer=&month=&status=`
- `POST /api/fees`
- `PATCH /api/fees/:id`
- `DELETE /api/fees/:id`

- `GET /api/customers?q=`
- `POST /api/customers`

Tüm girişler Zod ile validate edilir. Mongoose şemaları benzerdir.
