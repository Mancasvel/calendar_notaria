import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/vacaciones/disponibilidad/route'
import bcrypt from 'bcryptjs'

describe('/api/vacaciones/disponibilidad', () => {
  let mongoServer: MongoMemoryServer
  let client: MongoClient
  let db: any

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    client = new MongoClient(uri)
    await client.connect()
    db = client.db('test')

    // Set environment variables
    process.env.MONGODB_URI = uri
    process.env.MONGODB_DB = 'test'
  })

  afterAll(async () => {
    await client.close()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    // Clear collections
    const collections = await db.listCollections().toArray()
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({})
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12)
    await db.collection('usuarios').insertOne({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      nombre: 'Test User',
      rol: 'copista',
      passwordHash: hashedPassword,
      diasVacaciones: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  it('should return availability for valid dates', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/vacaciones/disponibilidad?start=2024-01-01&end=2024-01-05',
      query: {
        start: '2024-01-01',
        end: '2024-01-05',
      },
    })

    // Mock session
    ;(req as any).auth = {
      user: {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        role: 'copista',
        diasVacaciones: 25,
      },
    }

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())

    expect(data).toHaveProperty('available')
    expect(data).toHaveProperty('roleAvailable')
    expect(data).toHaveProperty('hasEnoughDays')
    expect(data).toHaveProperty('requestedDays')
    expect(data).toHaveProperty('remainingDays')
  })

  it('should reject invalid date format', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/vacaciones/disponibilidad?start=invalid&end=2024-01-05',
      query: {
        start: 'invalid',
        end: '2024-01-05',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Invalid date format')
  })

  it('should reject missing dates', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/vacaciones/disponibilidad',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Missing start or end date')
  })

  it('should reject unauthenticated requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/vacaciones/disponibilidad?start=2024-01-01&end=2024-01-05',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Unauthorized')
  })
})
