import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.MONGODB_DB = 'test'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

// Global test utilities
global.fetch = jest.fn()

// Mock MongoDB for unit tests
const mockToArray = jest.fn(() => [])
const mockFind = jest.fn(() => ({ toArray: mockToArray }))

jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    db: jest.fn(() => ({
      collection: jest.fn(() => ({
        find: mockFind,
        findOne: jest.fn(),
        insertOne: jest.fn(),
        updateMany: jest.fn(),
        updateOne: jest.fn(),
      })),
    })),
    close: jest.fn(),
  })),
  ObjectId: jest.fn().mockImplementation((id) => id),
}))

// Export for tests to use
global.mockMongoToArray = mockToArray
global.mockMongoFind = mockFind
