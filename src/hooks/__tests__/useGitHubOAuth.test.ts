import { renderHook, act } from '@testing-library/react'
import { useGitHubOAuth } from '../useGitHubOAuth'
import { apiClient } from '@/lib/api/auth-apiclient'

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
})

jest.mock('@/lib/api/auth-apiclient', () => ({
  apiClient: {
    initiateGitHubOAuth: jest.fn(),
    handleGitHubCallback: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>
const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('useGitHubOAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionStorage.getItem.mockClear()
    mockSessionStorage.setItem.mockClear()
    window.location.href = ''
  })

  describe('initiateGitHubLogin', () => {
    it('should initiate GitHub login successfully', async () => {
      const mockResponse = {
        data: {
          auth_url: 'https://github.com/login/oauth/authorize?client_id=test',
          state: 'test-state',
        },
        error: undefined,
        status: 200,
      }
      mockApiClient.initiateGitHubOAuth.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useGitHubOAuth())

      await act(async () => {
        await result.current.initiateGitHubLogin()
      })

      expect(mockApiClient.initiateGitHubOAuth).toHaveBeenCalledWith(undefined)
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('github_oauth_state', 'test-state')
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('github_oauth_timestamp', expect.any(String))
      expect(window.location.href).toBe('https://github.com/login/oauth/authorize?client_id=test')
    })

    it('should handle API errors', async () => {
      const mockResponse = {
        data: undefined,
        error: { detail: 'OAuth initialization failed' },
        status: 400,
      }
      mockApiClient.initiateGitHubOAuth.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useGitHubOAuth())

      await act(async () => {
        await result.current.initiateGitHubLogin()
      })

      expect(result.current.error).toBe('OAuth initialization failed')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('handleCallback', () => {
    it('should handle callback successfully', async () => {
      mockSessionStorage.getItem
        .mockReturnValueOnce('test-state')
        .mockReturnValueOnce(Date.now().toString())
        .mockReturnValueOnce('/dashboard')

      const mockResponse = {
        data: {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          token_type: 'Bearer',
          expires_in: 3600,
          user: {
            id: 'test-id',
            email: 'test@example.com',
            fullName: 'Test User'
          }
        },
        error: undefined,
        status: 200,
      }
      mockApiClient.handleGitHubCallback.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useGitHubOAuth())

      let callbackResult
      await act(async () => {
        callbackResult = await result.current.handleCallback('test-code', 'test-state')
      })

      expect(callbackResult).toBe(true)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('should reject invalid state', async () => {
      mockSessionStorage.getItem
        .mockReturnValueOnce('different-state')

      const { result } = renderHook(() => useGitHubOAuth())

      let callbackResult
      await act(async () => {
        callbackResult = await result.current.handleCallback('test-code', 'test-state')
      })

      expect(callbackResult).toBe(false)
      expect(result.current.error).toBe('Invalid authentication state. Please try again.')
    })
  })
})