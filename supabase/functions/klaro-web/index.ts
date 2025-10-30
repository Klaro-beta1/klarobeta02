const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Klaro AI - Intelligent Website Assistant</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <div class="container mx-auto px-4 py-16">
        <div class="text-center mb-16">
            <h1 class="text-6xl font-bold text-gray-900 mb-6">🤖 Klaro AI</h1>
            <p class="text-2xl text-gray-700 mb-8">Intelligent Website Assistant</p>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                Help your users navigate your website with AI-powered assistance. 
                Get instant answers, element highlighting, and step-by-step guidance.
            </p>
            <a href="/klaro-web/demo" class="inline-block bg-indigo-600 text-white px-12 py-5 rounded-xl text-xl font-semibold hover:bg-indigo-700 shadow-2xl transform hover:scale-105 transition">
                Try Live Demo →
            </a>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div class="bg-white p-8 rounded-2xl shadow-xl">
                <div class="text-5xl mb-4">🎯</div>
                <h3 class="text-2xl font-bold mb-4">Smart Guidance</h3>
                <p class="text-gray-600">AI understands user questions and provides helpful, contextual answers</p>
            </div>
            <div class="bg-white p-8 rounded-2xl shadow-xl">
                <div class="text-5xl mb-4">✨</div>
                <h3 class="text-2xl font-bold mb-4">Element Highlighting</h3>
                <p class="text-gray-600">Automatically highlights relevant buttons and links to guide users</p>
            </div>
            <div class="bg-white p-8 rounded-2xl shadow-xl">
                <div class="text-5xl mb-4">⚡</div>
                <h3 class="text-2xl font-bold mb-4">Easy Integration</h3>
                <p class="text-gray-600">Add to any website with just a few lines of code</p>
            </div>
        </div>
    </div>
</body>
</html>`;

const demoHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Klaro AI Demo - Live Website Assistant</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen p-8">
        <header class="max-w-4xl mx-auto mb-8">
            <div class="bg-blue-100 border-2 border-blue-500 rounded-xl p-6">
                <h1 class="text-3xl font-bold text-blue-900 mb-2">🤖 Klaro AI Demo</h1>
                <p class="text-blue-800 mb-3">Click the AI button in the bottom-right corner and try asking:</p>
                <ul class="text-blue-800 space-y-1">
                    <li>• "Where is the logout button?"</li>
                    <li>• "How do I download files?"</li>
                    <li>• "Where can I find settings?"</li>
                </ul>
            </div>
        </header>

        <main class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow-sm p-8">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-semibold">Sample Website</h2>
                    <div class="flex gap-4">
                        <a href="#home" class="text-indigo-600 hover:text-indigo-800">Home</a>
                        <a href="#dashboard" class="text-indigo-600 hover:text-indigo-800">Dashboard</a>
                        <a href="#logout" id="logout-btn" class="text-red-600 hover:text-red-800 font-medium">Logout</a>
                    </div>
                </div>

                <div class="space-y-6">
                    <section>
                        <h3 class="text-xl font-semibold mb-4">Welcome to Demo Site</h3>
                        <p class="text-gray-600 mb-4">This is a sample website to demonstrate Klaro AI's capabilities.</p>
                        <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700" id="download-btn">
                            Download Report
                        </button>
                    </section>

                    <section class="border-t pt-6">
                        <h3 class="text-xl font-semibold mb-4">Features</h3>
                        <ul class="space-y-2 text-gray-600">
                            <li>✓ AI-powered navigation assistance</li>
                            <li>✓ Element highlighting</li>
                            <li>✓ Natural language queries</li>
                            <li>✓ Step-by-step guidance</li>
                        </ul>
                    </section>

                    <section class="border-t pt-6">
                        <h3 class="text-xl font-semibold mb-4">Settings</h3>
                        <button class="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50" id="settings-btn">
                            Open Settings
                        </button>
                    </section>
                </div>
            </div>
        </main>
    </div>

    <button id="ai-button" style="position:fixed;bottom:20px;right:20px;background:#4F46E5;color:white;padding:16px 24px;border-radius:50px;border:none;cursor:pointer;box-shadow:0 4px 6px rgba(0,0,0,0.1);font-size:16px;font-weight:600;z-index:1000;">
        🤖 Ask AI
    </button>

    <div id="chat-widget" style="position:fixed;bottom:90px;right:20px;width:350px;height:500px;background:white;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.2);display:none;flex-direction:column;z-index:1000;">
        <div style="background:#4F46E5;color:white;padding:16px;border-radius:12px 12px 0 0;font-weight:600;">
            Klaro AI Assistant
        </div>
        <div id="chat-messages" style="flex:1;overflow-y:auto;padding:16px;"></div>
        <div style="padding:16px;border-top:1px solid #e5e7eb;">
            <input type="text" id="chat-input" placeholder="Ask me anything..." style="width:100%;padding:12px;border:1px solid #d1d5db;border-radius:8px;outline:none;">
        </div>
    </div>

    <script>
        const aiButton = document.getElementById('ai-button');
        const chatWidget = document.getElementById('chat-widget');
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');

        aiButton.onclick = () => {
            chatWidget.style.display = 'flex';
        };

        function addMessage(text, isUser = false) {
            const msg = document.createElement('div');
            msg.style.cssText = \`background:\${isUser ? '#f3f4f6' : '#EEF2FF'};padding:12px;border-radius:8px;margin-bottom:12px;\${isUser ? '' : 'border-left:4px solid #4F46E5;'}\`;
            msg.textContent = text;
            chatMessages.appendChild(msg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function sendQuery(query) {
            addMessage(query, true);
            
            setTimeout(() => {
                let response = '';
                if (query.toLowerCase().includes('logout')) {
                    response = "I'll help you logout! Look for the red 'Logout' link in the top navigation. I've highlighted it for you!";
                    document.getElementById('logout-btn').style.boxShadow = '0 0 0 3px #EF4444';
                    setTimeout(() => document.getElementById('logout-btn').style.boxShadow = '', 3000);
                } else if (query.toLowerCase().includes('download')) {
                    response = "To download the report, click the 'Download Report' button. I've highlighted it!";
                    document.getElementById('download-btn').style.boxShadow = '0 0 0 3px #4F46E5';
                    setTimeout(() => document.getElementById('download-btn').style.boxShadow = '', 3000);
                } else if (query.toLowerCase().includes('settings')) {
                    response = "You can access settings by clicking the 'Open Settings' button below!";
                    document.getElementById('settings-btn').style.boxShadow = '0 0 0 3px #4F46E5';
                    setTimeout(() => document.getElementById('settings-btn').style.boxShadow = '', 3000);
                } else {
                    response = "I'm here to help you navigate! Try asking: 'Where is the logout button?', 'How do I download files?', or 'Where are settings?'";
                }
                addMessage(response);
            }, 800);
        }

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && chatInput.value.trim()) {
                sendQuery(chatInput.value.trim());
                chatInput.value = '';
            }
        });

        setTimeout(() => {
            addMessage('Hi! I\'m Klaro AI. Try asking: "Where is the logout button?"');
        }, 500);
    </script>
</body>
</html>`;

Deno.serve((req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (path === '/klaro-web' || path === '/klaro-web/') {
    return new Response(indexHTML, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  if (path === '/klaro-web/demo') {
    return new Response(demoHTML, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  return new Response('Not Found', { status: 404, headers: corsHeaders });
});