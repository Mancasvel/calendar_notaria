import { ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { checkRoleAvailability, calculateCalendarDaysAsync } from '@/lib/helpers'

let PATCH: any

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}))

let mockDb: any

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: {
    then: (resolve: (value: any) => any) => resolve(mockDb),
  },
}))

jest.mock('@/lib/helpers', () => ({
  checkRoleAvailability: jest.fn(),
  calculateCalendarDaysAsync: jest.fn(),
}))

describe('/api/admin/vacaciones/solicitudes/[id]', () => {
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
  const mockCheckRoleAvailability = checkRoleAvailability as jest.MockedFunction<typeof checkRoleAvailability>
  const mockCalculateCalendarDaysAsync = calculateCalendarDaysAsync as jest.MockedFunction<typeof calculateCalendarDaysAsync>

  let userId: ObjectId
  let vacationId: ObjectId
  const adminUserId = '507f1f77bcf86cd799439099'
  const sessions = {
    admin: {
      user: {
        id: adminUserId,
        role: 'admin',
      },
    },
  }

  beforeAll(async () => {
    ;(global as any).Request = class Request {}
    PATCH = require('../../../../src/app/api/admin/vacaciones/solicitudes/[id]/route').PATCH
  })

  beforeEach(() => {
    userId = new ObjectId()
    vacationId = new ObjectId()

    const users = new Map<string, any>()
    const vacations = new Map<string, any>()

    users.set(userId.toString(), {
      _id: userId,
      email: 'test@example.com',
      nombre: 'Test User',
      rol: 'copista',
      passwordHash: 'hash',
      diasVacaciones: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vacations.set(vacationId.toString(), {
      _id: vacationId,
      usuarioId: userId,
      rolUsuario: 'copista',
      fechaInicio: new Date('2026-08-10T00:00:00.000Z'),
      fechaFin: new Date('2026-08-14T00:00:00.000Z'),
      estado: 'pendiente',
      diasSolicitados: 5,
      createdAt: new Date(),
    })

    mockDb = {
      collection: (name: string) => {
        if (name === 'usuarios') {
          return {
            findOne: async (query: any) => {
              const doc = users.get(query?._id?.toString())
              return doc ? { ...doc } : undefined
            },
            updateOne: async (query: any, update: any) => {
              const doc = users.get(query?._id?.toString())
              if (!doc) return { matchedCount: 0, modifiedCount: 0 }
              if (update?.$set) {
                Object.assign(doc, update.$set)
              }
              if (update?.$inc) {
                for (const [key, value] of Object.entries(update.$inc)) {
                  doc[key] = (doc[key] || 0) + (value as number)
                }
              }
              users.set(doc._id.toString(), doc)
              return { matchedCount: 1, modifiedCount: 1 }
            },
          }
        }

        if (name === 'vacaciones') {
          return {
            findOne: async (query: any) => vacations.get(query?._id?.toString()),
            updateOne: async (query: any, update: any) => {
              const doc = vacations.get(query?._id?.toString())
              if (!doc) return { matchedCount: 0, modifiedCount: 0 }
              if (update?.$set) {
                Object.assign(doc, update.$set)
              }
              vacations.set(doc._id.toString(), doc)
              return { matchedCount: 1, modifiedCount: 1 }
            },
          }
        }

        throw new Error(`Unexpected collection: ${name}`)
      },
    }

    mockGetServerSession.mockResolvedValue(sessions.admin as any)
    mockCheckRoleAvailability.mockResolvedValue(false)
    mockCalculateCalendarDaysAsync.mockResolvedValue(5)
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue(sessions.admin as any)
    mockCheckRoleAvailability.mockResolvedValue(false)
    mockCalculateCalendarDaysAsync.mockResolvedValue(5)
  })

  it('allows admin override when a request violates role rules', async () => {
    const response = await PATCH(
      {
        json: async () => ({ action: 'aprobar' }),
      } as any,
      {
        params: Promise.resolve({ id: vacationId.toString() }),
      }
    )

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data.success).toBe(true)
    expect(data.roleOverrideApplied).toBe(true)
    expect(data.message).toMatch(/override de reglas de rol/i)
    expect(data.daysDeducted).toBe(5)
    expect(data.remainingDays).toBe(20)

    const updatedVacation = await mockDb.collection('vacaciones').findOne({ _id: vacationId })
    expect(updatedVacation.estado).toBe('aprobada')
    expect(updatedVacation.approvedBy).toBeDefined()

    const updatedUser = await mockDb.collection('usuarios').findOne({ _id: userId })
    expect(updatedUser.diasVacaciones).toBe(20)
  })
})
