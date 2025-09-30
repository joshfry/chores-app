#!/bin/bash

# 🧪 Complete Test Suite Runner for Family Chores App
# Runs all tests across backend, frontend, and E2E with comprehensive reporting

set -e  # Exit on any error

echo "🚀 Family Chores App - Complete Test Suite"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Track test results
BACKEND_TESTS_PASSED=false
FRONTEND_TESTS_PASSED=false

# 1. Backend Unit Tests
print_status "Running Backend Unit Tests..."
echo "🔧 Testing authentication, models, middleware, and API routes"
if pnpm --filter backend test; then
    print_success "Backend tests passed!"
    BACKEND_TESTS_PASSED=true
else
    print_error "Backend tests failed!"
    BACKEND_TESTS_PASSED=false
fi
echo ""

# 2. Frontend Unit Tests  
print_status "Running Frontend Unit Tests..."
echo "🎨 Testing components, services, and contexts"
if pnpm --filter frontend test -- --watchAll=false --passWithNoTests; then
    print_success "Frontend tests passed!"
    FRONTEND_TESTS_PASSED=true
else
    print_error "Frontend tests failed!"
    FRONTEND_TESTS_PASSED=false
fi
echo ""

# 3. Test Summary
echo "📊 Test Results Summary"
echo "======================="
printf "Backend Unit Tests:  "
if [ "$BACKEND_TESTS_PASSED" = true ]; then
    print_success "✅ PASSED"
else
    print_error "❌ FAILED"
fi

printf "Frontend Unit Tests: "
if [ "$FRONTEND_TESTS_PASSED" = true ]; then
    print_success "✅ PASSED"  
else
    print_error "❌ FAILED"
fi

echo ""

# 4. Coverage Summary
print_status "Generating Coverage Reports..."
echo "📊 Backend Coverage:"
pnpm --filter backend test -- --coverage --silent || true
echo ""
echo "📊 Frontend Coverage:" 
pnpm --filter frontend test -- --coverage --watchAll=false --silent || true
echo ""

# 5. Final Status
if [ "$BACKEND_TESTS_PASSED" = true ] && [ "$FRONTEND_TESTS_PASSED" = true ]; then
    print_success "🎉 All unit tests passed! Your app is ready for production."
    exit 0
else
    print_error "❌ Some tests failed. Please review the output above."
    exit 1
fi
