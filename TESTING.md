# Testing Guide for Next.js Applications

## Why Testing Matters

**Testing prevents bugs from reaching production and saves time by:**
- Catching errors early in development
- Ensuring code changes don't break existing functionality
- Providing documentation of how code should behave
- Enabling confident refactoring and feature additions
- Reducing debugging time and production hotfixes

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest
```

### 2. Create Configuration Files

**jest.config.js**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: { // Fixed typo: was moduleNameMapping
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

**jest.setup.js**
```javascript
import '@testing-library/jest-dom'

// Mock fetch for API tests
global.fetch = jest.fn()

// Mock localStorage and sessionStorage
const storageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = storageMock
global.sessionStorage = storageMock

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
})
```

### 3. Add Scripts to package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Essential Testing Patterns

### File Organization
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
├── lib/api/
│   ├── auth-client.ts
│   └── __tests__/
│       └── auth-client.test.ts
└── app/
    ├── login/
    │   ├── page.tsx
    │   └── __tests__/
    │       └── page.test.tsx
```

### 1. Component Testing (UI)
```typescript
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Button from '../Button'

describe('Button', () => {
  it('renders and handles click', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByText('Click me')
    expect(button).toBeInTheDocument()
    
    button.click()
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### 2. Hook Testing (Logic)
```typescript
import { renderHook, act } from '@testing-library/react'
import { useGitHubOAuth } from '../useGitHubOAuth'
import { apiClient } from '@/lib/api/auth-apiclient'

jest.mock('@/lib/api/auth-apiclient', () => ({
  apiClient: {
    initiateGitHubOAuth: jest.fn(),
    handleGitHubCallback: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('useGitHubOAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('initiates GitHub login successfully', async () => {
    mockApiClient.initiateGitHubOAuth.mockResolvedValue({
      data: { auth_url: 'https://github.com/oauth', state: 'test' },
      error: undefined,
      status: 200,
    })

    const { result } = renderHook(() => useGitHubOAuth())

    await act(async () => {
      await result.current.initiateGitHubLogin()
    })

    expect(mockApiClient.initiateGitHubOAuth).toHaveBeenCalled()
    expect(window.location.href).toBe('https://github.com/oauth')
  })
})
```

### 3. API Testing (Network)
```typescript
import { apiClient } from '../auth-apiclient'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handles GitHub OAuth successfully', async () => {
    const mockResponse = {
      auth_url: 'https://github.com/oauth',
      state: 'test-state',
    }
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await apiClient.initiateGitHubOAuth()

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/auth/oauth/github',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
    expect(result.data).toEqual(mockResponse)
  })

  it('handles API errors', async () => {
    const errorData = { detail: 'OAuth failed' }
    
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve(errorData),
    })

    const result = await apiClient.initiateGitHubOAuth()

    expect(result.error).toEqual(errorData)
    expect(result.status).toBe(400)
  })
})
```

## Common Testing Scenarios

### Page/Route Testing
```typescript
import { render, screen } from '@testing-library/react'
import CallbackPage from '../page'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn((param) => {
      if (param === 'error') return 'access_denied'
      return null
    }),
  }),
  useRouter: () => ({ push: jest.fn() }),
}))

// Mock custom hooks
jest.mock('@/app/hooks/useGitHubOAuth', () => ({
  useGitHubOAuth: () => ({
    handleCallback: jest.fn(),
    isLoading: false,
    error: null,
  }),
}))

describe('CallbackPage', () => {
  it('shows error when GitHub OAuth fails', () => {
    render(<CallbackPage />)
    expect(screen.getByText('Authentication Failed')).toBeInTheDocument()
  })
})
```

## Essential Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should handle"
```

## Quick Reference

### Must-Know Functions
- `describe()` - Group related tests
- `it()` - Individual test case
- `expect()` - Make assertions
- `jest.fn()` - Create mock function
- `jest.mock()` - Mock entire module
- `beforeEach()` - Setup before each test

### Essential Matchers
- `toBeInTheDocument()` - Element exists
- `toHaveBeenCalledWith()` - Function called with args
- `toBe()` - Exact match
- `toEqual()` - Deep equality
- `toBeUndefined()` - Value is undefined

### Mock Patterns
```typescript
// Mock function
const mockFn = jest.fn()
mockFn.mockReturnValue('result')
mockFn.mockResolvedValue(Promise.resolve('async result'))

// Mock module
jest.mock('./module', () => ({
  functionName: jest.fn(),
}))

// Mock with custom implementation
jest.mock('./api', () => ({
  fetchData: jest.fn().mockImplementation(() => 
    Promise.resolve({ data: 'test' })
  ),
}))
```

## Testing Strategy

### What to Test (Priority Order)
1. **Critical user flows** (login, payment, data submission)
2. **Error handling** (network failures, validation errors)
3. **Edge cases** (empty states, loading states)
4. **Business logic** (calculations, transformations)
5. **UI interactions** (clicks, form submissions)

### What NOT to Test
- Third-party library internals
- Implementation details (CSS classes, internal state)
- Trivial getters/setters
- Static content

## Adoption Strategy

### Week 1: Setup
- Install dependencies and configure Jest
- Write 2-3 simple component tests
- Set up CI to run tests

### Week 2: Core Features
- Test critical user authentication flows
- Add API client tests
- Test error handling

### Week 3: Expand Coverage
- Test remaining components
- Add integration tests
- Aim for 70%+ coverage on critical paths

### Ongoing
- Write tests for new features
- Fix failing tests immediately
- Refactor tests when refactoring code

## Best Practices

1. **Test user behavior, not code implementation**
2. **Use descriptive test names** (`should redirect to dashboard after successful login`)
3. **Mock external dependencies** (APIs, third-party libraries)
4. **Always test error cases** (network failures, invalid inputs)
5. **Keep tests isolated** (each test should work independently)
6. **Use `act()` for state updates** (prevents React warnings)
7. **Clean up mocks** (`jest.clearAllMocks()` in `beforeEach`)
8. **Test the happy path first**, then edge cases
9. **Write tests before fixing bugs** (reproduce the issue)
10. **Keep tests simple and focused** (one concept per test)