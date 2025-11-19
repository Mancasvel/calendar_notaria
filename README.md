# Vacation Management System

A clean, minimal vacation management system built with Next.js, TypeScript, MongoDB Atlas, and NextAuth.

## Features

- **Role-based authentication** with NextAuth (Credentials Provider)
- **Vacation request system** with business rules
- **Admin dashboard** for viewing all vacations
- **User dashboard** for personal vacation management
- **Role restrictions**: Maximum 2 people per role can be on vacation simultaneously
- **Vacation day tracking** and validation

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js with Credentials Provider
- **Password Hashing**: bcryptjs

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=your_database_name

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production
```

### 2. MongoDB Setup

The system expects two collections in your MongoDB database:

#### `usuarios` Collection (existing)
Extend your existing `usuarios` collection with a `diasVacaciones` field (number).

Example document:
```json
{
  "_id": "690de76fc3fa20e0d9e21650",
  "email": "user@example.com",
  "nombre": "User Name",
  "rol": "copista",
  "passwordHash": "$2b$12$...",
  "diasVacaciones": 25,
  "createdAt": "2025-11-07T12:34:56.390+00:00",
  "updatedAt": "2025-11-07T12:39:14.517+00:00"
}
```

#### `vacaciones` Collection (new)
```json
{
  "_id": "...",
  "usuarioId": "690de76fc3fa20e0d9e21650",
  "rolUsuario": "copista",
  "fechaInicio": "2025-12-01T00:00:00.000+00:00",
  "fechaFin": "2025-12-05T00:00:00.000+00:00",
  "createdAt": "2025-11-07T12:39:14.923+00:00"
}
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Business Rules

1. **Role Restriction**: Maximum 2 people from the same role can be on vacation simultaneously
2. **Vacation Validation**:
   - User must have enough remaining vacation days
   - Date range must not violate the 2-per-role rule
3. **Permissions**:
   - **Admin**: Full access to all vacations
   - **Regular users**: Can view vacations from their role + their own vacations

## API Endpoints

- `POST /api/auth/login` - Authentication (handled by NextAuth)
- `GET /api/vacaciones/disponibilidad?start=...&end=...` - Check vacation availability
- `POST /api/vacaciones/solicitar` - Request vacation
- `GET /api/vacaciones/mias` - Get user's vacations
- `GET /api/vacaciones/rol?rol=...` - Get vacations by role
- `GET /api/admin/vacaciones` - Admin: Get all vacations

## User Roles

- `admin` - Full system access
- `copista`, `contabilidad`, `gestion`, `oficial` - Regular roles with restricted access

## Pages

- `/login` - Authentication page
- `/mis-vacaciones` - User vacation dashboard
- `/solicitar-vacaciones` - Vacation request form
- `/admin/vacaciones` - Admin vacation overview

## Security

- Passwords are hashed using bcrypt
- Role-based middleware protects routes
- Session management via NextAuth
- API routes validate user permissions