# 🐛 **Cypress Server Troubleshooting Guide**

## ❌ **"Cypress could not verify that this server is running"**

This error occurs when Cypress can't connect to the expected frontend server.

---

## 🔍 **Quick Diagnosis**

### **Check Server Status**

```bash
# Check if servers are running on expected ports
lsof -ti:3000 -ti:3001

# Expected output:
# [process_id]  # Frontend on 3000
# [process_id]  # Backend on 3001
```

### **Expected Configuration**

- **Frontend**: `http://localhost:3000` (React dev server)
- **Backend**: `http://localhost:3001` (Express API server)
- **Cypress baseUrl**: `http://localhost:3000` (configured in `cypress.config.ts`)

---

## ✅ **Solution 1: Use Built-in Server Starter (RECOMMENDED)**

The project has `start-server-and-test` configured to automatically handle this:

```bash
# Interactive Cypress (starts server automatically)
pnpm --filter frontend run test:e2e:open

# Headless Cypress (starts server automatically)
pnpm --filter frontend run test:e2e

# OR use root workspace commands
pnpm run test:e2e:open    # Interactive
pnpm run test:e2e         # Headless
```

**How it works:**

1. `start-server-and-test` starts the frontend server on port 3000
2. Waits for `http://localhost:3000` to be available
3. Runs Cypress tests
4. Automatically shuts down server when done

---

## ✅ **Solution 2: Manual Server Setup**

If you prefer manual control:

### **Terminal 1: Start Backend**

```bash
cd /Users/jofry/Desktop/chores
pnpm run dev:backend
# Should show: Server running on port 3001
```

### **Terminal 2: Start Frontend**

```bash
cd /Users/jofry/Desktop/chores
pnpm run dev:frontend
# Should show: Local: http://localhost:3000
```

### **Terminal 3: Run Cypress**

```bash
cd /Users/jofry/Desktop/chores
pnpm --filter frontend run cypress:open
```

---

## ✅ **Solution 3: Port Conflict Resolution**

If ports are already in use:

### **Kill Existing Processes**

```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

### **Verify Ports Are Free**

```bash
lsof -ti:3000 -ti:3001
# Should return nothing if ports are free
```

### **Restart Servers**

```bash
# Method 1: Use automatic server starter
pnpm run test:e2e:open

# Method 2: Manual restart
pnpm run dev:backend &    # Start backend
pnpm run dev:frontend &   # Start frontend
pnpm --filter frontend run cypress:open
```

---

## ⚠️ **Common Issues & Solutions**

### **Issue: Port 3000 Already in Use**

```bash
# Error: Something is already running on port 3000
# Solution: Kill the process or use different port
lsof -ti:3000 | xargs kill -9
```

### **Issue: Backend Not Running**

```bash
# Error: Cypress tests fail when calling API
# Solution: Ensure backend is running on 3001
curl http://localhost:3001/health
# Should return: {"success": true, "message": "Server is healthy"}
```

### **Issue: Environment Variables**

```bash
# Error: Configuration mismatch
# Solution: Check Cypress config matches server ports
```

**Verify Cypress Config:**

```typescript
// cypress.config.ts should have:
baseUrl: 'http://localhost:3000',
env: {
  BACKEND_URL: 'http://localhost:3001',
}
```

### **Issue: Network/Firewall**

```bash
# Test network connectivity
curl http://localhost:3000
curl http://localhost:3001/health

# Should not be blocked by firewall/antivirus
```

---

## 🧪 **Test Server Connectivity**

### **Frontend Health Check**

```bash
curl http://localhost:3000
# Should return: HTML content (React app)
```

### **Backend Health Check**

```bash
curl http://localhost:3001/health
# Should return: {"success": true, "message": "Server is healthy"}
```

### **Full API Test**

```bash
curl -H "Accept: application/json" http://localhost:3001/api/children
# Should return: {"success": false, "error": "Authentication required"}
```

---

## 🎯 **Recommended Workflow**

### **For Development**

```bash
# Terminal 1: Keep backend running
pnpm run dev:backend

# Terminal 2: Run E2E tests as needed
pnpm run test:e2e:open    # Interactive mode
```

### **For CI/CD**

```bash
# Automated testing (servers start/stop automatically)
pnpm run test:e2e
```

### **For Debugging**

```bash
# 1. Ensure clean state
lsof -ti:3000 -ti:3001 | xargs kill -9

# 2. Start with automatic server management
pnpm run test:e2e:open

# 3. If issues persist, start manually
pnpm run dev:backend &
pnpm run dev:frontend &
sleep 5  # Wait for servers to start
pnpm --filter frontend run cypress:open
```

---

## 📊 **Server Status Dashboard**

Create this script for quick status checks:

```bash
#!/bin/bash
# save as: server-status.sh

echo "🔍 Server Status Check"
echo "===================="

# Check backend
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend: Running (http://localhost:3001)"
else
    echo "❌ Backend: Not running"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: Running (http://localhost:3000)"
else
    echo "❌ Frontend: Not running"
fi

# Check processes
echo ""
echo "📊 Port Usage:"
lsof -ti:3000 -ti:3001 | while read pid; do
    echo "  Process $pid on port $(lsof -p $pid | grep LISTEN | awk '{print $9}' | cut -d: -f2)"
done
```

---

**🚀 Quick Fix: Use `pnpm run test:e2e:open` - it handles everything automatically!**
