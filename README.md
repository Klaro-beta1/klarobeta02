# 🤖 Klaro AI - Intelligent Website Assistant

**A powerful AI-powered assistant that can be embedded on any website to help users navigate and find what they need instantly.**

Klaro is a complete B2B SaaS solution that allows website owners to add an intelligent AI assistant to their site with just one line of code. Users can ask questions like "Where is the logout button?" or "How do I download my results?" and get intelligent, contextual responses with visual highlighting.

## 🎉 **SYSTEM STATUS: FULLY OPERATIONAL** 

✅ **Backend Server**: Running on port 12000  
✅ **Database**: SQLite with client management  
✅ **API Authentication**: Working with API keys  
✅ **AI Responses**: Mock service with intelligent responses  
✅ **Landing Page**: Professional marketing site  
✅ **Demo Page**: Interactive showcase  
✅ **Registration**: Working client signup  
✅ **Embed Script**: Ready for any website  

**🚀 Ready for production deployment!**

## ✨ Features

- **🧠 AI-Powered**: Uses Claude AI for intelligent, contextual responses
- **🎯 Visual Highlighting**: Automatically highlights relevant page elements
- **📱 Responsive Design**: Works perfectly on desktop and mobile
- **🚀 Easy Integration**: One-line embed script
- **📊 Analytics Dashboard**: Track usage and user interactions
- **🎨 Customizable**: Theme, colors, and positioning options
- **⚡ Fast & Lightweight**: Minimal impact on page load times
- **🔒 Secure**: API key authentication and rate limiting

## 🚀 Quick Start

### 1. Installation

```bash
git clone <your-repo-url>
cd nail_1beta
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
CLAUDE_API_KEY=sk-ant-api03-your-key-here
PORT=3000
NODE_ENV=development
```

### 3. Start the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

### 4. Create a Test Client

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"domain": "https://example.com", "plan": "tier1"}'
```

### 5. Add to Your Website

Add the embed script to your website:

```html
<script src="http://localhost:3000/klaro.js?key=YOUR_API_KEY"></script>
```

## 📖 Usage

### Basic Integration

The simplest way to add Klaro to your website:

```html
<script src="https://cdn.klaro.ai/klaro.js?key=klaro_abc123xyz"></script>
```

### Advanced Configuration

Customize the appearance and behavior:

```html
<script src="https://cdn.klaro.ai/klaro.js?key=klaro_abc123xyz&theme=dark&position=bottom-left&primaryColor=%23ff6b6b"></script>
```

Available parameters:
- `key` (required): Your API key
- `theme`: `light`, `dark`, or `auto` (default: `auto`)
- `position`: `bottom-right`, `bottom-left`, `top-right`, `top-left` (default: `bottom-right`)
- `primaryColor`: Hex color code (default: `#667eea`)
- `greeting`: Custom greeting message

### API Endpoints

#### Query Endpoint
```bash
POST /api/query
Headers: X-API-Key: your-api-key
Body: {
  "query": "Where is the logout button?",
  "url": "https://example.com/dashboard",
  "dom": { /* page structure */ }
}
```

#### Analytics Endpoint
```bash
GET /api/analytics
Headers: X-API-Key: your-api-key
```

#### Registration Endpoint
```bash
POST /api/register
Body: {
  "domain": "https://example.com",
  "plan": "tier1",
  "email": "user@example.com"
}
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Site   │    │  Klaro Server   │    │   Claude AI     │
│                 │    │                 │    │                 │
│  [Embed Script] │───▶│  [API Routes]   │───▶│   [AI Model]    │
│  [Chat Widget]  │    │  [Database]     │    │                 │
│                 │    │  [Scraping]     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Components

- **Embed Script** (`public/klaro.js`): Client-side widget
- **API Server** (`server.js`): Main application server
- **Database** (`src/utils/database.js`): SQLite database for clients and analytics
- **AI Service** (`src/utils/aiService.js`): Claude AI integration
- **Scraping Service** (`src/utils/scrapingService.js`): Website content extraction
- **Admin Dashboard**: React-based management interface

## 📊 Pricing Tiers

| Tier | Price | Queries/Month | Features |
|------|-------|---------------|----------|
| Tier 1 | $1/mo | 1,000 | Basic AI assistance |
| Tier 2 | $19/mo | 10,000 | Advanced features + Analytics |
| Tier 3 | $99/mo | 50,000 | Priority support + Custom branding |

## 🛠️ Development

### Project Structure

```
nail_1beta/
├── public/                 # Static files
│   └── klaro.js           # Embed script
├── src/
│   ├── routes/            # API routes
│   │   ├── api.js         # Main API endpoints
│   │   ├── auth.js        # Authentication
│   │   └── admin.js       # Admin endpoints
│   ├── middleware/        # Express middleware
│   │   ├── auth.js        # Auth middleware
│   │   ├── errorHandler.js # Error handling
│   │   └── logger.js      # Request logging
│   └── utils/             # Utility services
│       ├── database.js    # Database operations
│       ├── aiService.js   # AI integration
│       └── scrapingService.js # Web scraping
├── dashboard/             # Admin dashboard (React)
├── docs/                  # Documentation
├── server.js              # Main server file
├── package.json
└── README.md
```

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (when implemented)
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDE_API_KEY` | Claude AI API key | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | Database path | ./database.sqlite |
| `JWT_SECRET` | JWT signing secret | your-secret-key |
| `ALLOWED_ORIGINS` | CORS origins | localhost:3000 |
| `ADMIN_EMAIL` | Admin login email | admin@klaro.ai |
| `ADMIN_PASSWORD` | Admin login password | admin123 |

## 🚀 Deployment

### Railway (Recommended)

1. Push your code to GitHub
2. Connect Railway to your repository
3. Set environment variables in Railway dashboard
4. Deploy automatically

### Docker

```bash
# Build image
docker build -t klaro-ai .

# Run container
docker run -p 3000:3000 --env-file .env klaro-ai
```

### Manual Deployment

1. Set up a VPS (Ubuntu/CentOS)
2. Install Node.js and PM2
3. Clone repository and install dependencies
4. Configure environment variables
5. Start with PM2: `pm2 start server.js --name klaro-ai`

## 📈 Monitoring

### Health Checks

- Server: `GET /health`
- AI Service: Check Claude API connectivity
- Database: SQLite connection status

### Analytics

Track key metrics:
- Total queries per client
- Response times
- Error rates
- User engagement

### Logs

- Request/response logging
- Error tracking
- Performance monitoring

## 🔒 Security

- API key authentication
- Rate limiting (100 requests/15 minutes)
- CORS protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@klaro.ai
- 📖 Documentation: [docs.klaro.ai](https://docs.klaro.ai)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Voice interaction
- [ ] Advanced analytics dashboard
- [ ] Webhook integrations
- [ ] Custom AI model training
- [ ] White-label solutions

---

**Made with ❤️ by the Klaro team**