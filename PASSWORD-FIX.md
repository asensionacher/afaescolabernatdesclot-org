# Password Hash Fix - Base64 Encoding Solution

**Date:** 2026-02-06  
**Status:** ✅ RESOLVED

## Problem

The `/actas` authentication system was rejecting correct passwords due to Next.js misinterpreting bcrypt hashes stored in `.env.local`.

### Root Cause

Bcrypt hashes contain `$` characters (e.g., `$2b$12$...`). When stored in `.env.local`, Next.js was interpreting these as environment variable interpolation syntax, causing the hash to be truncated or corrupted.

**Example:**
```env
# What we stored:
ACTAS_PASSWORD_HASH=$2b$12$c387eHEXZ7PQubIV0Ti4eO06F.jjspz0PXUjZimVsdFQ7LyKMgSjS

# What Next.js read:
# Only the last part: ".jjspz0PXUjZimVsdFQ7LyKMgSjS"
# The $2b$12$ prefix was lost
```

### Evidence from Logs

```
🔍 Password hash from env: .jjspz0PXUjZimVsdFQ7LyKMgSjS...  ❌ Missing prefix
🔍 Hash length: 28  ❌ Should be 60
🔍 bcrypt.compare result: false  ❌ Failed verification
```

Valid bcrypt hash should:
- Start with `$2b$12$` (algorithm + cost factor)
- Be exactly 60 characters long
- Next.js was reading only 28 characters (the last segment)

## Solution: Base64 Encoding

Store the bcrypt hash as **base64-encoded** to avoid special character issues.

### Updated `.env.local` Format

```env
# OLD (doesn't work in Next.js):
ACTAS_PASSWORD_HASH=$2b$12$c387eHEXZ7PQubIV0Ti4eO06F.jjspz0PXUjZimVsdFQ7LyKMgSjS

# NEW (works everywhere):
ACTAS_PASSWORD_HASH_BASE64=JDJiJDEyJGMzODdlSEVYWjdQUXViSVYwVGk0ZU8wNkYuampzcHowUFhValppbVZzZEZRN0x5S01nU2pT
```

### Code Changes

Updated `src/lib/auth.ts`:

```typescript
function getPasswordHash(): string {
  const hashBase64 = process.env.ACTAS_PASSWORD_HASH_BASE64
  
  if (!hashBase64) {
    throw new Error('ACTAS_PASSWORD_HASH_BASE64 not configured')
  }
  
  // Decode from base64
  const hash = Buffer.from(hashBase64, 'base64').toString('utf-8')
  
  return hash  // Returns: $2b$12$c387eHEXZ7PQ... (60 chars)
}
```

### Updated Scripts

1. **`scripts/generate-security-credentials.sh`**
   - Now outputs `ACTAS_PASSWORD_HASH_BASE64` instead of `ACTAS_PASSWORD_HASH`
   - Automatically encodes bcrypt hash to base64

2. **`scripts/verify-password.js`**
   - Reads `ACTAS_PASSWORD_HASH_BASE64` from environment
   - Decodes before verification
   - Shows both base64 and decoded values

## Testing

### Before Fix
```bash
node scripts/verify-password.js "Wildness4-Chop8-Stung1-Theme0"
# ✅ Password matches (when using dotenv)
# ❌ Login fails in Next.js (hash corrupted)
```

### After Fix
```bash
node scripts/verify-password.js "Wildness4-Chop8-Stung1-Theme0"
# ✅ Password matches

# Login at http://localhost:3000/actas
# ✅ Login succeeds
```

### Verification Logs (After Fix)
```
🔍 Base64 value: JDJiJDEyJGMzODdlSEVYWjdQUXViSVYwVGk0ZU8wNkYu...
🔍 Decoded hash length: 60  ✅ Correct
🔍 Decoded hash starts with: $2b$12$c38  ✅ Valid bcrypt format
🔍 bcrypt.compare result: true  ✅ Password matches
✅ Successful login
```

## Current Credentials

**Password:** `Wildness4-Chop8-Stung1-Theme0`

**`.env.local` (working):**
```env
JWT_SECRET=5c387068093dafc7654fda5456a8175d326aa1e8b579ab35b6b081a222d1b5449e69ad97516a15f9f634738a9609685ebf6fbfa9eeaf8ed015cedfece0dc3f16
ACTAS_PASSWORD_HASH_BASE64=JDJiJDEyJGMzODdlSEVYWjdQUXViSVYwVGk0ZU8wNkYuampzcHowUFhValppbVZzZEZRN0x5S01nU2pT
```

## Files Updated

1. `src/lib/auth.ts` - Added base64 decoding
2. `scripts/generate-security-credentials.sh` - Outputs base64-encoded hash
3. `scripts/verify-password.js` - Reads and decodes base64 hash
4. `.env.local` - Changed to `ACTAS_PASSWORD_HASH_BASE64`
5. `.env.local.example` - Updated documentation

## Why Base64?

Base64 encoding uses only safe characters: `A-Z`, `a-z`, `0-9`, `+`, `/`, `=`

- ✅ No `$` characters to cause interpolation issues
- ✅ Works in all shells and environment file parsers
- ✅ No need for escaping or quoting
- ✅ Compatible with Next.js, dotenv, bash, etc.
- ✅ Easily reversible (decodes back to original hash)

## Lessons Learned

1. **Environment variable parsers differ**: What works in `dotenv` may not work in Next.js
2. **Special characters need careful handling**: `$`, `\`, quotes can cause issues
3. **Base64 is a universal solution**: For storing complex strings in env vars
4. **Always test in the actual runtime**: Don't assume local tests reflect production behavior
5. **Debug logging is essential**: Showing actual values (length, prefix) exposed the issue

## Related Issues

- Initial security implementation: `SECURITY-IMPLEMENTATION.md`
- Cookie forgery prevention: `SECURITY-AUDIT-ACTAS.md`
- Login instructions: `LOGIN-INSTRUCTIONS.md`

## Status

✅ **RESOLVED** - Login working correctly with base64-encoded hash
✅ All tests passing
✅ Documentation updated
✅ Scripts updated
