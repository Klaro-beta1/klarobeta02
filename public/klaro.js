/**
 * KLARO AI ASSISTANT - CLIENT EMBED SCRIPT
 * Version: 2.0.0
 * 
 * Installation: Add this to your website's <head> or before </body>:
 * <script src="https://cdn.klaro.ai/klaro.js?key=YOUR_API_KEY"></script>
 * 
 * Optional parameters:
 * - theme: 'light' | 'dark' | 'auto' (default: 'auto')
 * - position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' (default: 'bottom-right')
 * - primaryColor: hex color (default: '#667eea')
 * - greeting: custom greeting message
 */

(function() {
  'use strict';

  // Configuration
  const scriptTag = document.currentScript;
  const urlParams = new URLSearchParams(scriptTag.src.split('?')[1] || '');
  
  const config = {
    apiKey: urlParams.get('key'),
    theme: urlParams.get('theme') || 'auto',
    position: urlParams.get('position') || 'bottom-right',
    primaryColor: urlParams.get('primaryColor') || '#667eea',
    greeting: urlParams.get('greeting') || 'Hi! I can help you navigate this website. Just ask me anything! 👋',
    apiUrl: urlParams.get('apiUrl') || 'https://api.klaro.ai',
    debug: urlParams.get('debug') === 'true'
  };

  // Validation
  if (!config.apiKey) {
    console.error('Klaro: No API key provided. Please add ?key=YOUR_API_KEY to the script URL.');
    return;
  }

  // State management
  let isOpen = false;
  let isLoading = false;
  let messages = [{ type: 'bot', text: config.greeting }];
  let currentHighlight = null;
  let retryCount = 0;
  const maxRetries = 3;

  // Utility functions
  const log = (...args) => config.debug && console.log('[Klaro]', ...args);
  const error = (...args) => console.error('[Klaro]', ...args);

  // Theme detection
  const getTheme = () => {
    if (config.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return config.theme;
  };

  const theme = getTheme();
  const isDark = theme === 'dark';

  // Enhanced styles with theme support and better positioning
  const styles = `
    :root {
      --klaro-primary: ${config.primaryColor};
      --klaro-primary-rgb: ${hexToRgb(config.primaryColor)};
      --klaro-bg: ${isDark ? '#1f2937' : '#ffffff'};
      --klaro-text: ${isDark ? '#f9fafb' : '#1f2937'};
      --klaro-text-secondary: ${isDark ? '#d1d5db' : '#6b7280'};
      --klaro-border: ${isDark ? '#374151' : '#e5e7eb'};
      --klaro-input-bg: ${isDark ? '#374151' : '#ffffff'};
      --klaro-message-bg: ${isDark ? '#374151' : '#f7f8fa'};
    }

    #klaro-widget {
      position: fixed;
      ${getPositionStyles(config.position)}
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }

    #klaro-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--klaro-primary) 0%, color-mix(in srgb, var(--klaro-primary) 80%, #000) 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(var(--klaro-primary-rgb), 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    #klaro-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 30px rgba(var(--klaro-primary-rgb), 0.6);
    }

    #klaro-button:active {
      transform: scale(1.05);
    }

    #klaro-button svg {
      width: 28px;
      height: 28px;
      color: white;
      transition: transform 0.3s ease;
    }

    #klaro-button:hover svg {
      transform: scale(1.1);
    }

    #klaro-chat {
      position: fixed;
      ${getPositionStyles(config.position)}
      width: min(400px, calc(100vw - 32px));
      height: min(600px, calc(100vh - 32px));
      background: var(--klaro-bg);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid var(--klaro-border);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    #klaro-header {
      background: linear-gradient(135deg, var(--klaro-primary) 0%, color-mix(in srgb, var(--klaro-primary) 80%, #000) 100%);
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 16px 16px 0 0;
    }

    #klaro-header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 16px;
    }

    #klaro-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    #klaro-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    #klaro-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: var(--klaro-message-bg);
      scrollbar-width: thin;
      scrollbar-color: var(--klaro-border) transparent;
    }

    #klaro-messages::-webkit-scrollbar {
      width: 6px;
    }

    #klaro-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    #klaro-messages::-webkit-scrollbar-thumb {
      background: var(--klaro-border);
      border-radius: 3px;
    }

    .klaro-message {
      margin-bottom: 16px;
      display: flex;
      animation: messageSlide 0.3s ease;
    }

    @keyframes messageSlide {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .klaro-message-user {
      justify-content: flex-end;
    }

    .klaro-message-content {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
      position: relative;
    }

    .klaro-message-bot .klaro-message-content {
      background: var(--klaro-bg);
      color: var(--klaro-text);
      border: 1px solid var(--klaro-border);
      border-radius: 18px 18px 18px 4px;
    }

    .klaro-message-user .klaro-message-content {
      background: linear-gradient(135deg, var(--klaro-primary) 0%, color-mix(in srgb, var(--klaro-primary) 80%, #000) 100%);
      color: white;
      border-radius: 18px 18px 4px 18px;
    }

    #klaro-input-container {
      padding: 20px;
      background: var(--klaro-bg);
      border-top: 1px solid var(--klaro-border);
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    #klaro-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid var(--klaro-border);
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
      background: var(--klaro-input-bg);
      color: var(--klaro-text);
      resize: none;
      min-height: 20px;
      max-height: 100px;
      font-family: inherit;
    }

    #klaro-input:focus {
      border-color: var(--klaro-primary);
      box-shadow: 0 0 0 3px rgba(var(--klaro-primary-rgb), 0.1);
    }

    #klaro-send {
      padding: 12px 16px;
      background: linear-gradient(135deg, var(--klaro-primary) 0%, color-mix(in srgb, var(--klaro-primary) 80%, #000) 100%);
      color: white;
      border: none;
      border-radius: 24px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      height: 44px;
    }

    #klaro-send:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(var(--klaro-primary-rgb), 0.3);
    }

    #klaro-send:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .klaro-loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Enhanced highlight styles */
    .klaro-highlight {
      position: relative !important;
      outline: 3px solid var(--klaro-primary) !important;
      outline-offset: 4px !important;
      border-radius: 8px !important;
      animation: klaro-pulse 2s infinite;
      z-index: 999998 !important;
    }

    @keyframes klaro-pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(var(--klaro-primary-rgb), 0.7);
      }
      50% {
        box-shadow: 0 0 0 20px rgba(var(--klaro-primary-rgb), 0);
      }
    }

    .klaro-pointer-bubble {
      position: fixed;
      background: var(--klaro-primary);
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 999999;
      animation: bounce 1s infinite;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(var(--klaro-primary-rgb), 0.3);
    }

    .klaro-pointer-bubble::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid var(--klaro-primary);
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    /* Error state */
    .klaro-error {
      color: #ef4444;
      background: #fef2f2;
      border-color: #fecaca;
    }

    /* Mobile responsiveness */
    @media (max-width: 480px) {
      #klaro-chat {
        width: calc(100vw - 16px);
        height: calc(100vh - 16px);
        bottom: 8px;
        right: 8px;
        left: 8px;
        border-radius: 12px;
      }
      
      #klaro-widget {
        bottom: 16px;
        right: 16px;
      }
    }

    /* Accessibility */
    @media (prefers-reduced-motion: reduce) {
      #klaro-chat,
      .klaro-message,
      #klaro-button,
      .klaro-highlight {
        animation: none;
      }
    }
  `;

  // Helper functions
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '102, 126, 234';
  }

  function getPositionStyles(position) {
    const positions = {
      'bottom-right': 'bottom: 24px; right: 24px;',
      'bottom-left': 'bottom: 24px; left: 24px;',
      'top-right': 'top: 24px; right: 24px;',
      'top-left': 'top: 24px; left: 24px;'
    };
    return positions[position] || positions['bottom-right'];
  }

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create widget HTML
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'klaro-widget';
    widget.innerHTML = `
      <button id="klaro-button" aria-label="Open Klaro AI Assistant" title="Need help? Ask me anything!">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      </button>
    `;
    document.body.appendChild(widget);

    document.getElementById('klaro-button').addEventListener('click', openChat);
    log('Widget created successfully');
  }

  function openChat() {
    if (isOpen) return;
    isOpen = true;
    log('Opening chat');

    const chat = document.createElement('div');
    chat.id = 'klaro-chat';
    chat.innerHTML = `
      <div id="klaro-header">
        <div id="klaro-header-title">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <span>AI Assistant</span>
        </div>
        <button id="klaro-close" aria-label="Close chat" title="Close">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div id="klaro-messages"></div>
      <div id="klaro-input-container">
        <textarea id="klaro-input" placeholder="Ask me anything about this website..." rows="1"></textarea>
        <button id="klaro-send" aria-label="Send message" title="Send">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
    `;

    const widget = document.getElementById('klaro-widget');
    widget.innerHTML = '';
    widget.appendChild(chat);

    renderMessages();
    setupEventListeners();
    
    // Focus input
    setTimeout(() => {
      document.getElementById('klaro-input').focus();
    }, 100);
  }

  function closeChat() {
    if (!isOpen) return;
    isOpen = false;
    log('Closing chat');

    const widget = document.getElementById('klaro-widget');
    widget.innerHTML = `
      <button id="klaro-button" aria-label="Open Klaro AI Assistant" title="Need help? Ask me anything!">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      </button>
    `;
    document.getElementById('klaro-button').addEventListener('click', openChat);
  }

  function setupEventListeners() {
    const closeBtn = document.getElementById('klaro-close');
    const sendBtn = document.getElementById('klaro-send');
    const input = document.getElementById('klaro-input');

    closeBtn.addEventListener('click', closeChat);
    sendBtn.addEventListener('click', sendMessage);
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
  }

  function renderMessages() {
    const container = document.getElementById('klaro-messages');
    if (!container) return;

    container.innerHTML = messages.map(msg => `
      <div class="klaro-message klaro-message-${msg.type}">
        <div class="klaro-message-content">${escapeHtml(msg.text)}</div>
      </div>
    `).join('');
    
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  async function sendMessage() {
    const input = document.getElementById('klaro-input');
    const sendBtn = document.getElementById('klaro-send');
    const query = input.value.trim();

    if (!query || isLoading) return;

    log('Sending message:', query);

    // Add user message
    messages.push({ type: 'user', text: query });
    input.value = '';
    input.style.height = 'auto';
    renderMessages();

    // Show loading
    isLoading = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<div class="klaro-loading"></div>';

    try {
      const response = await fetchWithRetry(`${config.apiUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey
        },
        body: JSON.stringify({
          query: query,
          url: window.location.href,
          dom: captureDOM(),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      log('Received response:', data);

      // Add bot response
      messages.push({ type: 'bot', text: data.message || 'I received your message but couldn\'t generate a response.' });
      renderMessages();

      // Highlight element if provided
      if (data.highlight) {
        setTimeout(() => highlightElement(data.highlight), 500);
      }

      retryCount = 0; // Reset retry count on success

    } catch (error) {
      error('API Error:', error);
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please check your API key.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      messages.push({ type: 'bot', text: errorMessage });
      renderMessages();
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      sendBtn.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
        </svg>
      `;
    }
  }

  async function fetchWithRetry(url, options, retries = maxRetries) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (retries > 0) {
        log(`Request failed, retrying... (${maxRetries - retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (maxRetries - retries + 1)));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  function captureDOM() {
    try {
      // Capture simplified DOM structure with better error handling
      const buttons = Array.from(document.querySelectorAll('button, a[role="button"], input[type="submit"], input[type="button"]'))
        .slice(0, 50) // Limit to prevent payload bloat
        .map((el, i) => ({
          index: i,
          text: el.innerText?.trim() || el.textContent?.trim() || el.value || '',
          href: el.href || null,
          id: el.id || null,
          className: el.className || null,
          type: el.type || null,
          role: el.role || null
        }))
        .filter(btn => btn.text.length > 0);

      const links = Array.from(document.querySelectorAll('a[href]'))
        .slice(0, 30)
        .map(el => ({
          text: el.innerText?.trim() || el.textContent?.trim() || '',
          href: el.href,
          title: el.title || null
        }))
        .filter(link => link.text.length > 0);

      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .slice(0, 20)
        .map(el => ({
          level: el.tagName.toLowerCase(),
          text: el.innerText?.trim() || el.textContent?.trim() || ''
        }))
        .filter(h => h.text.length > 0);

      return {
        title: document.title || '',
        url: window.location.href,
        pathname: window.location.pathname,
        buttons,
        links,
        headings,
        forms: document.querySelectorAll('form').length,
        inputs: Array.from(document.querySelectorAll('input, textarea, select'))
          .slice(0, 20)
          .map(el => ({
            type: el.type || el.tagName.toLowerCase(),
            name: el.name || null,
            placeholder: el.placeholder || null,
            id: el.id || null
          }))
      };
    } catch (error) {
      error('Error capturing DOM:', error);
      return {
        title: document.title || '',
        url: window.location.href,
        error: 'Failed to capture page structure'
      };
    }
  }

  function highlightElement(selector) {
    try {
      // Remove previous highlight
      if (currentHighlight) {
        currentHighlight.element.classList.remove('klaro-highlight');
        if (currentHighlight.bubble) currentHighlight.bubble.remove();
      }

      // Find and highlight element
      const element = document.querySelector(selector);
      if (!element) {
        log('Element not found for selector:', selector);
        return;
      }

      log('Highlighting element:', selector);
      element.classList.add('klaro-highlight');
      
      // Smooth scroll to element
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });

      // Create pointer bubble
      const rect = element.getBoundingClientRect();
      const bubble = document.createElement('div');
      bubble.className = 'klaro-pointer-bubble';
      bubble.textContent = 'Here it is!';
      bubble.style.left = `${rect.left + rect.width / 2}px`;
      bubble.style.top = `${rect.top - 50}px`;
      bubble.style.transform = 'translateX(-50%)';
      document.body.appendChild(bubble);

      currentHighlight = { element, bubble };

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (currentHighlight && currentHighlight.element === element) {
          element.classList.remove('klaro-highlight');
          bubble.remove();
          currentHighlight = null;
        }
      }, 5000);

    } catch (error) {
      error('Error highlighting element:', error);
    }
  }

  // Initialize when DOM is ready
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createWidget);
    } else {
      createWidget();
    }

    // Listen for theme changes
    if (config.theme === 'auto') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        // Reload styles with new theme
        document.head.removeChild(styleSheet);
        const newStyleSheet = document.createElement('style');
        newStyleSheet.textContent = styles;
        document.head.appendChild(newStyleSheet);
      });
    }

    log('Klaro AI Assistant initialized', { config, theme });
  }

  // Start initialization
  init();

})();