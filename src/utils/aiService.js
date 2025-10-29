// const Anthropic = require('@anthropic-ai/sdk');

class AIService {
  constructor() {
    // this.anthropic = new Anthropic({
    //   apiKey: process.env.CLAUDE_API_KEY,
    // });
    
    if (!process.env.CLAUDE_API_KEY) {
      console.warn('Warning: CLAUDE_API_KEY not set. Using mock AI responses for testing.');
    }
  }

  async processQuery({ query, url, dom, pageData, clientDomain }) {
    const startTime = Date.now();
    
    try {
      if (!process.env.CLAUDE_API_KEY) {
        return {
          message: "AI service is not configured. Please contact support.",
          highlight: null,
          steps: [],
          confidence: 0,
          processingTime: Date.now() - startTime
        };
      }

      // Build comprehensive context for Claude
      const context = this.buildContext({ query, url, dom, pageData, clientDomain });
      
      // Generate AI response (mock for testing)
      const response = await this.queryClaudeAI(context);
      
      return {
        ...response,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      
      return {
        message: this.getErrorMessage(error),
        highlight: null,
        steps: [],
        confidence: 0,
        processingTime: Date.now() - startTime
      };
    }
  }

  buildContext({ query, url, dom, pageData, clientDomain }) {
    // Extract relevant information from DOM and page data
    const buttons = dom?.buttons?.slice(0, 20) || [];
    const links = dom?.links?.slice(0, 15) || pageData?.links?.slice(0, 15) || [];
    const headings = dom?.headings?.slice(0, 10) || pageData?.headings?.slice(0, 10) || [];
    
    return `You are Klaro, an intelligent AI assistant that helps users navigate websites. You have access to the current page structure and can guide users to find what they're looking for.

CURRENT PAGE INFORMATION:
- URL: ${url}
- Title: ${dom?.title || pageData?.title || 'Unknown'}
- Domain: ${clientDomain}

AVAILABLE INTERACTIVE ELEMENTS:
Buttons and clickable elements:
${buttons.map((btn, i) => `${i + 1}. "${btn.text}" ${btn.id ? `(ID: ${btn.id})` : ''} ${btn.className ? `(Class: ${btn.className})` : ''}`).join('\n')}

Navigation links:
${links.map((link, i) => `${i + 1}. "${link.text}" -> ${link.href}`).join('\n')}

Page headings:
${headings.map((h, i) => `${i + 1}. ${h.level?.toUpperCase()}: "${h.text}"`).join('\n')}

USER QUESTION: "${query}"

INSTRUCTIONS:
1. Analyze the user's question and understand their intent
2. Look through the available page elements to find what they need
3. Provide a helpful, conversational response
4. If you can identify a specific element they should interact with, provide a CSS selector for highlighting
5. Break down complex tasks into simple steps

RESPONSE FORMAT (JSON):
{
  "message": "Your helpful response explaining what to do",
  "highlight": "CSS selector for the element to highlight (or null)",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "confidence": 0.95
}

GUIDELINES:
- Be conversational and friendly
- Use the user's language level
- If you can't find what they're looking for, suggest alternatives
- For highlighting, use specific selectors like: "button#logout", ".btn-primary", "a[href='/dashboard']"
- Only highlight if you're confident about the element
- If multiple elements match, choose the most relevant one
- Confidence should be 0.0-1.0 based on how certain you are about your answer

Examples of good responses:
- "I found the logout button for you! It's in the top-right corner."
- "To download your results, you'll need to click on 'Student Portal' first, then look for the download option."
- "I can see several navigation options. The 'Dashboard' link will take you to your main account area."`;
  }

  async queryClaudeAI(context) {
    try {
      // Mock AI response for testing (replace with real Claude API when ready)
      if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'sk-ant-api03-your-key-here') {
        return this.getMockResponse(context);
      }

      // Real Claude API implementation would go here
      // const message = await this.anthropic.messages.create({...});
      
      return this.getMockResponse(context);

    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error(`Claude API: ${error.message}`);
    }
  }

  getMockResponse(context) {
    // Extract query from context for better mock responses
    const queryMatch = context.match(/USER QUESTION: "([^"]+)"/);
    const query = queryMatch ? queryMatch[1].toLowerCase() : '';

    // Mock responses based on common queries
    if (query.includes('logout') || query.includes('sign out')) {
      return {
        message: "I found the logout button for you! It's typically located in the top-right corner of the page. I've highlighted it for you.",
        highlight: "button:contains('Logout'), a:contains('Logout'), [href*='logout'], .logout",
        steps: ["Look for the highlighted logout button", "Click on it to sign out"],
        confidence: 0.9
      };
    } else if (query.includes('download') || query.includes('save')) {
      return {
        message: "To download your content, look for download buttons or links. I've highlighted the most likely download option for you.",
        highlight: "button:contains('Download'), a:contains('Download'), [href*='download'], .download",
        steps: ["Click the highlighted download button", "Choose your preferred format if prompted", "Save the file to your device"],
        confidence: 0.8
      };
    } else if (query.includes('dashboard') || query.includes('home')) {
      return {
        message: "I can help you navigate to the dashboard! Look for the highlighted navigation link.",
        highlight: "a:contains('Dashboard'), a:contains('Home'), [href*='dashboard'], [href*='home']",
        steps: ["Click on the highlighted dashboard link"],
        confidence: 0.85
      };
    } else if (query.includes('profile') || query.includes('account')) {
      return {
        message: "Your profile or account settings are usually accessible through a profile menu or account link. I've highlighted the most likely option.",
        highlight: "a:contains('Profile'), a:contains('Account'), .profile, .account",
        steps: ["Click on the highlighted profile/account link", "You'll find your settings and personal information there"],
        confidence: 0.8
      };
    } else {
      return {
        message: `I understand you're looking for something on this page. While I can see the page structure, I'd be happy to help you find what you need. Could you be more specific about what you're looking for?`,
        highlight: null,
        steps: ["Try asking more specifically, like 'Where is the logout button?' or 'How do I download my files?'"],
        confidence: 0.6
      };
    }
  }

  validateSelector(selector) {
    if (!selector || typeof selector !== 'string') {
      return null;
    }

    // Basic CSS selector validation
    try {
      // Test if it's a valid selector by trying to use it
      document.querySelector && document.querySelector(selector);
      return selector;
    } catch (e) {
      // If selector is invalid, return null
      console.warn('Invalid CSS selector:', selector);
      return null;
    }
  }

  getErrorMessage(error) {
    if (error.message.includes('API key')) {
      return "I'm having trouble connecting to my AI service. Please contact support.";
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      return "I'm receiving too many requests right now. Please wait a moment and try again.";
    } else if (error.message.includes('timeout')) {
      return "I'm taking longer than usual to respond. Please try asking your question again.";
    } else {
      return "I encountered an error while processing your question. Please try rephrasing it or contact support if the problem persists.";
    }
  }

  // Health check for AI service
  async healthCheck() {
    try {
      if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'sk-ant-api03-your-key-here') {
        return { 
          status: 'warning', 
          message: 'Using mock AI responses (Claude API key not configured)',
          mode: 'mock'
        };
      }

      // Real Claude API health check would go here
      return { 
        status: 'ok', 
        message: 'AI service is operational',
        model: 'claude-3-sonnet-20240229'
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: error.message 
      };
    }
  }
}

module.exports = { AIService };