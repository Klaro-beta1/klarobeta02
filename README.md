# Nail - AI Assistant SaaS Platform

Nail is a SaaS platform that enables businesses to create custom AI assistant chatbots for their websites. The platform crawls customer websites, trains Claude AI on the content, and provides embeddable chat widgets.

## 🚀 Features

- **AI-Powered Chat Bots**: Create intelligent chatbots using Claude AI
- **Website Crawling**: Automatic website content extraction using Firecrawl
- **Easy Integration**: Simple embed code for any website
- **Credit System**: Flexible credit-based pricing with rollover
- **Multiple Plans**: Free, Basic, Pro, and Enterprise tiers
- **Responsive Design**: Works on desktop and mobile
- **Real-time Chat**: Instant responses from AI assistants
- **Conversation Memory**: Persistent chat history for users

## 🏗️ Tech Stack

### Backend
- **Framework**: Python FastAPI
- **Database**: PostgreSQL (structured data) + MongoDB (conversations)
- **AI**: Claude by Anthropic
- **Web Scraping**: Firecrawl API
- **Authentication**: JWT + Google OAuth
- **Payments**: Stripe (not functional in MVP) + Manual UPI

### Frontend
- **Framework**: Next.js 14 with React
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **TypeScript**: Full type safety

## 📁 Project Structure

```
nail_1beta/
├── backend/                  # Python FastAPI backend
├── frontend/                # Next.js frontend
├── uploads/                 # Uploaded files
├── widget/                  # Chat widget JavaScript
└── README.md
```

## 🔧 Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Backend runs at http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3000

## 📝 Environment Variables

Create `backend/.env`:
```env
DATABASE_URL=postgresql://localhost:5432/nail_db
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET_KEY=your_secret_key_min_32_chars
FIRECRAWL_API_KEY=fc-41eadac06fda46b49462525b2b26f7e6
CLAUDE_API_KEY=hrp-fPoa-HPMIUpQyfS0xhE3oEKn1a2BrNELjvhH4BkeD1iVYu0J9bVqLmnhGDTh
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=mihirbhut07@gmail.com
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 💳 Pricing Plans

| Plan | Price | Page Limit | Credits |
|------|-------|------------|---------|
| Free | $0 | 2 pages | 2 |
| Basic | $9 | 20 pages | 10 |
| Pro | $19 | 50 pages | 40 |
| Enterprise | $59 | 150 pages | 100 |

## 🔐 Admin Access

- Email: mihirbhut07@gmail.com
- Password: mihirthegre@t1
- Auto-assigned Enterprise plan (100 credits)
- Access to Admin Panel for credit management

## 💎 Managing Credits

### Admin Panel (Easiest Way)
1. Login as admin
2. Navigate to "Admin Panel" in sidebar
3. View all users and their credits
4. Use quick buttons (+10, +50, +100) to add credits
5. Or use the form for custom amounts

### Python Script
```bash
python add_credits.py mihirbhut07@gmail.com 100
```

### API Endpoint
```bash
curl -X POST http://localhost:8000/api/admin/credits/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_email": "user@example.com", "credits": 100}'
```

## 🎯 Usage

1. Register/Login at http://localhost:3000
2. Create new bot with website URL
3. Wait for AI training (few minutes)
4. Copy embed code
5. Add to your website before `</body>` tag

## 📊 API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google
- POST /api/auth/logout

### Bots
- GET /api/bots
- POST /api/bots/create
- GET /api/bots/:id
- PUT /api/bots/:id
- DELETE /api/bots/:id
- POST /api/bots/:id/test
- POST /api/bots/:id/chat (public)

## 🚧 MVP Limitations

- No password reset
- No email verification
- Manual payment processing
- Local file storage
- Polling (no real-time updates)
- English only

## 📄 License

MIT License

## 🤝 Support

Contact: mihirbhut07@gmail.com