# Quick Start Guide - Nail Platform

## 🚀 Getting Started in 5 Minutes

### 1. Start the Backend

```bash
cd nail_1beta/backend
pip install -r requirements.txt
python main.py
```

Backend runs at: http://localhost:8000

### 2. Start the Frontend

```bash
cd nail_1beta/frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:3000

### 3. Login as Admin

Go to http://localhost:3000/login

**Admin Credentials:**
- Email: `mihirbhut07@gmail.com`
- Password: `mihirthegre@t1`

The admin account automatically gets:
- Enterprise plan
- 100 credits
- Access to Admin Panel

## 💎 Managing Credits

### Option 1: Admin Panel (Easiest)

1. Login as admin
2. Click "👑 Admin Panel" in sidebar
3. Use quick buttons to add credits:
   - **+10** - Add 10 credits
   - **+50** - Add 50 credits
   - **+100** - Add 100 credits

Or use the form to add custom amount to any user.

### Option 2: Python Script

```bash
cd nail_1beta
python add_credits.py mihirbhut07@gmail.com 100
```

This adds 100 credits to the admin account.

### Option 3: API Endpoint

```bash
# Get your JWT token first by logging in
TOKEN="your_jwt_token"

curl -X POST http://localhost:8000/api/admin/credits/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "mihirbhut07@gmail.com",
    "credits": 100,
    "description": "Testing credits"
  }'
```

## 🤖 Creating Your First Bot

1. **Login** at http://localhost:3000
2. Click **"Create New Bot"**
3. Enter:
   - Website URL: `https://example.com`
   - Bot Name: `My Test Bot`
4. Click **"Create Bot"** (costs 1 credit)
5. Wait 1-2 minutes for crawling and AI training
6. Get your embed code and test the bot!

## 📝 Testing the Bot

After bot creation:
1. Go to **"My Bots"**
2. Click on your bot
3. Use the **"Test Your Bot"** section
4. Type a test message
5. See the AI response!

## 🔧 Troubleshooting

### "Out of Credits" Error

**Solution:** Add more credits using one of the three methods above.

### Database Connection Error

Make sure PostgreSQL is running:
```bash
# Check if PostgreSQL is running
pg_isready

# If not, start it (macOS)
brew services start postgresql

# Or (Linux)
sudo service postgresql start
```

### MongoDB Connection Error

Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# If not, start it (macOS)
brew services start mongodb-community

# Or (Linux)
sudo service mongod start
```

### Backend Won't Start

1. Activate virtual environment:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Check environment variables in `.env`

### Frontend Won't Start

1. Delete node_modules and reinstall:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

2. Check `.env.local` has correct API URL

## 🎯 Next Steps

- Create multiple bots
- Test different website URLs
- Customize bot settings (colors, position, etc.)
- Explore the Admin Panel features
- Try the embed code on a test HTML page

## 💡 Tips

- **Credits rollover**: Unused credits accumulate month-to-month
- **Free tier**: 2 pages, 2 credits per month
- **Live chat is FREE**: Production bot conversations don't consume credits
- **Admin gets unlimited**: Enterprise plan with 100 initial credits

## 📞 Need Help?

Check the main README.md for detailed documentation or contact: mihirbhut07@gmail.com
