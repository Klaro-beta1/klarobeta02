const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const landingPage = `
<!DOCTYPE html>
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
            <div class="flex gap-4 justify-center">
                <a href="/klaro-web/demo" class="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition">
                    Try Live Demo →
                </a>
                <a href="/klaro-web/register" class="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 shadow-lg transform hover:scale-105 transition">
                    Get Started
                </a>
            </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div class="bg-white p-8 rounded-2xl shadow-xl">
                <div class="text-5xl mb-4">🎯</div>
                <h3 class="text-2xl font-bold mb-4">Smart Guidance</h3>
                <p class="text-gray-600">AI understands user questions and provides helpful, contextual answers about your website</p>
            </div>
            <div class="bg-white p-8 rounded-2xl shadow-xl">
                <div class="text-5xl mb-4">✨</div>
                <h3 class="text-2xl font-bold mb-4">Element Highlighting</h3>
                <p class="text-gray-600">Automatically highlights relevant buttons, links, and elements to guide users</p>
            </div>
            <div class="bg-white p-8 rounded-2xl shadow-xl">
                <div class="text-5xl mb-4">⚡</div>
                <h3 class="text-2xl font-bold mb-4">Easy Integration</h3>
                <p class="text-gray-600">Add to any website with just a few lines of code. Works everywhere!</p>
            </div>
        </div>

        <div class="mt-20 bg-white rounded-2xl shadow-2xl p-12 max-w-4xl mx-auto">
            <h2 class="text-4xl font-bold mb-6 text-center">How It Works</h2>
            <div class="space-y-6 text-lg text-gray-700">
                <div class="flex items-start gap-4">
                    <span class="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <p>User asks a question like "Where is the logout button?"</p>
                </div>
                <div class="flex items-start gap-4">
                    <span class="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <p>Klaro AI analyzes your website and understands the context</p>
                </div>
                <div class="flex items-start gap-4">
                    <span class="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <p>AI provides a helpful answer and highlights relevant elements</p>
                </div>
                <div class="flex items-start gap-4">
                    <span class="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</span>
                    <p>User finds what they need instantly - happy users, less support tickets!</p>
                </div>
            </div>
        </div>

        <div class="mt-20 text-center">
            <h2 class="text-4xl font-bold mb-8">Ready to Get Started?</h2>
            <a href="/klaro-web/demo" class="inline-block bg-indigo-600 text-white px-12 py-5 rounded-xl text-xl font-semibold hover:bg-indigo-700 shadow-2xl transform hover:scale-105 transition">
                Try Demo Now →
            </a>
        </div>
    </div>
</body>
</html>
`;

const demoPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Klaro AI - Live Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen p-8">
        <div class="max-w-4xl mx-auto">
            <div class="bg-blue-100 border-2 border-blue-500 rounded-xl p-6 mb-8">
                <h1 class="text-3xl font-bold text-blue-900 mb-2">🤖 Klaro AI - Live Demo</h1>
                <p class="text-blue-800">Click the blue button in the bottom-right corner and try asking:</p>
                <ul class="mt-3 text-blue-800 space-y-1">
                    <li>• "Where is the logout button?"</li>
                    <li>• "How do I download files?"</li>
                    <li>• "Where can I find settings?"</li>
                </ul>
            </div>

            <div class="bg-white rounded-xl shadow-lg p-8">
                <div class="flex justify-between items-center mb-8 border-b pb-4">
                    <h2 class="text-2xl font-bold">Sample Website</h2>
                    <div class="flex gap-6">
                        <a href="#home" class="text-indigo-600 hover:text-indigo-800 font-medium">Home</a>
                        <a href="#dashboard" class="text-indigo-600 hover:text-indigo-800 font-medium">Dashboard</a>
                        <a href="#settings" id="settings-link" class="text-indigo-600 hover:text-indigo-800 font-medium">Settings</a>
                        <a href="#logout" id="logout-btn" class="text-red-600 hover:text-red-800 font-medium">Logout</a>
                    </div>
                </div>

                <div class="space-y-6">
                    <section>
                        <h3 class="text-xl font-semibold mb-4">Welcome!</h3>
                        <p class="text-gray-600 mb-4">This is a sample website to demonstrate Klaro AI's capabilities. Try asking the AI assistant for help!</p>
                        <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium" id="download-btn">
                            📥 Download Report
                        </button>
                    </section>

                    <section class="border-t pt-6">
                        <h3 class="text-xl font-semibold mb-4">Features</h3>
                        <div class="grid md:grid-cols-2 gap-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold mb-2">✓ AI-Powered Help</h4>
                                <p class="text-sm text-gray-600">Get instant answers to your questions</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold mb-2">✓ Smart Navigation</h4>
                                <p class="text-sm text-gray-600">Elements get highlighted automatically</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold mb-2">✓ Step-by-Step</h4>
                                <p class="text-sm text-gray-600">Clear guidance for every action</p>
                            </div>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold mb-2">✓ Works Everywhere</h4>
                                <p class="text-sm text-gray-600">Add to any website easily</p>
                            </div>
                        </div>
                    </section>

                    <section class="border-t pt-6">
                        <h3 class="text-xl font-semibold mb-4">Account Settings</h3>
                        <button class="border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium" id="settings-btn">
                            ⚙️ Open Settings
                        </button>
                    </section>
                </div>
            </div>

            <div class="mt-8 text-center">
                <a href="/klaro-web" class="text-indigo-600 hover:text-indigo-800 font-medium">← Back to Home</a>
            </div>
        </div>
    </div>

    <!-- Klaro AI Widget -->
    <button id="ai-button" class="fixed bottom-6 right-6 bg-indigo-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-indigo-700 font-bold text-lg z-50 hover:scale-110 transition">
        🤖 Ask AI
    </button>

    <div id="chat-widget" class="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl hidden flex-col z-50" style="height: 500px;">
        <div class="bg-indigo-600 text-white p-4 rounded-t-2xl font-bold flex justify-between items-center">
            <span>Klaro AI Assistant</span>
            <button id="close-chat" class="text-white hover:text-gray-200">✕</button>
        </div>
        <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3"></div>
        <div class="p-4 border-t">
            <input type="text" id="chat-input" placeholder="Ask me anything..." class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500">
        </div>
    </div>

    <script>
        const API_URL = 'https://hbfjphdldihlinoikhqk.supabase.co/functions/v1/klaro-api';
        const API_KEY = 'demo_key_public';
        
        const aiButton = document.getElementById('ai-button');
        const chatWidget = document.getElementById('chat-widget');
        const closeChat = document.getElementById('close-chat');
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');

        aiButton.onclick = () => {
            chatWidget.classList.remove('hidden');
            chatWidget.classList.add('flex');
            aiButton.style.display = 'none';
        };

        closeChat.onclick = () => {
            chatWidget.classList.add('hidden');
            chatWidget.classList.remove('flex');
            aiButton.style.display = 'block';
        };

        function addMessage(text, isUser = false) {
            const msg = document.createElement('div');
            msg.className = \`p-3 rounded-lg \${isUser ? 'bg-gray-100 ml-8' : 'bg-indigo-100 mr-8'}\`;
            msg.textContent = text;
            chatMessages.appendChild(msg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        async function sendQuery(query) {
            addMessage(query, true);
            addMessage('Thinking...');

            // Simulate AI response
            setTimeout(() => {
                chatMessages.removeChild(chatMessages.lastChild);
                
                let response = '';
                if (query.toLowerCase().includes('logout')) {
                    response = "I'll help you logout! Look for the red 'Logout' link in the top navigation bar. I've highlighted it for you!";
                    document.getElementById('logout-btn').style.boxShadow = '0 0 0 4px #EF4444';
                    setTimeout(() => {
                        document.getElementById('logout-btn').style.boxShadow = '';
                    }, 3000);
                } else if (query.toLowerCase().includes('download')) {
                    response = "To download the report, click the blue 'Download Report' button below. I've highlighted it!";
                    document.getElementById('download-btn').style.boxShadow = '0 0 0 4px #4F46E5';
                    setTimeout(() => {
                        document.getElementById('download-btn').style.boxShadow = '';
                    }, 3000);
                } else if (query.toLowerCase().includes('settings')) {
                    response = "You can access settings by clicking either the 'Settings' link in the top navigation or the 'Open Settings' button in the Account Settings section. I've highlighted them!";
                    document.getElementById('settings-link').style.boxShadow = '0 0 0 4px #4F46E5';
                    document.getElementById('settings-btn').style.boxShadow = '0 0 0 4px #4F46E5';
                    setTimeout(() => {
                        document.getElementById('settings-link').style.boxShadow = '';
                        document.getElementById('settings-btn').style.boxShadow = '';
                    }, 3000);
                } else {
                    response = \`I'm here to help you navigate this website! Try asking me: "Where is the logout button?", "How do I download files?", or "Where are settings?"\`;
                }
                
                addMessage(response);
            }, 1000);
        }

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && chatInput.value.trim()) {
                sendQuery(chatInput.value.trim());
                chatInput.value = '';
            }
        });

        // Show welcome message
        setTimeout(() => {
            addMessage('Hi! I\'m Klaro AI. Try asking me: "Where is the logout button?"');
        }, 500);
    </script>
</body>
</html>
`;

const registerPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Klaro AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 class="text-3xl font-bold mb-2 text-center">🤖 Get Started</h1>
        <p class="text-gray-600 text-center mb-8">Add Klaro AI to your website</p>
        
        <form id="registerForm" class="space-y-4">
            <div>
                <label class="block text-sm font-semibold mb-2">Your Name</label>
                <input type="text" id="name" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-semibold mb-2">Email</label>
                <input type="email" id="email" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500">
            </div>
            <div>
                <label class="block text-sm font-semibold mb-2">Website Domain</label>
                <input type="text" id="domain" placeholder="example.com" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500">
            </div>
            <button type="submit" class="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-indigo-700 transition">
                Create Account
            </button>
        </form>
        
        <div id="result" class="mt-6 hidden"></div>
        
        <div class="mt-6 text-center">
            <a href="/klaro-web" class="text-indigo-600 hover:text-indigo-800 font-medium">← Back to Home</a>
        </div>
    </div>

    <script>
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const domain = document.getElementById('domain').value;
            
            const result = document.getElementById('result');
            result.innerHTML = '<p class="text-center text-gray-600">Creating your account...</p>';
            result.classList.remove('hidden');
            
            try {
                const response = await fetch('https://hbfjphdldihlinoikhqk.supabase.co/functions/v1/klaro-api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, domain })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    result.innerHTML = \`
                        <div class="bg-green-100 border-2 border-green-500 rounded-xl p-4">
                            <p class="font-bold text-green-900 mb-2">✅ Success!</p>
                            <p class="text-green-800 text-sm mb-3">Your API Key:</p>
                            <p class="bg-white p-3 rounded font-mono text-sm break-all border-2 border-green-200">\${data.client.apiKey}</p>
                            <p class="text-green-800 text-sm mt-3">Save this key - you'll need it to integrate Klaro AI!</p>
                        </div>
                    \`;
                } else {
                    result.innerHTML = \`<div class="bg-red-100 border-2 border-red-500 rounded-xl p-4 text-red-800">❌ \${data.error || 'Registration failed'}</div>\`;
                }
            } catch (error) {
                result.innerHTML = '<div class="bg-red-100 border-2 border-red-500 rounded-xl p-4 text-red-800">❌ Network error. Please try again.</div>';
            }
        });
    </script>
</body>
</html>
`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    if (path === '/klaro-web' || path === '/klaro-web/') {
      return new Response(landingPage, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    if (path === '/klaro-web/demo') {
      return new Response(demoPage, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    if (path === '/klaro-web/register') {
      return new Response(registerPage, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    return new Response('Not Found', { status: 404 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
});