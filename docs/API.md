# Grey Fabric Costing — REST API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require an HTTP Authorization header:
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Authentication (`/auth`)

### `POST /auth/login`
- **Body**: `{ "email": "admin@greycost.com", "password": "admin123" }`
- **Response**: `{ success: true, token: "...", user: { id, name, email, role } }`

### `POST /auth/logout` (Auth)
- **Response**: `{ success: true, message: "Logged out successfully" }`

### `GET /auth/me` (Auth)
- **Response**: Returns current user object.

---

## 2. Costings (`/costings`)

### `POST /costings/calculate`
*Does not require saving to DB. Returns pure instant calculation breakdown.*
- **Body**:
  ```json
  {
    "width": 63,
    "epi": 133,
    "ppi": 72,
    "warp_count": 40,
    "warp_rate": 360,
    "warp_wastage": 3.5,
    "weft_count": 40,
    "weft_rate": 350,
    "weft_wastage": 4.0,
    "sizing_charges": 4.25,
    "weaving_charges": 8.50,
    "other_charges": 1.50
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "weights": { "total_ends": 8379, "warp_weight_kg": 0.128, "weft_weight_kg": 0.0697, "gsm": 123.54, "glm": 197.68 },
      "costs": { "warp_cost": 46.09, "weft_cost": 24.38, "total_process_charges": 14.25, "grey_cost_per_meter": 84.72 },
      "breakdown_percentages": { "warp": 54.4, "weft": 28.8, "process": 16.8 }
    }
  }
  ```

### `POST /costings` (Auth)
- Calculates and stores a new costing record.

### `GET /costings` (Auth)
- Query parameters: `search`, `startDate`, `endDate`, `limit`.

### `GET /costings/:id` (Auth)
- Returns costing with full calculation breakdown.

### `PUT /costings/:id` (Auth)
- Updates costing specification and recalculates.

### `DELETE /costings/:id` (Auth - Admin Only)
- Deletes costing record.

### `POST /costings/:id/duplicate` (Auth)
- Clones an existing costing specification with a fresh costing code.

### `GET /costings/kpis` (Auth)
- Dashboard KPIs (total costings, today's count, active fabrics, yarn rate updates, avg grey cost).

### `GET /costings/trend?days=30` (Auth)
- Returns time-series costing data for the orange glow trend chart.

---

## 3. Masters

### Yarns (`/yarns`)
- `GET /yarns`: List all yarns
- `POST /yarns` (Admin): Add new yarn
- `PUT /yarns/:id` (Admin): Update yarn rate/count
- `DELETE /yarns/:id` (Admin): Delete yarn

### Fabrics (`/fabrics`)
- `GET /fabrics`: List all master fabrics
- `POST /fabrics` (Admin): Create fabric spec
- `PUT /fabrics/:id` (Admin): Update fabric spec
- `DELETE /fabrics/:id` (Admin): Delete fabric spec

### Charges (`/charges`)
- `GET /charges`: List all process charges
- `POST /charges` (Admin): Add charge item
- `PUT /charges/:id` (Admin): Update charge value
- `DELETE /charges/:id` (Admin): Delete charge item

---

## 4. Reports & Logs (`/reports`)

- `GET /reports/costings`: Aggregated costings report
- `GET /reports/export`: CSV export download
- `GET /reports/activity-logs` (Admin): System audit logs

---

## 5. User Management (`/users`) *(Admin Only)*

- `GET /users`: List users
- `POST /users`: Create admin or staff user
- `PUT /users/:id`: Edit user role or status
- `DELETE /users/:id`: Delete user
