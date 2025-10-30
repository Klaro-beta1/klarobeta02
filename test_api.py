#!/usr/bin/env python3
"""
Test script to verify AI API keys work
"""

import sys
import os
import asyncio

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.services.ai_service import AIService


async def test_ai():
    """Test AI service"""
    print("🧪 Testing AI Service...\n")

    service = AIService()

    # Determine which provider
    if service.use_openai:
        print("✅ Using OpenAI-compatible API (DeepSeek)")
        print(f"   API Key: {service.openai_key[:10]}...")
        print(f"   Base URL: {service.openai_base_url}")
    else:
        print("✅ Using Claude API")
        print(f"   API Key: {service.claude_key[:10]}...")

    print("\n🔄 Testing chat functionality...")

    # Test message
    system_prompt = "You are a helpful assistant. Keep responses under 50 words."
    messages = [{"role": "user", "content": "Hello! What can you help me with?"}]

    try:
        result = await service.chat(system_prompt, messages, max_tokens=100)

        if "error" in result:
            print(f"\n❌ Error: {result['error']}")
            print(f"   Response: {result['response']}")
            return False

        print(f"\n✅ Success!")
        print(f"   Response: {result['response']}")
        print(f"   Tokens used: {result['tokens_used']}")
        return True

    except Exception as e:
        print(f"\n❌ Exception: {e}")
        return False


async def main():
    print("="*60)
    print("Nail Platform - AI API Test")
    print("="*60)
    print()

    success = await test_ai()

    print()
    print("="*60)
    if success:
        print("✅ All tests passed! AI service is working.")
        print("   You can now start the backend and create bots!")
    else:
        print("❌ Tests failed. Please check your API keys.")
        print("   Update backend/.env with valid API keys.")
    print("="*60)

    return 0 if success else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
