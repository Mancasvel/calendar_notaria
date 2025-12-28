import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SolicitarVacacionesPage from '@/app/solicitar-vacaciones/page'
import { useSession } from 'next-auth/react'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock fetch
global.fetch = jest.fn()

describe('SolicitarVacacionesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('shows loading when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    } as any)

    render(<SolicitarVacacionesPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    } as any)

    render(<SolicitarVacacionesPage />)

    // Component should not render anything when unauthenticated
    expect(screen.queryByText(/solicitar vacaciones/i)).not.toBeInTheDocument()
  })

  it('renders form when authenticated', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          diasVacaciones: 25,
        },
      },
      status: 'authenticated',
    } as any)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ diasVacaciones: 25 }),
    })

    render(<SolicitarVacacionesPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Solicitar Vacaciones' })).toBeInTheDocument()
    })
    
    expect(screen.getByText('Días de vacaciones disponibles: 25')).toBeInTheDocument()
    expect(screen.getByLabelText('Fecha de inicio')).toBeInTheDocument()
    expect(screen.getByLabelText('Fecha de fin')).toBeInTheDocument()
  })

  it('checks availability when dates are selected', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          diasVacaciones: 25,
        },
      },
      status: 'authenticated',
    } as any)

    ;(global.fetch as jest.Mock)
      // Mock initial call to /api/usuarios/me
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ diasVacaciones: 25 }),
      })
      // Mock availability check
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          available: true,
          roleAvailable: true,
          hasEnoughDays: true,
          requestedDays: 5,
          remainingDays: 20,
        }),
      })

    render(<SolicitarVacacionesPage />)

    const startDateInput = screen.getByLabelText('Fecha de inicio')
    const endDateInput = screen.getByLabelText('Fecha de fin')
    const checkButton = screen.getByRole('button', { name: /verificar disponibilidad/i })

    fireEvent.change(startDateInput, { target: { value: '2026-01-01' } })
    fireEvent.change(endDateInput, { target: { value: '2026-01-05' } })

    fireEvent.click(checkButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/vacaciones/disponibilidad?start=2026-01-01&end=2026-01-05'
      )
    })
  })

  it('shows availability results', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          diasVacaciones: 25,
        },
      },
      status: 'authenticated',
    } as any)

    // Mock all fetch calls with a default implementation
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/usuarios/me')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ diasVacaciones: 25 }),
        })
      }
      if (url.includes('/api/vacaciones/disponibilidad')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            available: true,
            roleAvailable: true,
            hasEnoughDays: true,
            requestedDays: 5,
            remainingDays: 20,
          }),
        })
      }
      return Promise.resolve({ ok: false, json: async () => ({}) })
    })

    render(<SolicitarVacacionesPage />)

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByLabelText('Fecha de inicio')).toBeInTheDocument()
    })

    const startDateInput = screen.getByLabelText('Fecha de inicio')
    const endDateInput = screen.getByLabelText('Fecha de fin')
    const checkButton = screen.getByRole('button', { name: /verificar disponibilidad/i })

    fireEvent.change(startDateInput, { target: { value: '2026-01-01' } })
    fireEvent.change(endDateInput, { target: { value: '2026-01-05' } })
    fireEvent.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText(/Fechas disponibles/i)).toBeInTheDocument()
    })
    
    expect(screen.getByText(/Días solicitados: 5/i)).toBeInTheDocument()
  })

  it('shows error when availability check fails', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          diasVacaciones: 25,
        },
      },
      status: 'authenticated',
    } as any)

    // Mock all fetch calls with a default implementation
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/usuarios/me')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ diasVacaciones: 25 }),
        })
      }
      if (url.includes('/api/vacaciones/disponibilidad')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Database connection failed' }),
        })
      }
      return Promise.resolve({ ok: false, json: async () => ({}) })
    })

    render(<SolicitarVacacionesPage />)

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByLabelText('Fecha de inicio')).toBeInTheDocument()
    })

    const startDateInput = screen.getByLabelText('Fecha de inicio')
    const endDateInput = screen.getByLabelText('Fecha de fin')
    const checkButton = screen.getByRole('button', { name: /verificar disponibilidad/i })

    fireEvent.change(startDateInput, { target: { value: '2026-01-01' } })
    fireEvent.change(endDateInput, { target: { value: '2026-01-05' } })
    fireEvent.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeInTheDocument()
    })
  })

  it('submits vacation request when available', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          diasVacaciones: 25,
        },
      },
      status: 'authenticated',
    } as any)

    ;(global.fetch as jest.Mock)
      // Mock initial call to /api/usuarios/me
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ diasVacaciones: 25 }),
      })
      // Mock availability check
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          available: true,
          roleAvailable: true,
          hasEnoughDays: true,
          requestedDays: 5,
          remainingDays: 20,
        }),
      })
      // Mock vacation request
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          vacationId: '123',
          daysUsed: 5,
          remainingDays: 20,
        }),
      })
      // Mock second call to /api/usuarios/me after submission
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ diasVacaciones: 20 }),
      })

    render(<SolicitarVacacionesPage />)

    const startDateInput = screen.getByLabelText('Fecha de inicio')
    const endDateInput = screen.getByLabelText('Fecha de fin')
    const checkButton = screen.getByRole('button', { name: /verificar disponibilidad/i })
    const submitButton = screen.getByRole('button', { name: /solicitar vacaciones/i })

    fireEvent.change(startDateInput, { target: { value: '2026-01-01' } })
    fireEvent.change(endDateInput, { target: { value: '2026-01-05' } })
    fireEvent.click(checkButton)

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/vacaciones/solicitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fechaInicio: '2026-01-01',
          fechaFin: '2026-01-05',
        }),
      })
    })
  })

  it('disables submit button when dates are not available', async () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          diasVacaciones: 25,
        },
      },
      status: 'authenticated',
    } as any)

    ;(global.fetch as jest.Mock)
      // Mock initial call to /api/usuarios/me
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ diasVacaciones: 25 }),
      })
      // Mock availability check returning false
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          available: false,
          roleAvailable: false,
          hasEnoughDays: true,
          requestedDays: 5,
          remainingDays: 20,
        }),
      })

    render(<SolicitarVacacionesPage />)

    const startDateInput = screen.getByLabelText('Fecha de inicio')
    const endDateInput = screen.getByLabelText('Fecha de fin')
    const checkButton = screen.getByRole('button', { name: /verificar disponibilidad/i })

    fireEvent.change(startDateInput, { target: { value: '2026-01-01' } })
    fireEvent.change(endDateInput, { target: { value: '2026-01-05' } })
    fireEvent.click(checkButton)

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Solicitar Vacaciones' })
      expect(submitButton).toBeDisabled()
    })
  })
})
