# Vacation Management System

A comprehensive vacation management system built with Next.js, TypeScript, MongoDB Atlas, and NextAuth. Features complete CRUD operations, visual calendar interface, advanced role-based permissions, and comprehensive testing suite with CI/CD pipeline.

## 🆕 Recent Updates (December 2025)

### Testing & Quality Assurance
- ✅ **24 automated tests** implemented (unit, component, integration)
- ✅ **GitHub Actions CI/CD pipeline** configured and operational
- ✅ **Test coverage tracking** with detailed reports
- ✅ **E2E testing** with Playwright
- ✅ **MongoDB Memory Server** for integration tests

### Robustness & Error Handling
- ✅ **Production-ready error handling** with graceful degradation
- ✅ **Safe API response validation** preventing TypeErrors
- ✅ **User-friendly error messages** in Spanish
- ✅ **Network failure resilience** with fallback mechanisms
- ✅ **Build optimization** for CI/CD environments

### CI/CD Pipeline
- ✅ **Automated testing** on push and pull requests
- ✅ **Multi-environment support** (Node 20.x)
- ✅ **Production build verification** before deployment
- ✅ **Security audits** integrated into pipeline
- ✅ **Deployment readiness checks** automated

### Developer Experience
- ✅ **Comprehensive documentation** with troubleshooting guide
- ✅ **TypeScript strict mode** for better type safety
- ✅ **Jest configuration** optimized for testing
- ✅ **Quick test commands** for different scenarios
- ✅ **Modern tooling** and best practices

## Features

### 🎯 Core Features
- **Role-based authentication** with NextAuth (Credentials Provider)
- **Vacation request system** with business rules
- **Real-time vacation day tracking** and validation
- **Role restrictions**: Maximum 2 people per role can be on vacation simultaneously
- **Robust error handling** with fallback mechanisms
- **Production-ready CI/CD pipeline** with automated testing

### 👥 User Management
- **Multi-level user roles**: Admin, Polizas, Copista, Contabilidad, Gestión, Oficial
- **Complete user CRUD operations** (Create, Read, Update, Delete)
- **Advanced permissions**: Admin and Polizas roles have full system access
- **Automatic role-based navigation** and access control

### 📅 Visual Calendar Interface
- **Interactive calendar view** showing all vacations by month
- **Color-coded roles**: Visual distinction for different employee roles
- **Click-to-view details**: Detailed vacation information in modal
- **Dual access**: General calendar for all users (read-only) + Admin calendar with CRUD
- **Month navigation**: Previous/Next month and "Today" shortcuts

### 🛠️ Administrative Features
- **Complete vacation CRUD**: Create, read, update, delete any vacation
- **User management panel**: Full control over all system users
- **Monthly PDF reports**: Export vacation reports with employee matrix by month
- **Automatic day calculation**: Smart vacation day adjustments
- **Real-time updates**: Changes reflected immediately across the system
- **Audit trail**: Tracking of who created/modified vacations

### 🎨 User Interface
- **Responsive design** for desktop and mobile
- **Modern navbar** with role-based navigation
- **Interactive modals** for all operations
- **Real-time feedback** with success/error messages
- **Intuitive color coding** for different roles and statuses

### 🧪 Testing & Quality Assurance
- **24 automated tests** (unit, component, integration)
- **Comprehensive test coverage** for critical paths
- **CI/CD pipeline** with GitHub Actions
- **Automated builds** and deployment checks
- **Error boundary handling** with graceful degradation

## Tech Stack

### Frontend & Backend
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth.js with Credentials Provider
- **Password Hashing**: bcryptjs
- **Calendar Interface**: Custom React components with date manipulation
- **UI Components**: Responsive design with hover states and animations

### Testing & CI/CD
- **Unit Testing**: Jest with TypeScript support
- **Component Testing**: React Testing Library
- **Integration Testing**: MongoDB Memory Server
- **E2E Testing**: Playwright
- **CI/CD**: GitHub Actions with automated testing
- **Code Quality**: TypeScript strict mode, ESLint configuration

### Production Dependencies
- `next` (16.0.10) - React framework with App Router
- `react` (18.3.1) - UI library
- `mongodb` (6.11.0) - Database driver
- `next-auth` (4.24.13) - Authentication
- `bcryptjs` (2.4.3) - Password hashing
- `recharts` (3.6.0) - Charts for reports
- `jspdf` & `jspdf-autotable` - PDF generation

### Development Dependencies
- `typescript` (5.7.2) - Type safety
- `jest` (29.7.0) - Testing framework
- `@testing-library/react` (16.1.0) - Component testing
- `@playwright/test` (1.49.1) - E2E testing
- `mongodb-memory-server` - Integration testing
- `eslint` (8.57.1) - Code linting

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

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

Visit `http://localhost:3000` to access the application.

### 5. Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:all         # Run comprehensive test suite

# Code Quality
npm run lint             # Run ESLint

# E2E Testing
npx playwright test      # Run Playwright E2E tests
npx playwright test --ui # Run with UI mode
```

### 6. Run Tests

**Run all tests:**
```bash
npm test
```

**Run specific test suites:**
```bash
# Unit tests only
npm test -- --testPathPatterns="unit"

# Component tests only
npm test -- --testPathPatterns="components"

# Integration tests (requires MongoDB)
npm test -- --testPathPatterns="integration"

# With coverage
npm run test:coverage
```

**Run E2E tests:**
```bash
npx playwright test
```

## Testing Suite

### Test Coverage
- **24 automated tests** across unit, component, and integration layers
- **3 test suites**: Unit helpers, LoginPage components, SolicitarVacacionesPage components
- **Coverage tracking** with detailed reports

### Test Categories

#### 1. Unit Tests (`__tests__/unit/`)
- Helper functions (date calculations, working days)
- Business logic validation
- Utility functions

#### 2. Component Tests (`__tests__/components/`)
- **LoginPage**: Authentication UI, form validation, error handling
- **SolicitarVacacionesPage**: Vacation requests, availability checking, date validation
- User interactions and state management

#### 3. Integration Tests (`__tests__/integration/`)
- API endpoint testing with MongoDB Memory Server
- Database operations
- Vacation availability logic
- Request/response validation

#### 4. E2E Tests (`e2e/`)
- Full user workflows with Playwright
- Authentication flows
- End-to-end vacation request process

### Running Tests in CI/CD
The GitHub Actions pipeline automatically runs:
1. Unit tests with coverage
2. Component tests with coverage
3. Integration tests (with MongoDB connection)
4. Production build verification
5. Security audits

## CI/CD Pipeline

### GitHub Actions Workflow
The project includes a comprehensive CI/CD pipeline (`.github/workflows/test.yml`):

#### Jobs:
1. **Tests (Node 20.x)**
   - Unit tests with coverage
   - Component tests with coverage
   - Combined coverage reports
   - Upload to Codecov

2. **Integration Tests**
   - MongoDB Atlas connection
   - API endpoint validation
   - Database operations testing

3. **Build**
   - Production build verification
   - Build size analysis
   - Artifact upload

4. **E2E Tests** (on main/master pushes)
   - Playwright browser tests
   - Full workflow validation

5. **Security Audit**
   - npm audit checks
   - Vulnerability scanning

6. **Deployment Ready**
   - Final checklist
   - Deployment summary

### Environment Variables for CI/CD
Configure these secrets in GitHub repository settings:
- `MONGODB_URI` - MongoDB Atlas connection string (test database)
- `MONGODB_DB` - Database name for testing
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `CODECOV_TOKEN` - (Optional) Codecov integration

## Project Structure

```
calendar_notaria/
├── .github/
│   └── workflows/
│       └── test.yml                 # CI/CD pipeline configuration
├── __tests__/
│   ├── components/                  # Component tests
│   │   ├── LoginPage.test.tsx
│   │   └── SolicitarVacacionesPage.test.tsx
│   ├── integration/                 # Integration tests
│   │   └── api/
│   └── unit/                        # Unit tests
│       └── helpers.test.ts
├── e2e/                             # End-to-end tests
│   └── auth.spec.ts
├── public/                          # Static assets
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── admin/                   # Admin pages
│   │   │   ├── dashboard/
│   │   │   ├── solicitudes/
│   │   │   ├── usuarios/
│   │   │   └── vacaciones/
│   │   ├── api/                     # API routes
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── festivos/
│   │   │   ├── reportes/
│   │   │   ├── usuarios/
│   │   │   └── vacaciones/
│   │   ├── calendario/              # Calendar page
│   │   ├── festivos/                # Holidays page
│   │   ├── login/                   # Login page
│   │   ├── mis-vacaciones/          # My vacations page
│   │   ├── solicitar-vacaciones/    # Request vacation page
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   ├── components/                  # React components
│   │   ├── admin-dashboard.tsx
│   │   ├── navbar.tsx
│   │   ├── providers.tsx
│   │   ├── reporte-modal.tsx
│   │   └── vacation-calendar.tsx
│   ├── lib/                         # Library code
│   │   ├── auth.ts                  # NextAuth configuration
│   │   ├── helpers.ts               # Utility functions
│   │   ├── holidays-2025.ts         # Holiday definitions
│   │   ├── models.ts                # TypeScript types
│   │   ├── mongodb.ts               # Database connection
│   │   └── permissions.ts           # Permission helpers
│   ├── middleware.ts                # Next.js middleware
│   └── types/                       # TypeScript declarations
├── jest.config.js                   # Jest configuration
├── jest.setup.js                    # Jest setup
├── playwright.config.ts             # Playwright configuration
├── next.config.ts                   # Next.js configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies and scripts
```

### Key Directories

- **`src/app/`**: Next.js 13+ App Router structure with pages and API routes
- **`src/components/`**: Reusable React components
- **`src/lib/`**: Business logic, utilities, and configurations
- **`__tests__/`**: Comprehensive test suite (unit, component, integration)
- **`e2e/`**: Playwright end-to-end tests
- **`.github/workflows/`**: CI/CD pipeline definitions

## Business Rules

### Vacation Management

#### Role-Based Restrictions
- **recepcion**: Sin restricción (ilimitado)
- **gestion**: Sin restricción (ilimitado)
- **indices**: Máximo 1 persona de vacaciones simultáneamente
- **contabilidad**: Máximo 1 persona de vacaciones simultáneamente
- **copista**: Máximo 1 persona de vacaciones simultáneamente
- **oficial**: Máximo 3 personas de vacaciones simultáneamente
- **admin/polizas**: Máximo 2 personas de vacaciones simultáneamente (default)

#### Vacation Validation
   - User must have enough remaining vacation days
- Date range must not violate the role-specific restriction rules
- **Smart day calculation**: Only working days count (excludes weekends and holidays)
- Real-time availability checking before approval

#### Working Days Calculation
The system **only counts working days** as vacation days:
- ❌ **Weekends (Saturday & Sunday)**: Do NOT count
- ❌ **Official holidays**: Do NOT count
- ✅ **Working days (Mon-Fri, non-holidays)**: Count as vacation days

**Official Holidays 2025:**
- 1 enero: Año Nuevo
- 6 enero: Epifanía del Señor
- 28 febrero: Día de Andalucía
- 17 abril: Jueves Santo
- 18 abril: Viernes Santo
- 1 mayo: Fiesta del Trabajo
- 15 agosto: Asunción de la Virgen
- 12 octubre: Fiesta Nacional de España
- 1 noviembre: Todos los Santos
- 6 diciembre: Día de la Constitución
- 8-9 diciembre: Inmaculada Concepción (trasladada)
- 25 diciembre: Navidad

**Example**: A vacation from Friday Dec 5 to Monday Dec 15 (11 calendar days) = **7 working days**
- Excludes: Dec 6 (Saturday), Dec 7 (Sunday), Dec 8 (holiday), Dec 13 (Saturday), Dec 14 (Sunday)

#### Day Management
- Days automatically deducted when vacation is approved
- Days restored when vacation is cancelled/deleted
- Days adjusted when vacation dates are modified
- Real-time day tracking across all interfaces

### Permissions & Access Control
- **Admin & Polizas**: Full system access (CRUD all vacations and users)
- **Regular users**: Can view vacations from their role + their own vacations
- **Role-based calendar**: Each user sees only vacations from their own role
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
- `notario` - Notary role with automatic despacho generation (despacho_nombre format)
- `copista` - Standard user with basic vacation management
- `contabilidad` - Standard user with basic vacation management
- `gestion` - Standard user with basic vacation management
- `oficial` - Standard user with basic vacation management
- `recepcion` - Standard user with basic vacation management
- `indices` - Standard user with basic vacation management

### Permission Matrix
| Feature | Admin/Polizas | Regular Users |
|---------|---------------|---------------|
| View own vacations | ✅ | ✅ |
| Request vacations | ✅ | ✅ |
| View role vacations | ✅ | ✅ |
| General calendar view | ✅ | ✅ |
| Admin dashboard | ✅ | ❌ |
| User management | ✅ | ❌ |
| CRUD operations | ✅ | ❌ |

## Pages & Navigation

### Public Pages
- `/login` - Authentication page

### User Pages (All Authenticated Users)
- `/mis-vacaciones` - Personal vacation dashboard with real-time day tracking
- `/solicitar-vacaciones` - Vacation request form with availability checking
- `/calendario` - Role-specific vacation calendar view (shows vacations from user's role only)
- `/festivos` - Official holidays list for 2025 (non-working days)

### Administrative Pages (Admin & Polizas Only)
- `/admin/vacaciones` - Complete vacation management
  - Monthly report view with PDF export (employee matrix by day)
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
- **All users**: Mis Vacaciones, Solicitar Vacaciones, Calendario, Festivos, Cerrar sesión
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
- **Robust error handling**: Graceful degradation on API failures
  - Safe response validation (`response && response.ok`)
  - Fallback error messages in Spanish
  - Try-catch blocks with detailed logging
  - Network failure resilience

## Error Handling & Resilience

### Production-Ready Error Handling
The application implements comprehensive error handling:

#### API Response Validation
```typescript
// Safe fetch with validation
const response = await fetch('/api/endpoint');
if (response && response.ok) {
  const data = await response.json();
  // Process data
} else {
  // Handle error gracefully
  const status = response ? response.status : 'No response';
  console.error('Request failed:', status);
}
```

#### Features:
- ✅ Validates response existence before accessing properties
- ✅ Handles network failures gracefully
- ✅ Provides user-friendly error messages in Spanish
- ✅ Logs detailed error information for debugging
- ✅ Try-catch blocks with nested error handling
- ✅ Fallback mechanisms for JSON parsing errors

### Build Optimization
- **Smart environment validation**: Variables checked only when needed
- **Build-time resilience**: Application builds successfully without runtime dependencies
- **Lazy connection initialization**: Database connections created on-demand
- **Zero performance impact**: Validation overhead < 0.001ms

## Development Workflow

### Code Quality
```bash
# Lint check
npm run lint

# Type checking
npx tsc --noEmit

# Format code (if configured)
npm run format
```

### Testing Workflow
```bash
# Watch mode for TDD
npm run test:watch

# Run specific test file
npm test -- LoginPage.test.tsx

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Build & Deploy
```bash
# Clean build
rm -rf .next
npm run build

# Test production build locally
npm run build && npm start
```

## Troubleshooting

### Common Issues

#### Build fails in CI/CD
- **Solution**: Ensure MongoDB secrets are configured in GitHub Actions
- The app gracefully handles missing env vars during build

#### Tests fail locally
- **Solution**: Run `npm install` to sync dependencies
- Check that MongoDB connection string is valid for integration tests

#### TypeScript errors
- **Solution**: Run `npm install` and `npx tsc --noEmit`
- Ensure all types are properly defined

#### Port already in use
- **Solution**: Kill the process on port 3000:
  ```bash
  # Linux/Mac
  lsof -ti:3000 | xargs kill -9
  
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

## Best Practices

### Code Standards
- **TypeScript**: Use strict typing, avoid `any` when possible
- **Component Structure**: Functional components with hooks
- **Error Handling**: Always validate API responses
- **Testing**: Write tests for new features and bug fixes
- **Commits**: Use descriptive commit messages

### Testing Guidelines
- Write unit tests for utility functions
- Write component tests for UI interactions
- Write integration tests for API endpoints
- Maintain test coverage above 70%
- Mock external dependencies appropriately

### Security Practices
- Never commit `.env.local` or secrets
- Use environment variables for sensitive data
- Validate all user inputs server-side
- Implement proper error messages (avoid data leakage)
- Keep dependencies updated

### Performance
- Optimize images and assets
- Use Next.js Image component
- Implement proper caching strategies
- Monitor bundle size
- Use lazy loading where appropriate

## Contributing

This is a private project. For authorized contributors:

1. Create a feature branch from `main`
2. Make your changes with tests
3. Ensure all tests pass (`npm test`)
4. Create a pull request
5. Wait for CI/CD checks to pass
6. Request code review

### Commit Message Format
```
type(scope): brief description

Detailed description if needed

Fixes #issue-number
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Support & Documentation

### Additional Documentation
- See `TESTING.md` for detailed testing guide
- See `MIGRATION_VACACIONES_ESTADO.md` for vacation state migrations
- See `PROJECT_COMPLETE.md` for project completion checklist
- See `ENV_EXAMPLE.txt` for environment variable examples

### Getting Help
For issues or questions:
1. Check the troubleshooting section
2. Review existing documentation
3. Contact the development team

## Changelog

### Version 2.0.0 (December 2025)
- Added comprehensive testing suite (24 tests)
- Implemented CI/CD pipeline with GitHub Actions
- Enhanced error handling and resilience
- Optimized build process for production
- Added E2E testing with Playwright
- Improved documentation

### Version 1.0.0 (November 2025)
- Initial release
- Core vacation management features
- User authentication and authorization
- Administrative dashboard
- Calendar interface
- PDF report generation

## License

This software is proprietary and confidential. All rights reserved by Manuel Castillejo Vela.

**Important**: This is a commercial software product. Unauthorized use, copying, modification, or distribution is strictly prohibited and may result in legal action.

For licensing inquiries, commercial use, or redistribution permissions, please contact:
- **Manuel Castillejo Vela**
- Email: [Contact email]
- Phone: [Contact phone]

See the LICENSE file for complete terms and conditions.