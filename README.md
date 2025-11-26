# Vacation Management System

A comprehensive vacation management system built with Next.js, TypeScript, MongoDB Atlas, and NextAuth. Features complete CRUD operations, visual calendar interface, and advanced role-based permissions.

## Features

### 🎯 Core Features
- **Role-based authentication** with NextAuth (Credentials Provider)
- **Vacation request system** with business rules
- **Real-time vacation day tracking** and validation
- **Role restrictions**: Maximum 2 people per role can be on vacation simultaneously

### 👥 User Management
- **Multi-level user roles**: Admin, Polizas, Copista, Contabilidad, Gestión, Oficial
- **Complete user CRUD operations** (Create, Read, Update, Delete)
- **Advanced permissions**: Admin and Polizas roles have full system access
- **Automatic role-based navigation** and access control

### 📅 Visual Calendar Interface
- **Interactive calendar view** showing all vacations by month
- **Color-coded roles**: Visual distinction for different employee roles
- **Click-to-view details**: Detailed vacation information in modal
- **Direct actions**: Edit and delete vacations directly from calendar
- **Month navigation**: Previous/Next month and "Today" shortcuts

### 🛠️ Administrative Features
- **Complete vacation CRUD**: Create, read, update, delete any vacation
- **User management panel**: Full control over all system users
- **Automatic day calculation**: Smart vacation day adjustments
- **Real-time updates**: Changes reflected immediately across the system
- **Audit trail**: Tracking of who created/modified vacations

### 🎨 User Interface
- **Responsive design** for desktop and mobile
- **Modern navbar** with role-based navigation
- **Interactive modals** for all operations
- **Real-time feedback** with success/error messages
- **Intuitive color coding** for different roles and statuses

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js with Credentials Provider
- **Password Hashing**: bcryptjs
- **Calendar Interface**: Custom React components with date manipulation
- **UI Components**: Responsive design with hover states and animations

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

### Vacation Management
1. **Role Restriction**: Maximum 2 people from the same role can be on vacation simultaneously
2. **Vacation Validation**:
   - User must have enough remaining vacation days
   - Date range must not violate the 2-per-role rule
   - Automatic calculation of vacation duration (including weekends)
3. **Day Management**:
   - Days automatically deducted when vacation is approved
   - Days restored when vacation is cancelled/deleted
   - Days adjusted when vacation dates are modified

### Permissions & Access Control
- **Admin & Polizas**: Full system access (CRUD all vacations and users)
- **Regular users**: Can view vacations from their role + their own vacations
- **Role-based navigation**: UI adapts based on user permissions
- **Middleware protection**: All admin routes are protected by role verification

### User Management
- **Email uniqueness**: No duplicate email addresses allowed
- **Password security**: bcrypt hashing with 12 rounds
- **Role validation**: Only predefined roles accepted
- **Self-protection**: Users cannot delete their own accounts

## API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication (NextAuth)

### User Management
- `GET /api/usuarios/me` - Get current user information with updated vacation days
- `GET /api/admin/usuarios` - Admin: Get all users
- `POST /api/admin/usuarios` - Admin: Create new user
- `PUT /api/admin/usuarios/[id]` - Admin: Update user
- `DELETE /api/admin/usuarios/[id]` - Admin: Delete user

### Vacation Management
- `GET /api/vacaciones/disponibilidad?start=...&end=...` - Check vacation availability
- `POST /api/vacaciones/solicitar` - Request new vacation
- `GET /api/vacaciones/mias` - Get user's own vacations
- `GET /api/vacaciones/rol?rol=...` - Get vacations by role

### Administrative Operations
- `GET /api/admin/vacaciones` - Admin: Get all vacations (grouped by role)
- `POST /api/admin/vacaciones/crear` - Admin: Create vacation for any user
- `PUT /api/admin/vacaciones/[id]` - Admin: Update vacation dates
- `DELETE /api/admin/vacaciones/[id]` - Admin: Delete vacation (restores days)

## User Roles

### Administrative Roles (Full Access)
- `admin` - Complete system access (CRUD vacations, users, calendar view)
- `polizas` - Complete system access (same as admin)

### Regular Roles (Limited Access)
- `copista` - Standard user with basic vacation management
- `contabilidad` - Standard user with basic vacation management
- `gestion` - Standard user with basic vacation management
- `oficial` - Standard user with basic vacation management

### Permission Matrix
| Feature | Admin/Polizas | Regular Users |
|---------|---------------|---------------|
| View own vacations | ✅ | ✅ |
| Request vacations | ✅ | ✅ |
| View role vacations | ✅ | ✅ |
| Admin dashboard | ✅ | ❌ |
| User management | ✅ | ❌ |
| Calendar view | ✅ | ❌ |
| CRUD operations | ✅ | ❌ |

## Pages & Navigation

### Public Pages
- `/login` - Authentication page

### User Pages (All Authenticated Users)
- `/mis-vacaciones` - Personal vacation dashboard with real-time day tracking
- `/solicitar-vacaciones` - Vacation request form with availability checking

### Administrative Pages (Admin & Polizas Only)
- `/admin/vacaciones` - Complete vacation management
  - Visual calendar with month navigation
  - Detailed vacation list by role
  - CRUD operations for all vacations
  - Create vacations for any user
- `/admin/usuarios` - Complete user management
  - User list with role indicators
  - Create new users
  - Edit user details and roles
  - Delete users (with self-protection)

### Navigation Bar
- **All users**: Mis Vacaciones, Solicitar Vacaciones, Cerrar sesión
- **Admin/Polizas**: Additional "Panel Admin" and "Usuarios" links
- **Role indicators**: Badge showing admin status
- **Responsive**: Mobile-friendly hamburger menu

## Security & Architecture

### Authentication & Authorization
- **NextAuth.js**: Secure session management with JWT tokens
- **bcrypt hashing**: 12-round password encryption
- **Middleware protection**: Route-level access control
- **Role validation**: Server-side permission checks
- **Session updates**: Real-time user data synchronization

### Data Protection
- **API validation**: Input sanitization and validation
- **Error handling**: Secure error responses without data leakage
- **Self-protection**: Users cannot delete their own accounts
- **Audit trail**: Tracking of administrative actions

### Database Design
- **MongoDB Atlas**: Cloud-hosted database with automatic scaling
- **Schema validation**: TypeScript interfaces ensure data consistency
- **Atomic operations**: Database transactions for data integrity
- **Indexing**: Optimized queries for performance

### Frontend Security
- **TypeScript**: Type-safe development
- **Input validation**: Client-side form validation
- **CSRF protection**: Built-in NextAuth security
- **Responsive security**: Mobile and desktop secure access