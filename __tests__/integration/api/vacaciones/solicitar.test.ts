import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient, ObjectId } from 'mongodb'
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/vacaciones/solicitar/route'
import bcrypt from 'bcryptjs'

describe('/api/vacaciones/solicitar', () => {
  let mongoServer: MongoMemoryServer
  let client: MongoClient
  let db: any

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    client = new MongoClient(uri)
    await client.connect()
    db = client.db('test')

    process.env.MONGODB_URI = uri
    process.env.MONGODB_DB = 'test'
  })

  afterAll(async () => {
    await client.close()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    const collections = await db.listCollections().toArray()
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({})
    }

    const hashedPassword = await bcrypt.hash('password123', 12)
    await db.collection('usuarios').insertOne({
      _id: new ObjectId('507f1f77bcf86cd799439011'),
      email: 'test@example.com',
      nombre: 'Test User',
      rol: 'copista',
      passwordHash: hashedPassword,
      diasVacaciones: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  it('should create vacation request successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-05',
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

    expect(data.success).toBe(true)
    expect(data).toHaveProperty('vacationId')
    expect(data.daysUsed).toBe(5)
    expect(data.remainingDays).toBe(20)
  })

  it('should reject when insufficient vacation days', async () => {
    // Update user with only 2 days
    await db.collection('usuarios').updateOne(
      { _id: new ObjectId('507f1f77bcf86cd799439011') },
      { $set: { diasVacaciones: 2 } }
    )

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-05',
      },
    })

    ;(req as any).auth = {
      user: {
        id: '507f1f77bcf86cd799439011',
        role: 'copista',
        diasVacaciones: 2,
      },
    }

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Insufficient vacation days')
  })

  it('should reject when role limit exceeded', async () => {
    // Add existing vacation for copista
    await db.collection('vacaciones').insertOne({
      usuarioId: new ObjectId('507f1f77bcf86cd799439012'),
      rolUsuario: 'copista',
      fechaInicio: new Date('2024-01-01'),
      fechaFin: new Date('2024-01-05'),
      createdAt: new Date(),
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-05',
      },
    })

    ;(req as any).auth = {
      user: {
        id: '507f1f77bcf86cd799439011',
        role: 'copista',
        diasVacaciones: 25,
      },
    }

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Maximum 1 people from your role can be on vacation simultaneously')
  })

  it('should reject invalid date range', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fechaInicio: '2024-01-05',
        fechaFin: '2024-01-01', // End before start
      },
    })

    ;(req as any).auth = {
      user: {
        id: '507f1f77bcf86cd799439011',
        role: 'copista',
        diasVacaciones: 25,
      },
    }

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Start date must be before end date')
  })

  it('should reject unauthenticated requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-05',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.error).toBe('Unauthorized')
  })
})
