import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CallbackPage from '../page'

const mockHandleCallback = jest.fn()
const mockUseSearchParams = jest.fn()
const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/app/hooks/useGitHubOAuth', () => ({
  useGitHubOAuth: () => ({
    handleCallback: mockHandleCallback,
    isLoading: true,
    error: null,
  }),
}))

describe('CallbackPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state', () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((param) => {
        if (param === 'code') return 'test-code'
        if (param === 'state') return 'test-state'
        return null
      }),
    })

    render(<CallbackPage />)
    
    expect(screen.getByText('Completing Authentication')).toBeInTheDocument()
  })

  it('should handle GitHub OAuth error', () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((param) => {
        if (param === 'error') return 'access_denied'
        if (param === 'error_description') return 'User cancelled'
        return null
      }),
    })

    render(<CallbackPage />)
    
    expect(screen.getByText('Authentication Failed')).toBeInTheDocument()
    expect(screen.getByText('You cancelled the GitHub authorization.')).toBeInTheDocument()
  })
})