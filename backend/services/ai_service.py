"""
Unified AI Service supporting multiple providers
Supports: Claude (Anthropic), OpenAI-compatible APIs
"""

from typing import List, Dict
from backend.config import settings
import httpx


class AIService:
    """Service for interacting with AI models (Claude or OpenAI-compatible)"""

    def __init__(self):
        self.claude_key = settings.CLAUDE_API_KEY
        self.openai_key = settings.OPENAI_API_KEY if hasattr(settings, 'OPENAI_API_KEY') else None
        self.openai_base_url = settings.OPENAI_BASE_URL if hasattr(settings, 'OPENAI_BASE_URL') else "https://api.openai.com/v1"

        # Determine which provider to use
        self.use_openai = self._should_use_openai()

    def _should_use_openai(self) -> bool:
        """Determine if we should use OpenAI-compatible API"""
        # If Claude key looks invalid or OpenAI key is present, use OpenAI
        if self.openai_key:
            return True
        if self.claude_key and (self.claude_key.startswith('sk-') or len(self.claude_key) == 32):
            return True
        return False

    def create_bot_system_prompt(self, crawled_data: List[Dict], bot_name: str, website_url: str) -> str:
        """Create initial system prompt for bot from crawled website data"""
        content_text = ""
        for page in crawled_data[:50]:
            page_url = page.get("url", "")
            page_content = page.get("markdown", "") or page.get("text", "")
            content_text += f"\n\n--- Page: {page_url} ---\n{page_content[:2000]}"

        system_prompt = f"""You are {bot_name}, an AI assistant for the website {website_url}.

Your purpose is to help visitors by answering questions about:
- Website navigation and features
- Company information and services
- Account management
- General inquiries about the business

**Knowledge Base:**
{content_text[:15000]}

**Instructions:**
- Provide concise, accurate responses (keep under 100 words)
- Be friendly and professional
- If you don't know something, say so honestly
- Direct users to contact support for complex issues
- Never make up information not in your knowledge base

**Response Style:**
- Keep responses short and to the point
- Use simple, clear language
- Be helpful and courteous"""

        return system_prompt

    async def chat_openai(self, system_prompt: str, messages: List[Dict[str, str]], max_tokens: int = 500) -> Dict:
        """Chat using OpenAI-compatible API"""
        try:
            # Build messages with system prompt
            api_messages = [{"role": "system", "content": system_prompt}]
            api_messages.extend(messages)

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.openai_base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-3.5-turbo",  # Or any compatible model
                        "messages": api_messages,
                        "max_tokens": max_tokens,
                        "temperature": 0.7
                    }
                )

                if response.status_code != 200:
                    raise Exception(f"API error: {response.status_code} - {response.text}")

                data = response.json()
                response_text = data["choices"][0]["message"]["content"]
                tokens_used = data.get("usage", {}).get("total_tokens", 0)

                return {
                    "response": response_text,
                    "tokens_used": tokens_used
                }

        except Exception as e:
            print(f"OpenAI API Error: {e}")
            return {
                "response": "I'm having trouble right now. Please try again in a moment.",
                "tokens_used": 0,
                "error": str(e)
            }

    async def chat_claude(self, system_prompt: str, messages: List[Dict[str, str]], max_tokens: int = 500) -> Dict:
        """Chat using Claude API"""
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.claude_key)

            response = client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=max_tokens,
                system=system_prompt,
                messages=messages
            )

            response_text = ""
            for block in response.content:
                if hasattr(block, 'text'):
                    response_text += block.text

            tokens_used = response.usage.input_tokens + response.usage.output_tokens

            return {
                "response": response_text,
                "tokens_used": tokens_used
            }

        except Exception as e:
            print(f"Claude API Error: {e}")
            return {
                "response": "I'm having trouble right now. Please try again in a moment.",
                "tokens_used": 0,
                "error": str(e)
            }

    async def chat(self, system_prompt: str, messages: List[Dict[str, str]], max_tokens: int = 500) -> Dict:
        """
        Send a chat message and get response (automatically selects provider)

        Args:
            system_prompt: The system prompt defining bot behavior
            messages: List of message dicts with 'role' and 'content'
            max_tokens: Maximum tokens in response

        Returns:
            Dict with 'response' and 'tokens_used'
        """
        if self.use_openai:
            return await self.chat_openai(system_prompt, messages, max_tokens)
        else:
            return await self.chat_claude(system_prompt, messages, max_tokens)

    def count_tokens_estimate(self, text: str) -> int:
        """Estimate token count for text"""
        return len(text) // 4
