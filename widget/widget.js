/**
 * Nail AI Assistant Chat Widget
 * Embeddable chat widget for websites
 */

(function() {
  'use strict';

  // Get bot ID from script tag
  const scriptTag = document.currentScript;
  const botId = scriptTag.getAttribute('data-bot-id');
  const apiUrl = scriptTag.getAttribute('data-api-url') || 'http://localhost:8000';

  if (!botId) {
    console.error('Nail Widget: Missing data-bot-id attribute');
    return;
  }

  // Generate session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem(`nail_session_${botId}`);
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem(`nail_session_${botId}`, sessionId);
    }
    return sessionId;
  };

  const sessionId = getSessionId();

  // Create widget HTML
  const createWidget = () => {
    // Create container
    const container = document.createElement('div');
    container.id = 'nail-widget-container';
    container.innerHTML = `
      <style>
        #nail-widget-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        #nail-chat-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #1976d2;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        #nail-chat-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        #nail-chat-window {
          display: none;
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
          flex-direction: column;
          overflow: hidden;
        }

        #nail-chat-window.open {
          display: flex;
        }

        .nail-chat-header {
          background: #1976d2;
          color: white;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nail-chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .nail-close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nail-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f9f9f9;
        }

        .nail-message {
          margin-bottom: 12px;
          display: flex;
          flex-direction: column;
        }

        .nail-message.user {
          align-items: flex-end;
        }

        .nail-message-bubble {
          padding: 10px 14px;
          border-radius: 12px;
          max-width: 80%;
          word-wrap: break-word;
        }

        .nail-message.bot .nail-message-bubble {
          background: #e3f2fd;
          color: #1565c0;
        }

        .nail-message.user .nail-message-bubble {
          background: #1976d2;
          color: white;
        }

        .nail-input-area {
          padding: 16px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 8px;
        }

        .nail-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
        }

        .nail-input:focus {
          border-color: #1976d2;
        }

        .nail-send-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #1976d2;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .nail-send-btn:hover {
          background: #1565c0;
        }

        .nail-send-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .nail-typing {
          display: none;
          padding: 10px 14px;
          background: #e3f2fd;
          border-radius: 12px;
          width: fit-content;
          color: #1565c0;
          font-size: 14px;
        }

        .nail-typing.show {
          display: block;
        }

        .nail-branding {
          text-align: center;
          padding: 8px;
          border-top: 1px solid #e0e0e0;
          font-size: 10px;
          color: #666;
        }

        .nail-branding a {
          color: #1976d2;
          text-decoration: none;
        }
      </style>

      <button id="nail-chat-button" aria-label="Open chat">
        💬
      </button>

      <div id="nail-chat-window">
        <div class="nail-chat-header">
          <h3>AI Assistant</h3>
          <button class="nail-close-btn" aria-label="Close chat">×</button>
        </div>

        <div class="nail-messages" id="nail-messages">
          <div class="nail-message bot">
            <div class="nail-message-bubble">
              Hi! How can I help you today?
            </div>
          </div>
        </div>

        <div class="nail-typing" id="nail-typing">
          Typing...
        </div>

        <div class="nail-input-area">
          <input
            type="text"
            class="nail-input"
            id="nail-input"
            placeholder="Type your message..."
            aria-label="Chat message"
          />
          <button class="nail-send-btn" id="nail-send-btn" aria-label="Send message">
            →
          </button>
        </div>

        <div class="nail-branding">
          Powered by <a href="https://nail.app" target="_blank">Nail</a>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Add event listeners
    const chatButton = document.getElementById('nail-chat-button');
    const chatWindow = document.getElementById('nail-chat-window');
    const closeBtn = container.querySelector('.nail-close-btn');
    const sendBtn = document.getElementById('nail-send-btn');
    const input = document.getElementById('nail-input');
    const messagesContainer = document.getElementById('nail-messages');
    const typingIndicator = document.getElementById('nail-typing');

    chatButton.addEventListener('click', () => {
      chatWindow.classList.add('open');
      input.focus();
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.classList.remove('open');
    });

    const sendMessage = async () => {
      const message = input.value.trim();
      if (!message) return;

      // Add user message to chat
      const userMessageEl = document.createElement('div');
      userMessageEl.className = 'nail-message user';
      userMessageEl.innerHTML = `
        <div class="nail-message-bubble">${escapeHtml(message)}</div>
      `;
      messagesContainer.appendChild(userMessageEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Clear input
      input.value = '';
      sendBtn.disabled = true;
      typingIndicator.classList.add('show');

      try {
        // Send message to API
        const response = await fetch(`${apiUrl}/api/bots/${botId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            session_id: sessionId,
          }),
        });

        const data = await response.json();

        // Add bot response to chat
        const botMessageEl = document.createElement('div');
        botMessageEl.className = 'nail-message bot';
        botMessageEl.innerHTML = `
          <div class="nail-message-bubble">${escapeHtml(data.response)}</div>
        `;
        messagesContainer.appendChild(botMessageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

      } catch (error) {
        console.error('Nail Widget: Error sending message', error);
        const errorMessageEl = document.createElement('div');
        errorMessageEl.className = 'nail-message bot';
        errorMessageEl.innerHTML = `
          <div class="nail-message-bubble">Sorry, I'm having trouble right now. Please try again.</div>
        `;
        messagesContainer.appendChild(errorMessageEl);
      } finally {
        typingIndicator.classList.remove('show');
        sendBtn.disabled = false;
        input.focus();
      }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  };

  // Helper function to escape HTML
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

})();
