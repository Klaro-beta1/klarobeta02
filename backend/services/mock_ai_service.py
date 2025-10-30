"""
Mock AI Service for testing without real API keys
Simulates AI responses for development and testing
"""

from typing import List, Dict
import random


class MockAIService:
    """Mock AI service that simulates responses without calling real APIs"""

    def __init__(self):
        self.mock_responses = [
            "I'm a helpful AI assistant for this website. How can I help you today?",
            "I'd be happy to help you with that! Let me provide some information.",
            "That's a great question! Based on the website content, here's what I know.",
            "I can assist you with information about our services, products, and more.",
            "Thank you for reaching out! I'm here to help answer your questions.",
        ]

    def create_bot_system_prompt(self, crawled_data: List[Dict], bot_name: str, website_url: str) -> str:
        """Create a mock system prompt"""
        return f"""You are {bot_name}, an AI assistant for {website_url}.

This is a DEMO MODE using simulated responses.
You would normally be trained on the website content."""

    async def chat(self, system_prompt: str, messages: List[Dict[str, str]], max_tokens: int = 500) -> Dict:
        """
        Simulate chat responses without calling real API

        Args:
            system_prompt: The system prompt (ignored in mock)
            messages: List of message dicts
            max_tokens: Maximum tokens (ignored in mock)

        Returns:
            Dict with 'response' and 'tokens_used'
        """
        # Get last user message
        user_message = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                break

        # Generate contextual response
        response = self._generate_mock_response(user_message)

        return {
            "response": response,
            "tokens_used": len(response.split()) * 2  # Mock token count
        }

    def _generate_mock_response(self, user_message: str) -> str:
        """Generate a contextual mock response"""
        message_lower = user_message.lower()

        # Contextual responses based on keywords
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'greet']):
            return "Hello! Welcome to our website. I'm an AI assistant here to help you. What would you like to know?"

        elif any(word in message_lower for word in ['help', 'assist', 'support']):
            return "I'm here to help! I can answer questions about our website, products, services, and more. Feel free to ask anything."

        elif any(word in message_lower for word in ['price', 'cost', 'pricing', 'how much']):
            return "For detailed pricing information, I'd recommend checking our pricing page or contacting our sales team directly. They can provide you with the most accurate quotes."

        elif any(word in message_lower for word in ['contact', 'email', 'phone', 'reach']):
            return "You can contact us through the contact form on our website, or reach out via email or phone. Check the 'Contact Us' section for more details."

        elif any(word in message_lower for word in ['where', 'location', 'address']):
            return "You can find our location information in the footer of the website or on our Contact page. We're happy to help with directions!"

        elif any(word in message_lower for word in ['product', 'service', 'offer', 'what do you']):
            return "We offer a range of products and services designed to meet your needs. You can browse our full catalog on the website or ask me about specific offerings."

        elif any(word in message_lower for word in ['thank', 'thanks']):
            return "You're welcome! Is there anything else I can help you with today?"

        else:
            # Random helpful response
            return random.choice([
                f"That's an interesting question about '{user_message[:50]}...'. Based on the website content, I can provide information on related topics. What specifically would you like to know?",
                "I understand your question. While I'm in demo mode right now, the actual AI assistant would provide detailed information based on the website content.",
                "Great question! In a fully operational setup, I'd analyze the website content to give you a precise answer. For now, I'm simulating responses.",
                f"I see you're asking about {user_message[:30]}. The live version would provide comprehensive answers based on the trained knowledge base.",
            ])

    def count_tokens_estimate(self, text: str) -> int:
        """Estimate token count"""
        return len(text) // 4
