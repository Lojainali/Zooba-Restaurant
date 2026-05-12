# Quick API Reference - Common Issues

## IMPORTANT: Base URL

**All API endpoints must start with `/api/`**

###  Wrong:
```
POST http://localhost:5000/auth/register
```

###  Correct:
```
POST http://localhost:5000/api/auth/register
```

---

## Common Endpoints

### Authentication
- **Register**: `POST http://localhost:5000/api/auth/register`
- **Login**: `POST http://localhost:5000/api/auth/login`
- **Get Current User**: `GET http://localhost:5000/api/auth/me`
- **Update Profile**: `PUT http://localhost:5000/api/auth/profile`

### Menu
- **Get All Items**: `GET http://localhost:5000/api/menu`
- **Get Daily Offers**: `GET http://localhost:5000/api/menu/offers/daily`
- **Create Item**: `POST http://localhost:5000/api/menu` (Admin only)

### Orders
- **Create Order**: `POST http://localhost:5000/api/orders`
- **Get Orders**: `GET http://localhost:5000/api/orders`
- **Update Status**: `PUT http://localhost:5000/api/orders/:id/status`

---

## Testing in Postman

1. **Base URL**: `http://localhost:5000/api`
2. **Full endpoint**: `http://localhost:5000/api/auth/register`

### Example Register Request:
```
Method: POST
URL: http://localhost:5000/api/auth/register
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

---

## Health Check

Test if server is running:
```
GET http://localhost:5000/api/health
```

Or check root:
```
GET http://localhost:5000/
```

---

## Troubleshooting

### Error: "Cannot POST /auth/register"
**Solution**: Use `/api/auth/register` instead

### Error: "Route not found"
**Solution**: Make sure:
1. Server is running (`npm run dev` in backend folder)
2. You're using the correct base URL (`http://localhost:5000/api`)
3. The endpoint path is correct

### Error: "MongoDB connection error"
**Solution**: 
1. Make sure MongoDB is running
2. Check your `.env` file has correct `MONGODB_URI`

