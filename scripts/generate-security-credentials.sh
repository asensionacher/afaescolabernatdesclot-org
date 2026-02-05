#!/bin/bash

###############################################################################
# Security Credentials Generator
# Generates JWT_SECRET and password hash for secure authentication
# 
# Usage: ./scripts/generate-security-credentials.sh [password]
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Functions
log() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

generate_jwt_secret() {
    # Generate 64 bytes (512 bits) of random data
    openssl rand -hex 64
}

hash_password() {
    local password=$1
    
    # Check if Node.js and bcrypt are available
    if ! command -v node &> /dev/null; then
        log "$RED" "❌ Error: Node.js is not installed"
        log "$YELLOW" "Install Node.js to use bcrypt hashing"
        exit 1
    fi
    
    # Use Node.js to hash with bcrypt
    node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('$password', 12).then(hash => {
    console.log(hash);
}).catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
" 2>/dev/null
}

prompt_password() {
    echo -en "${CYAN}Enter the password to hash: ${NC}"
    read -s password
    echo
    echo "$password"
}

main() {
    log "$MAGENTA" ""
    log "$MAGENTA" "══════════════════════════════════════════════════════════════════════"
    log "$MAGENTA" "🔐 SECURITY CREDENTIALS GENERATOR"
    log "$MAGENTA" "══════════════════════════════════════════════════════════════════════"
    echo

    # Get password from argument or prompt
    PASSWORD="$1"
    
    if [ -z "$PASSWORD" ]; then
        log "$YELLOW" "⚠️  No password provided as argument"
        PASSWORD=$(prompt_password)
    fi

    if [ -z "$PASSWORD" ]; then
        log "$RED" ""
        log "$RED" "❌ Error: Password cannot be empty"
        exit 1
    fi

    log "$CYAN" ""
    log "$CYAN" "🔄 Generating credentials..."

    # Generate JWT secret
    JWT_SECRET=$(generate_jwt_secret)
    
    if [ -z "$JWT_SECRET" ]; then
        log "$RED" ""
        log "$RED" "❌ Error: Failed to generate JWT secret"
        log "$YELLOW" "Make sure openssl is installed"
        exit 1
    fi

    # Hash password
    log "$CYAN" "⏳ Hashing password (this may take a few seconds)..."
    PASSWORD_HASH=$(hash_password "$PASSWORD")
    
    if [ -z "$PASSWORD_HASH" ]; then
        log "$RED" ""
        log "$RED" "❌ Error: Failed to hash password"
        log "$YELLOW" "Make sure bcrypt is installed: pnpm install bcrypt"
        exit 1
    fi

    log "$GREEN" ""
    log "$GREEN" "✅ Credentials generated successfully!"
    echo

    # Display results
    log "$BLUE" "══════════════════════════════════════════════════════════════════════"
    log "$BLUE" "📋 COPY THESE TO YOUR .env.local FILE"
    log "$BLUE" "══════════════════════════════════════════════════════════════════════"

    echo
    log "$YELLOW" "# Authentication (SECURE - Generated $(date +%Y-%m-%d))"
    log "$YELLOW" "# IMPORTANT: Hash is base64-encoded to avoid \$ character issues in Next.js"
    log "$GREEN" "JWT_SECRET=$JWT_SECRET"

    # Encode the bcrypt hash to base64 to avoid $ issues in Next.js
    PASSWORD_HASH_BASE64=$(echo -n "$PASSWORD_HASH" | base64 | tr -d '\n')
    log "$GREEN" "ACTAS_PASSWORD_HASH_BASE64=$PASSWORD_HASH_BASE64"

    echo
    log "$CYAN" "  📝 Original bcrypt hash (for reference): $PASSWORD_HASH"
    log "$CYAN" "  📦 Base64 encoded for Next.js: $PASSWORD_HASH_BASE64"

    echo
    log "$BLUE" "══════════════════════════════════════════════════════════════════════"

    # Verification
    echo
    log "$CYAN" "🔍 VERIFICATION:"
    log "$CYAN" "  Original password: ${YELLOW}$PASSWORD${NC}"
    log "$CYAN" "  Password length: ${#PASSWORD} characters"
    log "$CYAN" "  JWT Secret length: ${#JWT_SECRET} characters (128 hex = 512 bits)"
    log "$CYAN" "  Hash algorithm: bcrypt (12 rounds)"

    # Security notes
    echo
    log "$YELLOW" "══════════════════════════════════════════════════════════════════════"
    log "$YELLOW" "🛡️  SECURITY NOTES"
    log "$YELLOW" "══════════════════════════════════════════════════════════════════════"
    echo
    log "$YELLOW" "1. ✅ Add these to .env.local (NOT .env.local.example)"
    log "$YELLOW" "2. ✅ Never commit .env.local to git"
    log "$YELLOW" "3. ✅ Keep JWT_SECRET secret - it signs all tokens"
    log "$YELLOW" "4. ✅ Password is hashed with bcrypt and base64-encoded"
    log "$YELLOW" "5. ⚠️  If you change JWT_SECRET, all sessions will be invalidated"
    log "$YELLOW" "6. ⚠️  If you change password, regenerate the hash"

    echo
    log "$GREEN" "══════════════════════════════════════════════════════════════════════"
    log "$GREEN" "✨ Next steps:"
    log "$GREEN" "══════════════════════════════════════════════════════════════════════"
    echo
    log "$CYAN" "1. Copy the variables above to .env.local"
    log "$CYAN" "2. Remove old ACTAS_PASSWORD variable (if exists)"
    log "$CYAN" "3. Restart your dev server: pnpm dev"
    log "$CYAN" "4. Test login at http://localhost:3000/actas"
    log "$CYAN" "5. Verify cookie forgery is blocked"
    echo

    # Example .env.local
    log "$MAGENTA" "══════════════════════════════════════════════════════════════════════"
    log "$MAGENTA" "📝 EXAMPLE .env.local"
    log "$MAGENTA" "══════════════════════════════════════════════════════════════════════"
    
    cat << EOF

# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=cpaqkfmb
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-21
SANITY_API_TOKEN=your_token_here

# Authentication (NEW - SECURE)
# IMPORTANT: Hash is base64-encoded to avoid $ character issues
JWT_SECRET=$JWT_SECRET
ACTAS_PASSWORD_HASH_BASE64=$PASSWORD_HASH_BASE64

# Other configs...
NEXT_PUBLIC_BASE_URL=https://your-domain.com

EOF

    log "$MAGENTA" "══════════════════════════════════════════════════════════════════════"
    echo
}

# Run main function
main "$@"
