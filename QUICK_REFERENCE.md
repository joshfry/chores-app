# 🔥 QUICK REFERENCE - Keep This Open!

**For when you forget things fast (we all do!)**

## 🚨 **MOST IMPORTANT COMMANDS**

### **Start Everything**

```bash
pnpm dev:backend    # This is the ONE command you need most!
```

### **Get Auth Token (4 steps)**

```bash
# 1. Create user
bash backend/dev-scripts/test-auth-manual.sh

# 2. Check backend terminal for magic token (looks like: magic_1234567890_abc)

# 3. Use magic token
bash backend/dev-scripts/test-verify.sh magic_1234567890_abc

# 4. Copy session token from response (looks like: session_xyz789)
```

### **Test API**

```bash
# Replace SESSION_TOKEN with actual token from step 3 above
curl -H "Authorization: Bearer SESSION_TOKEN" \
     -H "Accept: application/json" \
     http://localhost:3001/api/children
```

## 🎯 **URLs to Remember**

- **API Health:** http://localhost:3001/health
- **API Docs:** http://localhost:3001/
- **Backend Port:** 3001
- **Frontend Port:** 3000 (when built)

## 🔧 **Common Problems & Solutions**

### **Port Already in Use**

```bash
lsof -ti:3001 | xargs kill -9     # Backend port
lsof -ti:3000 | xargs kill -9     # Frontend port
```

### **Can't Find Magic Token**

- Look at **backend terminal** (where you ran `pnpm dev:backend`)
- Search for lines with `📧` and `🔗` emojis
- Magic token is after `token=`

### **Session Expired**

- Run the 4-step auth process again
- You can't reuse old tokens

### **API Not Working**

```bash
# Check if backend is running
curl http://localhost:3001/health

# Check if you have correct headers
curl -H "Accept: application/json" http://localhost:3001/api/children
```

## 📋 **Copy-Paste Commands**

### **Complete Auth Flow**

```bash
# Terminal 1: Start backend
pnpm dev:backend

# Terminal 2: Test auth
bash backend/dev-scripts/test-auth-manual.sh
# → Check terminal 1 for magic token
bash backend/dev-scripts/test-verify.sh PASTE_MAGIC_TOKEN_HERE
# → Copy session token from response

# Test API with session token
curl -H "Authorization: Bearer PASTE_SESSION_TOKEN_HERE" \
     -H "Accept: application/json" \
     http://localhost:3001/api/children
```

### **Run Tests**

```bash
pnpm test:backend           # All tests
pnpm test:coverage         # With coverage
```

### **See All Scripts**

```bash
bash backend/dev-scripts/list-scripts.sh
```

## 🔑 **Magic Words to Remember**

- **Magic tokens** → In backend terminal logs (not API response)
- **Session tokens** → In API response after verifying magic token
- **Authorization header** → `Bearer session_token` format
- **Accept header** → Always use `application/json`

## ⚡ **Emergency Reset**

```bash
# Kill everything and restart
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
pnpm dev:backend
```

---

**💡 Pro Tip:** Keep this file open in a tab when developing!
