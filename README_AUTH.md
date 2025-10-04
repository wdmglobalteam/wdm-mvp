<!-- --- filename: README_AUTH.md --- -->
# WDM PathMastery - Authentication & Onboarding Documentation

## Overview

This document describes the complete auth & onboarding system implementation for WDM PathMastery. The system uses **Supabase Auth** for authentication with custom server-side session management, secure token handling, and multi-step onboarding persistence.

## Architecture

### Tech Stack
- **Next.js 14** (App Router) - Full-stack framework
- **Supabase Auth** - Core authentication (email/password + OAuth)
- **Supabase Postgres** - User data, profiles, sessions
- **Supabase Storage** - Avatar uploads
- **Resend** - Transactional emails
- **TypeScript** - Strict typing throughout

### Design Decisions

#### 1. Server-Side Sessions vs Supabase JWT
**Decision**: Implement server-managed opaque sessions with secure HttpOnly cookies.

**Rationale**:
- Better security: tokens never exposed to client JavaScript
- Easier revocation: delete DB row vs JWT blacklisting
- Audit trail: track session usage
- Flexibility: custom session metadata

**Trade-off**: Additional DB queries per request (mitigated with connection pooling).

#### 2. Custom Token Management
**Decision**: Use SHA-256 hashed tokens stored in `reset_tokens` table.

**Rationale**:
- Single-use enforcement
- Precise expiration control
- Audit trail for security events
- Independent of Supabase Auth token lifecycle

#### 3. Service Role Key Usage
**Decision**: All privileged operations run server-side with service role key.

**Security**:
- Never exposed to client
- RLS bypassed only where necessary
- Audit logging for all privileged operations

## Database Schema

### Tables Created
```sql
-- Auth sessions (server-managed)
auth_sessions
  - id: UUID
  - user_id: UUID (FK to auth.users)
  - token_hash: TEXT (SHA-256 hash)
  - expires_at: TIMESTAMPTZ
  - last_used_at: TIMESTAMPTZ
  - ip_address: TEXT
  - user_agent: TEXT

-- Reset/verification tokens
reset_tokens
  - id: UUID
  - user_id: UUID (FK to auth.users)
  - token_hash: TEXT (SHA-256 hash)
  - token_type: TEXT ('reset' | 'verify')
  - expires_at: TIMESTAMPTZ
  - used_at: TIMESTAMPTZ
  - ip_address: TEXT
  - user_agent: TEXT

-- Security audit logs
audit_logs
  - id: UUID
  - user_id: UUID (nullable)
  - event_type: TEXT
  - event_metadata: JSONB
  - ip_address: TEXT
  - user_agent: TEXT
  - created_at: TIMESTAMPTZ

-- RLS Policies
All new tables have RLS enabled with service role bypass:

  - Users can only SELECT their own sessions
  - No direct user access to reset_tokens or audit_logs
  - Service role can perform all operations

-- API Endpoints
Authentication
POST /api/auth/signup
Creates new user account.
Request: