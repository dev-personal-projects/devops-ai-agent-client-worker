# Authentication Implementation Guide

## Overview

This guide covers the cleaned-up authentication system that relies on backend validation for OAuth flows. The frontend focuses on user experience while the FastAPI backend handles all security validation.

## Architecture Changes

### Key Principles

1. **Backend handles security**: State validation, token exchange, and session management
2. **Frontend handles UX**: Loading states, error display, and navigation
3. **Minimal client-side state**: Only store redirect preferences, not security tokens in sessionStorage
4. **Centralized error handling**: Consistent error messages across all flows

### What Changed

#### Before (Problematic)
- ❌ Frontend validated OAuth state (duplicate validation)
- ❌ Stored security state in sessionStorage
- ❌ Complex client-side expiry checking
- ❌ Inconsistent error handling

#### After (Clean)
- ✅ Backend validates all OAuth state
- ✅ Only store redirect preferences client-side
- ✅ Backend checks expiry and security
- ✅ Centralized error handling with user-friendly messages

## File Structure

```
src/
├── hooks/
│   ├── useGitHubOAuth.ts          # OAuth login hook (cleaned)
│   ├── useGitHubLink.ts           # Account linking hook (cleaned)
│   └── auth.ts                     # Auth state hook
├── lib/
│   ├── api/
│   │   ├── auth/
│   │   │   └── auth-apiclient.ts  # Auth API client (updated)
│   │   ├── base-client.ts          # Base API client
│   │   └── token/
│   │       └── token-manager.ts    # Token management
│   └── utils/
│       ├── oauth-error-handler.ts  # Centralized error handling
│       └── auth-constants.ts       # Auth constants
├── types/
│   └── auth/
│       ├── auth.types.ts           # Auth types
│       └── oauth.types.ts          # OAuth types (new)
├── components/
│   └── oauth-error-boundary.tsx    # Error boundary (new)
├── app/
│   └── auth/
│       └── callback/
│           └── page.tsx             # Callback handler (cleaned)
└── config/
    └── env.config.ts                # Environment config (new)
```

## Implementation Steps

### 1. Update Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXT_PUBLIC_APP_URL=https://your-app-url.com  # Optional, auto-detected
NEXT_PUBLIC_APP_ENV=development                # development | staging | production
```

### 2. Install Dependencies

All required dependencies should already be installed. If not:

```bash
npm install
# or
yarn install
```

### 3. Update Import Paths

Replace old imports with new ones:

```typescript
// Old
import { useGitHubOAuth } from "@/hooks/useGitHubOAuth";

// New (same import, but updated implementation)
import { useGitHubOAuth } from "@/hooks/useGitHubOAuth";
import { handleOAuthError } from "@/lib/utils/oauth-error-handler";
import { AUTH_ERROR_MESSAGES } from "@/lib/utils/auth-constants";
```

### 4. Update Backend Integration

The backend controller (`auth_controller.py`) already handles:
- ✅ State generation and storage
- ✅ State validation on callback
- ✅ CSRF protection
- ✅ Token exchange
- ✅ Session management

No backend changes needed if using the provided `auth_controller.py`.

## Usage Examples

### OAuth Login Flow

```typescript
"use client";
import { useGitHubOAuth } from "@/hooks/useGitHubOAuth";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const { initiateGitHubLogin, isLoading, error } = useGitHubOAuth();

  const handleGitHubLogin = () => {
    initiateGitHubLogin({
      forceAccountSelection: false, // Optional
      redirectTo: "/dashboard",     // Optional
    });
  };

  return (
    <div>
      <Button 
        onClick={handleGitHubLogin}
        disabled={isLoading}
      >
        {isLoading ? "Connecting..." : "Continue with GitHub"}
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### Account Linking Flow

```typescript
"use client";
import { useGitHubLink } from "@/hooks/useGitHubLink";
import { Button } from "@/components/ui/button";

export function SettingsPage() {
  const { 
    linkGitHub, 
    updateGitHub, 
    disconnectGitHub,
    isLinking,
    linkError 
  } = useGitHubLink();

  return (
    <div>
      {/* Link new account */}
      <Button 
        onClick={() => linkGitHub(true)}
        disabled={isLinking}
      >
        Link GitHub Account
      </Button>

      {/* Update existing account */}
      <Button 
        onClick={updateGitHub}
        disabled={isLinking}
      >
        Change GitHub Account
      </Button>

      {/* Disconnect */}
      <Button 
        onClick={disconnectGitHub}
        variant="destructive"
      >
        Disconnect GitHub
      </Button>

      {linkError && <p className="text-red-500">{linkError}</p>}
    </div>
  );
}
```

### Callback Handling

The callback page is already implemented in `src/app/auth/callback/page.tsx`. It:
- Extracts `code` and `state` from URL
- Sends to backend for validation
- Handles success/error states
- Redirects appropriately

No additional code needed in your pages.

### Error Handling

```typescript
import { handleOAuthError, logOAuthError } from "@/lib/utils/oauth-error-handler";

try {
  await initiateGitHubLogin();
} catch (error) {
  const oauthError = handleOAuthError(error, "login");
  logOAuthError(oauthError, "LoginPage");
  
  // Show user-friendly message
  alert(oauthError.userMessage);
  
  // Check if retryable
  if (oauthError.canRetry) {
    // Show retry button
  }
}
```

## Security Considerations

### What Backend Validates

1. **OAuth State**: Generated with cryptographic randomness, stored server-side
2. **State Expiry**: 10-minute expiry window (configurable)
3. **CSRF Protection**: State parameter prevents CSRF attacks
4. **Code Exchange**: Securely exchanges authorization code for tokens
5. **Session Management**: Manages refresh tokens and session invalidation

### What Frontend Does

1. **Display UX**: Loading states, error messages, success confirmations
2. **Navigation**: Redirects after successful auth
3. **Preference Storage**: Only stores non-security data (redirect URLs)
4. **Token Storage**: Uses httpOnly cookies (set by backend)

### Security Best Practices

✅ **DO**:
- Use the provided hooks for OAuth flows
- Display user-friendly error messages
- Clear sessionStorage on errors
- Use HTTPS in production
- Trust backend validation

❌ **DON'T**:
- Store OAuth state in frontend
- Validate state client-side
- Store tokens in localStorage (use httpOnly cookies)
- Bypass backend validation
- Trust user input without backend validation

## Testing

### Unit Tests

```typescript
// Example: Testing useGitHubOAuth hook
import { renderHook, act } from "@testing-library/react";
import { useGitHubOAuth } from "@/hooks/useGitHubOAuth";

describe("useGitHubOAuth", () => {
  it("initiates GitHub login", async () => {
    const { result } = renderHook(() => useGitHubOAuth());
    
    await act(async () => {
      await result.current.initiateGitHubLogin();
    });
    
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Integration Tests

Test the full flow:
1. Click "Continue with GitHub"
2. Redirect to GitHub
3. Authorize application
4. Redirect back to callback
5. Backend validates state
6.