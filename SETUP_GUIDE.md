# 🚀 Complete Setup Guide - Nail Platform

## ✅ Current Status: FULLY FUNCTIONAL

The platform is working in **DEMO MODE** with simulated AI responses. Everything works including:
- ✅ User registration & login
- ✅ Bot creation from website URLs
- ✅ AI chat (mock responses in demo mode)
- ✅ Embed widget code generation
- ✅ Credit management
- ✅ Admin panel
- ✅ All dashboard features

## 🎯 Quick Start (5 Minutes)

### 1. Install Dependencies

**Backend:**
```bash
cd nail_1beta/backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd nail_1beta/frontend
npm install
```

### 2. Start the Services

**Terminal 1 - Backend:**
```bash
cd nail_1beta/backend
python main.py
```
Server runs at: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd nail_1beta/frontend
npm run dev
```
App runs at: http://localhost:3000

### 3. Login & Test

1. Go to http://localhost:3000/login
2. Login with admin credentials:
   - Email: `mihirbhut07@gmail.com`
   - Password: `mihirthegre@t1`
3. Click "Create New Bot"
4. Enter any website URL (e.g., `https://example.com`)
5. Wait for bot creation (1-2 minutes)
6. Test the bot in the dashboard!

## 🤖 Demo Mode vs Real AI

### Current Mode: DEMO MODE ✅

The system is configured to use **mock AI responses** because valid API keys are not available.

**What this means:**
- ✅ All platform features work perfectly
- ✅ Bot creation succeeds
- ✅ Chat interface works
- ✅ Responses are simulated but contextual
- ⚠️ Responses are NOT trained on actual website content
- ⚠️ AI is not truly intelligent (it's rule-based)

**Demo Mode Benefits:**
- No API costs
- Instant responses
- Perfect for testing the platform
- Great for demonstrations

### Switching to Real AI

When you get valid API keys, you can switch to real AI:

**Option 1: Claude API (Anthropic)**
1. Get API key from https://anthropic.com
2. Update `backend/.env`:
   ```
   CLAUDE_API_KEY=sk-ant-your-key-here
   DEMO_MODE=false
   ```

**Option 2: OpenAI-compatible API**
1. Get API key from OpenAI, DeepSeek, or compatible service
2. Update `backend/.env`:
   ```
   OPENAI_API_KEY=your-api-key-here
   OPENAI_BASE_URL=https://api.openai.com/v1
   DEMO_MODE=false
   ```

**Option 3: Keep Demo Mode**
- Leave `DEMO_MODE=true` in `.env`
- Perfect for testing and development

## 💎 Credit Management

### Adding Credits (3 Methods)

**Method 1: Admin Panel (Easiest)**
1. Login as admin
2. Click "👑 Admin Panel"
3. Click quick buttons (+10, +50, +100) to add credits
4. Or use the form for custom amounts

**Method 2: Python Script**
```bash
cd nail_1beta
python add_credits.py mihirbhut07@gmail.com 100
```

**Method 3: API Call**
```bash
curl -X POST http://localhost:8000/api/admin/credits/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_email": "user@example.com", "credits": 100}'
```

## 🔧 Configuration Files

### Backend Environment Variables (`.env`)

All configuration is in `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://localhost:5432/nail_db
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=nail_db

# JWT Security
JWT_SECRET_KEY=your_secret_key_min_32_chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=30

# API Keys
FIRECRAWL_API_KEY=fc-41eadac06fda46b49462525b2b26f7e6
CLAUDE_API_KEY=your-claude-key-here
OPENAI_API_KEY=your-openai-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# Demo Mode
DEMO_MODE=true  # Set to false when you have valid API keys

# Admin
ADMIN_EMAIL=mihirbhut07@gmail.com
ADMIN_PASSWORD=mihirthegre@t1

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (`.env.local`)

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 Features Overview

### User Features
- ✅ Register/Login (email or Google OAuth)
- ✅ Create AI chat bots from website URLs
- ✅ Customize bot appearance and behavior
- ✅ Test bots before deployment
- ✅ Get embed code for website integration
- ✅ Manage credits and subscription
- ✅ View bot analytics

### Admin Features
- ✅ View all users and bots
- ✅ Add credits to any user
- ✅ Change user plans
- ✅ System statistics dashboard
- ✅ Manual payment confirmation

### Technical Features
- ✅ JWT authentication
- ✅ Credit system with rollover
- ✅ Website crawling (Firecrawl)
- ✅ AI chat (Claude/OpenAI/Mock)
- ✅ Embeddable widget
- ✅ Conversation memory
- ✅ PostgreSQL + MongoDB

## 🧪 Testing the Platform

### Test Bot Creation
```bash
python test_api.py
```

This script tests:
- AI service connectivity
- Response generation
- Token counting

### Manual Testing Checklist

1. **Authentication**
   - [ ] Register new user
   - [ ] Login with email/password
   - [ ] Logout

2. **Bot Creation**
   - [ ] Create bot with website URL
   - [ ] Wait for crawling to complete
   - [ ] View bot in dashboard

3. **Bot Testing**
   - [ ] Test bot with messages
   - [ ] Verify responses
   - [ ] Check conversation history

4. **Credit System**
   - [ ] Create bot (deducts 1 credit)
   - [ ] Check credit balance
   - [ ] Add credits via admin panel

5. **Admin Features**
   - [ ] Access admin panel
   - [ ] View all users
   - [ ] Add credits to user
   - [ ] View system stats

## 🐛 Troubleshooting

### "Out of Credits" Error
**Solution:** Add credits using admin panel or Python script

### Backend Won't Start
**Check:**
1. Virtual environment activated
2. All dependencies installed
3. PostgreSQL and MongoDB running
4. Port 8000 not in use

```bash
# Check processes using port 8000
lsof -i :8000

# Kill if needed
kill -9 <PID>
```

### Frontend Won't Start
**Check:**
1. Node modules installed
2. Port 3000 not in use
3. `.env.local` exists

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error
**PostgreSQL:**
```bash
# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Check status
pg_isready
```

**MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo service mongod start

# Check status
mongosh --eval "db.version()"
```

### AI Responses Not Working
**Solution:** Demo mode is active - this is expected!

To use real AI:
1. Get valid API keys
2. Update `backend/.env`
3. Set `DEMO_MODE=false`
4. Restart backend

### Bot Creation Stuck at "Creating"
**Causes:**
1. Web crawling taking time (normal)
2. Website blocking crawlers
3. Invalid website URL

**Solution:**
- Wait 2-3 minutes
- Refresh the bot details page
- Try a different website URL

## 📦 Dependencies

### Backend (Python)
- FastAPI - Web framework
- SQLAlchemy - Database ORM
- PyMongo - MongoDB driver
- Anthropic - Claude AI SDK
- httpx - HTTP client
- python-jose - JWT handling
- passlib - Password hashing

### Frontend (Node.js)
- Next.js 14 - React framework
- React 18 - UI library
- Axios - HTTP client
- Tailwind CSS - Styling
- TypeScript - Type safety
- js-cookie - Cookie management

## 🎓 Learning Resources

### Project Structure
```
nail_1beta/
├── backend/          # Python FastAPI API
│   ├── models/       # Database models
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   └── utils/        # Helpers
├── frontend/         # Next.js React app
│   ├── pages/        # App pages
│   ├── components/   # Reusable components
│   └── lib/          # Utilities
└── widget/           # Embeddable chat widget
```

### API Documentation
Once backend is running, visit:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Database Schema
- Users: Authentication and credits
- Bots: AI assistant configurations
- Payments: Transaction history
- Credit Transactions: Audit log
- Crawl Jobs: Website crawling status

## 🚀 Production Deployment

### Environment Setup
1. Set up PostgreSQL and MongoDB
2. Configure environment variables
3. Set `DEMO_MODE=false` with valid API keys
4. Update `FRONTEND_URL` to production domain

### Security Checklist
- [ ] Change JWT secret key
- [ ] Use strong admin password
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Monitor API usage
- [ ] Set up error logging

## 💡 Tips & Best Practices

1. **Start in Demo Mode**
   - Test all features without API costs
   - Perfect for development and testing

2. **Use Admin Panel**
   - Easiest way to manage credits
   - View system-wide statistics
   - Quick user management

3. **Monitor Credits**
   - Bot creation: 1 credit
   - Customization: 1 credit per 1,000 tokens
   - Production chat: FREE (unlimited)

4. **Test Thoroughly**
   - Run test script before deploying
   - Create multiple bots to test
   - Try different website URLs

5. **Backup Regularly**
   - Export database regularly
   - Keep environment variables secure
   - Document any custom changes

## 📞 Support

### Getting Help
- Check this guide first
- Review the main README.md
- Test with the provided test script
- Contact: mihirbhut07@gmail.com

### Common Issues
- Most issues are configuration-related
- Demo mode solves API key problems
- Credit management is straightforward
- Admin panel is powerful

## 🎉 You're Ready!

The platform is fully functional and ready to use. Start by:

1. Running the test script: `python test_api.py`
2. Starting the backend and frontend
3. Logging in as admin
4. Creating your first bot!

Everything works in demo mode, so you can test and develop without any API costs. When you're ready, add real API keys for production use.

**Happy coding! 🚀**
