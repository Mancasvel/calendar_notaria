import {
  datesOverlap,
  calculateCalendarDays,
  checkRoleAvailability,
} from '@/lib/helpers'

describe('Helper Functions', () => {
  describe('datesOverlap', () => {
    it('should detect overlapping date ranges', () => {
      const start1 = new Date('2024-01-01')
      const end1 = new Date('2024-01-10')
      const start2 = new Date('2024-01-05')
      const end2 = new Date('2024-01-15')

      expect(datesOverlap(start1, end1, start2, end2)).toBe(true)
    })

    it('should not detect non-overlapping date ranges', () => {
      const start1 = new Date('2024-01-01')
      const end1 = new Date('2024-01-10')
      const start2 = new Date('2024-01-15')
      const end2 = new Date('2024-01-20')

      expect(datesOverlap(start1, end1, start2, end2)).toBe(false)
    })

    it('should detect touching date ranges as overlapping', () => {
      const start1 = new Date('2024-01-01')
      const end1 = new Date('2024-01-10')
      const start2 = new Date('2024-01-10')
      const end2 = new Date('2024-01-20')

      expect(datesOverlap(start1, end1, start2, end2)).toBe(true)
    })
  })

  describe('calculateCalendarDays', () => {
    it('should calculate correct number of calendar days', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-01-05')

      expect(calculateCalendarDays(start, end)).toBe(5)
    })

    it('should handle single day correctly', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-01-01')

      expect(calculateCalendarDays(start, end)).toBe(1)
    })
  })

  describe('checkRoleAvailability', () => {
    beforeEach(() => {
      // Reset global mocks
      ;(global as any).mockMongoToArray.mockReturnValue([])
    })

    it('should allow unlimited vacations for gestion role', async () => {
      ;(global as any).mockMongoToArray.mockReturnValue([])

      const mockDb = {
        collection: jest.fn(() => ({
          find: (global as any).mockMongoFind,
        })),
      }

      const result = await checkRoleAvailability(
        mockDb,
        'gestion',
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )

      expect(result).toBe(true)
    })

    it('should allow up to 3 oficial users', async () => {
      ;(global as any).mockMongoToArray.mockReturnValue([
        { usuarioId: '1', rolUsuario: 'oficial' },
        { usuarioId: '2', rolUsuario: 'oficial' },
      ])

      const mockDb = {
        collection: jest.fn(() => ({
          find: (global as any).mockMongoFind,
        })),
      }

      const result = await checkRoleAvailability(
        mockDb,
        'oficial',
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )

      expect(result).toBe(true) // 2 < 3, so available
    })

    it('should reject when oficial limit exceeded', async () => {
      ;(global as any).mockMongoToArray.mockReturnValue([
        { usuarioId: '1', rolUsuario: 'oficial' },
        { usuarioId: '2', rolUsuario: 'oficial' },
        { usuarioId: '3', rolUsuario: 'oficial' },
      ])

      const mockDb = {
        collection: jest.fn(() => ({
          find: (global as any).mockMongoFind,
        })),
      }

      const result = await checkRoleAvailability(
        mockDb,
        'oficial',
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )

      expect(result).toBe(false) // 3 >= 3, not available
    })

    it('should check combined contabilidad + recepcion limit', async () => {
      ;(global as any).mockMongoToArray.mockReturnValue([
        { usuarioId: '1', rolUsuario: 'contabilidad' },
        { usuarioId: '2', rolUsuario: 'contabilidad' },
        { usuarioId: '3', rolUsuario: 'recepcion' },
      ])

      const mockDb = {
        collection: jest.fn(() => ({
          find: (global as any).mockMongoFind,
        })),
      }

      const result = await checkRoleAvailability(
        mockDb,
        'contabilidad',
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )

      expect(result).toBe(false) // 3 >= 3, not available
    })

    it('should allow only 1 copista at a time', async () => {
      ;(global as any).mockMongoToArray.mockReturnValue([
        { usuarioId: '1', rolUsuario: 'copista' },
      ])

      const mockDb = {
        collection: jest.fn(() => ({
          find: (global as any).mockMongoFind,
        })),
      }

      const result = await checkRoleAvailability(
        mockDb,
        'copista',
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )

      expect(result).toBe(false) // 1 >= 1, not available
    })

    it('should allow up to 2 users for default roles', async () => {
      ;(global as any).mockMongoToArray.mockReturnValue([
        { usuarioId: '1', rolUsuario: 'default' },
      ])

      const mockDb = {
        collection: jest.fn(() => ({
          find: (global as any).mockMongoFind,
        })),
      }

      const result = await checkRoleAvailability(
        mockDb,
        'default',
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )

      expect(result).toBe(true) // 1 < 2, available
    })
  })
})
