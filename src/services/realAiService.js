const axios = require('axios');
const OpenAI = require('openai');

class RealAiService {
  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // FireCrawl API configuration
    this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    this.firecrawlBaseUrl = 'https://api.firecrawl.dev/v1';

    // GLM API configuration
    this.glmApiKey = process.env.GLM_API_KEY;
    this.glmBaseUrl = 'https://open.bigmodel.cn/api/paas/v4';
  }

  /**
   * Scrape website content using FireCrawl API
   */
  async scrapeWithFireCrawl(url) {
    try {
      console.log(`🔥 Scraping with FireCrawl: ${url}`);
      
      const response = await axios.post(`${this.firecrawlBaseUrl}/scrape`, {
        url: url,
        formats: ['markdown', 'html'],
        includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'a', 'button', 'input', 'form', 'nav'],
        onlyMainContent: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.firecrawlApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
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
      console.error('FireCrawl error:', error.message);
      return {
        success: false,
        error: error.message,
        title: 'Error',
        content: '',
        html: ''
      };
    }
  }

  /**
   * Generate AI response using GLM API
   */
  async generateWithGLM(messages) {
    try {
      console.log('🤖 Generating response with GLM...');
      
      const response = await axios.post(`${this.glmBaseUrl}/chat/completions`, {
        model: 'glm-4',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.glmApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.choices && response.data.choices.length > 0) {
        return {
          success: true,
          content: response.data.choices[0].message.content,
          usage: response.data.usage
        };
      } else {
        throw new Error('No response from GLM');
      }
    } catch (error) {
      console.error('GLM API error:', error.message);
      return {
        success: false,
        error: error.message,
        content: 'I apologize, but I encountered an error processing your request.'
      };
    }
  }

  /**
   * Generate AI response using OpenAI API (fallback)
   */
  async generateWithOpenAI(messages) {
    try {
      console.log('🧠 Generating response with OpenAI...');
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      if (response.choices && response.choices.length > 0) {
        return {
          success: true,
          content: response.choices[0].message.content,
          usage: response.usage
        };
      } else {
        throw new Error('No response from OpenAI');
      }
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      return {
        success: false,
        error: error.message,
        content: 'I apologize, but I encountered an error processing your request.'
      };
    }
  }

  /**
   * Extract relevant elements from HTML content
   */
  extractRelevantElements(html, query) {
    const elements = [];
    
    // Common UI elements to look for based on query
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('logout') || queryLower.includes('sign out')) {
      elements.push('a:contains("Logout")', 'a:contains("Sign Out")', 'button:contains("Logout")', '[href*="logout"]', '[onclick*="logout"]');
    }
    
    if (queryLower.includes('download')) {
      elements.push('a:contains("Download")', 'button:contains("Download")', '[href*="download"]', '[download]');
    }
    
    if (queryLower.includes('dashboard') || queryLower.includes('home')) {
      elements.push('a:contains("Dashboard")', 'a:contains("Home")', '[href*="dashboard"]', '[href*="home"]');
    }
    
    if (queryLower.includes('profile') || queryLower.includes('account')) {
      elements.push('a:contains("Profile")', 'a:contains("Account")', '[href*="profile"]', '[href*="account"]');
    }
    
    if (queryLower.includes('settings')) {
      elements.push('a:contains("Settings")', '[href*="settings"]', '[href*="config"]');
    }
    
    if (queryLower.includes('help') || queryLower.includes('support')) {
      elements.push('a:contains("Help")', 'a:contains("Support")', '[href*="help"]', '[href*="support"]');
    }

    if (queryLower.includes('contact')) {
      elements.push('a:contains("Contact")', '[href*="contact"]', '[href*="mailto"]');
    }

    // Generic fallback selectors
    if (elements.length === 0) {
      elements.push('button', 'a[href]', 'input[type="submit"]', 'nav a');
    }
    
    return elements.join(', ');
  }

  /**
   * Generate step-by-step instructions
   */
  generateSteps(query, pageContent) {
    const queryLower = query.toLowerCase();
    const steps = [];
    
    if (queryLower.includes('logout')) {
      steps.push('Look for the logout button or link, usually in the top-right corner');
      steps.push('Click on the highlighted logout element');
    } else if (queryLower.includes('download')) {
      steps.push('Look for the download button or link');
      steps.push('Click on the highlighted download element');
    } else if (queryLower.includes('dashboard')) {
      steps.push('Look for the dashboard or home link in the navigation');
      steps.push('Click on the highlighted dashboard link');
    } else if (queryLower.includes('profile')) {
      steps.push('Look for your profile or account link');
      steps.push('Click on the highlighted profile element');
    } else {
      steps.push('Look for the highlighted element on the page');
      steps.push('Click on the highlighted element to proceed');
    }
    
    return steps;
  }

  /**
   * Main query processing method
   */
  async processQuery(query, url, domContent = null) {
    const startTime = Date.now();
    
    try {
      // Step 1: Get page content
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

      if (!pageData.success) {
        return {
          message: "I couldn't access the page content. Please make sure the URL is correct and accessible.",
          highlight: '',
          steps: ['Please check the URL and try again'],
          confidence: 0.1,
          processingTime: Date.now() - startTime
        };
      }

      // Step 2: Prepare context for AI
      const systemPrompt = `You are Klaro, an intelligent website assistant. Your job is to help users navigate websites by providing clear, helpful responses and identifying specific UI elements.

Page Information:
- URL: ${url}
- Title: ${pageData.title}
- Content: ${pageData.content.substring(0, 2000)}...

User Query: ${query}

Instructions:
1. Provide a helpful, conversational response to the user's question
2. Be specific about where to find elements on the page
3. Keep responses concise but informative
4. If you can't find what they're looking for, suggest alternatives
5. Always be encouraging and helpful

Respond in a natural, friendly tone as if you're personally helping the user navigate the website.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ];

      // Step 3: Generate AI response (try GLM first, fallback to OpenAI)
      let aiResponse = await this.generateWithGLM(messages);
      
      if (!aiResponse.success) {
        console.log('GLM failed, trying OpenAI...');
        aiResponse = await this.generateWithOpenAI(messages);
      }

      if (!aiResponse.success) {
        return {
          message: "I'm having trouble processing your request right now. Please try again in a moment.",
          highlight: '',
          steps: ['Please try your question again'],
          confidence: 0.1,
          processingTime: Date.now() - startTime
        };
      }

      // Step 4: Generate highlighting selectors and steps
      const highlight = this.extractRelevantElements(pageData.html, query);
      const steps = this.generateSteps(query, pageData.content);

      // Step 5: Calculate confidence based on content relevance
      const confidence = this.calculateConfidence(query, pageData.content, aiResponse.content);

      return {
        message: aiResponse.content,
        highlight: highlight,
        steps: steps,
        confidence: confidence,
        processingTime: Date.now() - startTime,
        metadata: {
          pageTitle: pageData.title,
          aiModel: aiResponse.success ? 'GLM-4' : 'GPT-3.5-Turbo',
          scrapingMethod: 'FireCrawl'
        }
      };

    } catch (error) {
      console.error('Query processing error:', error);
      return {
        message: "I encountered an error while processing your request. Please try again.",
        highlight: '',
        steps: ['Please try your question again'],
        confidence: 0.1,
        processingTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Calculate confidence score based on query and response relevance
   */
  calculateConfidence(query, pageContent, aiResponse) {
    let confidence = 0.5; // Base confidence
    
    const queryWords = query.toLowerCase().split(' ');
    const pageWords = pageContent.toLowerCase();
    const responseWords = aiResponse.toLowerCase();
    
    // Increase confidence if query terms appear in page content
    queryWords.forEach(word => {
      if (word.length > 3 && pageWords.includes(word)) {
        confidence += 0.1;
      }
    });
    
    // Increase confidence if response seems relevant
    queryWords.forEach(word => {
      if (word.length > 3 && responseWords.includes(word)) {
        confidence += 0.05;
      }
    });
    
    // Cap confidence at 0.95
    return Math.min(confidence, 0.95);
  }

  /**
   * Health check for all APIs
   */
  async healthCheck() {
    const results = {
      firecrawl: false,
      glm: false,
      openai: false,
      timestamp: new Date().toISOString()
    };

    // Test FireCrawl
    try {
      const testResponse = await axios.post(`${this.firecrawlBaseUrl}/scrape`, {
        url: 'https://example.com',
        formats: ['markdown']
      }, {
        headers: { 'Authorization': `Bearer ${this.firecrawlApiKey}` },
        timeout: 10000
      });
      results.firecrawl = testResponse.status === 200;
    } catch (error) {
      console.log('FireCrawl health check failed:', error.message);
      results.firecrawl = false;
    }

    // Test GLM
    try {
      const testResponse = await axios.post(`${this.glmBaseUrl}/chat/completions`, {
        model: 'glm-4',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      }, {
        headers: { 'Authorization': `Bearer ${this.glmApiKey}` },
        timeout: 5000
      });
      results.glm = testResponse.status === 200;
    } catch (error) {
      console.log('GLM health check failed:', error.message);
    }

    // Test OpenAI
    try {
      const testResponse = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });
      results.openai = testResponse.choices && testResponse.choices.length > 0;
    } catch (error) {
      console.log('OpenAI health check failed:', error.message);
    }

    return results;
  }
}

module.exports = RealAiService;