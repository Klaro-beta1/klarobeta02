import anthropic
from typing import List, Dict
from backend.config import settings


class ClaudeService:
    """Service for interacting with Claude AI"""

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.CLAUDE_API_KEY)
        self.model = "claude-3-5-sonnet-20241022"  # Using latest Claude model

    def create_bot_system_prompt(self, crawled_data: List[Dict], bot_name: str, website_url: str) -> str:
        """
        Create initial system prompt for bot from crawled website data
        """
        # Extract text content from crawled pages
        content_text = ""
        for page in crawled_data[:50]:  # Limit to first 50 pages to avoid token limits
            page_url = page.get("url", "")
            page_content = page.get("markdown", "") or page.get("text", "")
            content_text += f"\n\n--- Page: {page_url} ---\n{page_content[:2000]}"  # Limit each page

        system_prompt = f"""You are {bot_name}, an AI assistant for the website {website_url}.

Your purpose is to help visitors by answering questions about:
- Website navigation and features
- Company information and services
- Account management
- General inquiries about the business

**Knowledge Base:**
{content_text[:15000]}  # Limit total content

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

    def chat(self, system_prompt: str, messages: List[Dict[str, str]], max_tokens: int = 500) -> Dict:
        """
        Send a chat message to Claude and get response

        Args:
            system_prompt: The system prompt defining bot behavior
            messages: List of message dicts with 'role' and 'content'
            max_tokens: Maximum tokens in response

        Returns:
            Dict with 'response' and 'tokens_used'
        """
        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=messages
            )

            # Extract response text
            response_text = ""
            for block in response.content:
                if hasattr(block, 'text'):
                    response_text += block.text

            # Calculate total tokens used (input + output)
            tokens_used = response.usage.input_tokens + response.usage.output_tokens

            return {
                "response": response_text,
                "tokens_used": tokens_used
            }

        except Exception as e:
            return {
                "response": "I'm having trouble right now. Please try again in a moment.",
                "tokens_used": 0,
                "error": str(e)
            }

    def customize_bot_chat(
        self,
        current_prompt: str,
        user_message: str,
        conversation_history: List[Dict[str, str]]
    ) -> Dict:
        """
        Chat with Claude to customize the bot's system prompt
        Returns updated prompt and response
        """
        try:
            customization_system = """You are an AI assistant helping users customize their chatbot.
The user will tell you how they want to modify their bot's behavior, personality, or knowledge.

Your job:
1. Understand their request
2. Update the bot's system prompt accordingly
3. Confirm the changes clearly

When updating prompts:
- Keep the core structure intact
- Add/modify specific sections based on user requests
- Maintain clarity and conciseness

Current bot system prompt:
""" + current_prompt

            # Add user message to history
            messages = conversation_history + [{"role": "user", "content": user_message}]

            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                system=customization_system,
                messages=messages
            )

            # Extract response
            response_text = ""
            for block in response.content:
                if hasattr(block, 'text'):
                    response_text += block.text

            tokens_used = response.usage.input_tokens + response.usage.output_tokens

            return {
                "response": response_text,
                "tokens_used": tokens_used,
                "updated_prompt": current_prompt  # In MVP, we'll update this manually
            }

        except Exception as e:
            return {
                "response": "I'm having trouble right now. Please try again in a moment.",
                "tokens_used": 0,
                "error": str(e)
            }

    def count_tokens_estimate(self, text: str) -> int:
        """
        Estimate token count for text
        Rough estimate: 1 token ≈ 4 characters
        """
        return len(text) // 4
