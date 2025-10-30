class MockAiService {
  constructor() {
    this.responses = {
      logout: {
        patterns: ['logout', 'log out', 'sign out', 'signout', 'exit'],
        message: "I found the logout button for you! It's in the top-right corner of the navigation bar. I've highlighted it for you.",
        highlight: '#logout-btn',
        confidence: 0.95
      },
      download: {
        patterns: ['download', 'get report', 'save report', 'export'],
        message: "The download button is located in the main content area. Click the 'Download Report' button to get your file.",
        highlight: '#download-btn',
        confidence: 0.92
      },
      settings: {
        patterns: ['settings', 'preferences', 'configuration', 'options'],
        message: "You can access settings by clicking the 'Open Settings' button in the settings section below.",
        highlight: '#settings-btn',
        confidence: 0.90
      },
      dashboard: {
        patterns: ['dashboard', 'home', 'main page'],
        message: "The dashboard link is in the navigation menu at the top. I've highlighted it for you!",
        highlight: 'a[href="#dashboard"]',
        confidence: 0.88
      },
      help: {
        patterns: ['help', 'support', 'assistance', 'how to'],
        message: "I'm here to help! You can ask me questions like 'Where is the logout button?' or 'How do I download files?' I'll guide you to the right place.",
        highlight: null,
        confidence: 0.85
      }
    };

    this.defaultResponse = {
      message: "I'm a demo AI assistant. Try asking me: 'Where is the logout button?' or 'How do I download the report?' or 'Where are settings?'",
      highlight: null,
      confidence: 0.50
    };
  }

  findBestMatch(query) {
    const lowerQuery = query.toLowerCase();

    for (const [key, response] of Object.entries(this.responses)) {
      for (const pattern of response.patterns) {
        if (lowerQuery.includes(pattern)) {
          return {
            message: response.message,
            highlight: response.highlight,
            confidence: response.confidence,
            source: 'mock',
            processingTime: Math.random() * 200 + 100
          };
        }
      }
    }

    return {
      ...this.defaultResponse,
      source: 'mock',
      processingTime: 50
    };
  }

  async processQuery(query, url, dom) {
    await new Promise(resolve => setTimeout(resolve, 100));

    const result = this.findBestMatch(query);

    return {
      success: true,
      message: result.message,
      highlight: result.highlight,
      confidence: result.confidence,
      source: result.source,
      processingTime: result.processingTime,
      timestamp: new Date().toISOString()
    };
  }

  async healthCheck() {
    return {
      status: 'operational',
      mode: 'mock',
      message: 'Mock AI service is always available'
    };
  }
}

module.exports = MockAiService;
