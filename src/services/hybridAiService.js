const axios = require('axios');
const OpenAI = require('openai');

class HybridAiService {
  constructor() {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-key-here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    this.firecrawlBaseUrl = 'https://api.firecrawl.dev/v1';

    this.glmApiKey = process.env.GLM_API_KEY;
    this.glmBaseUrl = 'https://open.bigmodel.cn/api/paas/v4';

    this.fallbackResponses = {
      logout: [
        "I can help you find the logout button! It's typically located in the top-right corner of the page, often in a user menu or navigation bar.",
        "Look for a 'Logout', 'Sign Out', or 'Exit' button, usually near your profile name or avatar.",
        "The logout option is commonly found in the main navigation menu or in a dropdown under your username."
      ],
      download: [
        "I'll help you locate the download option! Look for a 'Download' button or link, often represented by a down arrow icon.",
        "Download buttons are typically found near the content you want to download, or in a toolbar/menu area.",
        "Check for download links that might be labeled as 'Export', 'Save', or have a download icon (↓)."
      ],
      dashboard: [
        "The dashboard is usually accessible from the main navigation menu. Look for 'Dashboard', 'Home', or 'Overview' links.",
        "You can typically find the dashboard link in the top navigation bar or sidebar menu.",
        "Dashboard access is often the first item in the main menu or available via a 'Home' button."
      ],
      profile: [
        "Your profile can usually be accessed by clicking on your name or avatar, typically in the top-right corner.",
        "Look for 'Profile', 'Account', or 'My Account' links in the navigation menu or user dropdown.",
        "Profile settings are often found under a user menu that appears when you click your username or profile picture."
      ],
      settings: [
        "Settings are typically found in a user menu (click your profile/avatar) or in the main navigation.",
        "Look for 'Settings', 'Preferences', or a gear icon (⚙️) in the interface.",
        "Settings can often be accessed through your profile menu or in a dedicated 'Settings' section."
      ],
      help: [
        "Help resources are usually found in the main menu or footer. Look for 'Help', 'Support', or 'FAQ' links.",
        "Many sites have a help icon (?) or 'Contact Support' option in the header or footer area.",
        "Help documentation is often accessible through a 'Help Center' or 'Documentation' link."
      ],
      contact: [
        "Contact information is typically found in the footer of the page or in a dedicated 'Contact' section.",
        "Look for 'Contact Us', 'Get in Touch', or 'Support' links in the main navigation or footer.",
        "Contact options are often available through a 'Contact' page or support section of the website."
      ]
    };
  }

  async scrapeWithFireCrawl(url) {
    try {
      console.log(`🔥 Attempting to scrape with FireCrawl: ${url}`);
      
      const response = await axios.post(`${this.firecrawlBaseUrl}/scrape`, {
        url: url,
        formats: ['markdown', 'html']
      }, {
        headers: {
          'Authorization': `Bearer ${this.firecrawlApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.success) {
        console.log('✅ FireCrawl scraping successful');
        return {
          success: true,
          title: response.data.data.metadata?.title || 'Unknown Page',
          content: response.data.data.markdown || response.data.data.html || '',
          html: response.data.data.html || '',
          metadata: response.data.data.metadata || {}
        };
      } else {
        throw new Error('FireCrawl scraping failed');
      }
    } catch (error) {
      console.log('⚠️ FireCrawl failed, using fallback scraping:', error.message);
      return await this.fallbackScrape(url);
    }
  }

  async fallbackScrape(url) {
    try {
      console.log(`🌐 Using fallback scraping for: ${url}`);
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Klaro AI Assistant)'
        }
      });

      return {
        success: true,
        title: this.extractTitle(response.data) || 'Web Page',
        content: this.extractTextContent(response.data),
        html: response.data,
        metadata: { source: 'fallback' }
      };
    } catch (error) {
      console.log('❌ Fallback scraping also failed:', error.message);
      return {
        success: false,
        error: error.message,
        title: 'Error',
        content: '',
        html: ''
      };
    }
  }

  extractTitle(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  extractTextContent(html) {
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    const elements = text.match(/<(h[1-6]|p|a|button|nav|div)[^>]*>([^<]+)<\/\1>/gi);
    if (elements) {
      return elements.map(el => el.replace(/<[^>]*>/g, '')).join(' ').substring(0, 1000);
    }
    
    return text.replace(/<[^>]*>/g, '').substring(0, 1000);
  }

  async generateWithGLM(messages) {
    try {
      console.log('🤖 Attempting GLM API...');
      
      const response = await axios.post(`${this.glmBaseUrl}/chat/completions`, {
        model: 'glm-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${this.glmApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.data.choices && response.data.choices.length > 0) {
        console.log('✅ GLM API successful');
        return {
          success: true,
          content: response.data.choices[0].message.content,
          usage: response.data.usage
        };
      } else {
        throw new Error('No response from GLM');
      }
    } catch (error) {
      console.log('⚠️ GLM API failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async generateWithOpenAI(messages) {
    if (!this.openai) {
      return { success: false, error: 'OpenAI not configured' };
    }

    try {
      console.log('🧠 Attempting OpenAI API...');
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      });

      if (response.choices && response.choices.length > 0) {
        console.log('✅ OpenAI API successful');
        return {
          success: true,
          content: response.choices[0].message.content,
          usage: response.usage
        };
      } else {
        throw new Error('No response from OpenAI');
      }
    } catch (error) {
      console.log('⚠️ OpenAI API failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  generateIntelligentFallback(query, pageData) {
    console.log('🧠 Generating intelligent fallback response...');
    
    const queryLower = query.toLowerCase();
    let response = "I'm here to help you navigate this website! ";
    let category = 'general';

    if (queryLower.includes('logout') || queryLower.includes('sign out')) {
      category = 'logout';
      response += this.getRandomResponse('logout');
    } else if (queryLower.includes('download')) {
      category = 'download';
      response += this.getRandomResponse('download');
    } else if (queryLower.includes('dashboard') || queryLower.includes('home')) {
      category = 'dashboard';
      response += this.getRandomResponse('dashboard');
    } else if (queryLower.includes('profile') || queryLower.includes('account')) {
      category = 'profile';
      response += this.getRandomResponse('profile');
    } else if (queryLower.includes('settings') || queryLower.includes('preferences')) {
      category = 'settings';
      response += this.getRandomResponse('settings');
    } else if (queryLower.includes('help') || queryLower.includes('support')) {
      category = 'help';
      response += this.getRandomResponse('help');
    } else if (queryLower.includes('contact')) {
      category = 'contact';
      response += this.getRandomResponse('contact');
    } else {
      response += "I'll help you find what you're looking for on this page. Look for the highlighted elements that match your request.";
    }

    if (pageData && pageData.title && pageData.title !== 'Error') {
      response += ` I can see you're on "${pageData.title}" - let me highlight the relevant elements for you.`;
    }

    return {
      success: true,
      content: response,
      category: category,
      source: 'intelligent_fallback'
    };
  }

  getRandomResponse(category) {
    const responses = this.fallbackResponses[category] || ['I can help you find what you need on this page.'];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  extractRelevantElements(html, query) {
    const elements = [];
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('logout') || queryLower.includes('sign out')) {
      elements.push('a:contains("Logout")', 'a:contains("Sign Out")', 'button:contains("Logout")', '[href*="logout"]', '[onclick*="logout"]');
    }
    
    if (queryLower.includes('download')) {
      elements.push('a:contains("Download")', 'button:contains("Download")', '[href*="download"]', '[download]', 'a[href$=".pdf"]', 'a[href$=".zip"]');
    }
    
    if (queryLower.includes('dashboard') || queryLower.includes('home')) {
      elements.push('a:contains("Dashboard")', 'a:contains("Home")', '[href*="dashboard"]', '[href*="home"]', 'nav a:first-child');
    }
    
    if (queryLower.includes('profile') || queryLower.includes('account')) {
      elements.push('a:contains("Profile")', 'a:contains("Account")', '[href*="profile"]', '[href*="account"]', '.user-menu a');
    }
    
    if (queryLower.includes('settings')) {
      elements.push('a:contains("Settings")', '[href*="settings"]', '[href*="config"]', '.settings-icon');
    }
    
    if (queryLower.includes('help') || queryLower.includes('support')) {
      elements.push('a:contains("Help")', 'a:contains("Support")', '[href*="help"]', '[href*="support"]', '.help-icon');
    }

    if (queryLower.includes('contact')) {
      elements.push('a:contains("Contact")', '[href*="contact"]', '[href*="mailto"]', '.contact-info');
    }

    if (elements.length === 0) {
      elements.push('button', 'a[href]', 'input[type="submit"]', 'nav a', '.btn');
    }
    
    return elements.join(', ');
  }

  generateSteps(query, category) {
    const steps = [];
    
    switch (category) {
      case 'logout':
        steps.push('Look for the logout button or link, usually in the top-right corner');
        steps.push('Click on the highlighted logout element');
        break;
      case 'download':
        steps.push('Look for the download button or link');
        steps.push('Click on the highlighted download element');
        break;
      case 'dashboard':
        steps.push('Look for the dashboard or home link in the navigation');
        steps.push('Click on the highlighted dashboard link');
        break;
      case 'profile':
        steps.push('Look for your profile or account link');
        steps.push('Click on the highlighted profile element');
        break;
      default:
        steps.push('Look for the highlighted element on the page');
        steps.push('Click on the highlighted element to proceed');
    }
    
    return steps;
  }

  async processQuery(query, url, domContent = null) {
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Processing query: "${query}" for ${url}`);

      let pageData;
      if (domContent) {
        pageData = {
          success: true,
          title: 'Provided Content',
          content: domContent,
          html: domContent
        };
      } else {
        pageData = await this.scrapeWithFireCrawl(url);
      }

      let aiResponse = null;
      
      if (pageData.success) {
        const systemPrompt = `You are Klaro, a helpful website assistant. Help users navigate websites by providing clear, friendly guidance.

Page: ${pageData.title}
URL: ${url}
Content: ${pageData.content.substring(0, 1500)}...

User Question: ${query}

Provide a helpful, conversational response that guides the user to find what they need. Be specific about where to look and keep it friendly and concise.`;

        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ];

        aiResponse = await this.generateWithGLM(messages);
        if (!aiResponse.success) {
          aiResponse = await this.generateWithOpenAI(messages);
        }
      }

      if (!aiResponse || !aiResponse.success) {
        aiResponse = this.generateIntelligentFallback(query, pageData);
      }

      const highlight = this.extractRelevantElements(pageData.html || '', query);
      const steps = this.generateSteps(query, aiResponse.category || 'general');

      const confidence = this.calculateConfidence(query, pageData, aiResponse);

      const result = {
        message: aiResponse.content,
        highlight: highlight,
        steps: steps,
        confidence: confidence,
        processingTime: Date.now() - startTime,
        metadata: {
          pageTitle: pageData.title || 'Unknown',
          aiSource: aiResponse.source || 'api',
          scrapingMethod: pageData.metadata?.source || 'firecrawl'
        }
      };

      console.log(`✅ Query processed successfully in ${result.processingTime}ms`);
      return result;

    } catch (error) {
      console.error('❌ Query processing error:', error);
      return {
        message: "I encountered an error while processing your request. Please try again.",
        highlight: 'button, a[href], input[type="submit"]',
        steps: ['Please try your question again'],
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  calculateConfidence(query, pageData, aiResponse) {
    let confidence = 0.6;
    
    if (aiResponse.source === 'api') {
      confidence = 0.85;
    }
    
    if (pageData && pageData.success) {
      confidence += 0.1;
    }
    
    if (pageData && pageData.content) {
      const queryWords = query.toLowerCase().split(' ');
      const pageWords = pageData.content.toLowerCase();
      
      queryWords.forEach(word => {
        if (word.length > 3 && pageWords.includes(word)) {
          confidence += 0.05;
        }
      });
    }
    
    return Math.min(confidence, 0.95);
  }

  async healthCheck() {
    const results = {
      firecrawl: false,
      glm: false,
      openai: false,
      fallback: true,
      timestamp: new Date().toISOString()
    };

    try {
      const testResponse = await axios.post(`${this.firecrawlBaseUrl}/scrape`, {
        url: 'https://example.com',
        formats: ['markdown']
      }, {
        headers: { 'Authorization': `Bearer ${this.firecrawlApiKey}` },
        timeout: 5000
      });
      results.firecrawl = testResponse.status === 200;
    } catch (error) {
      results.firecrawl = false;
    }

    try {
      const testResponse = await axios.post(`${this.glmBaseUrl}/chat/completions`, {
        model: 'glm-4',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      }, {
        headers: { 'Authorization': `Bearer ${this.glmApiKey}` },
        timeout: 5000
      });
      results.glm = testResponse.status === 200;
    } catch (error) {
      results.glm = false;
    }

    if (this.openai) {
      try {
        const testResponse = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        });
        results.openai = testResponse.choices && testResponse.choices.length > 0;
      } catch (error) {
        results.openai = false;
      }
    }

    return results;
  }
}

module.exports = HybridAiService;
