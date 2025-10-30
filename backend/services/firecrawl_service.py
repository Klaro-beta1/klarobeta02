import httpx
from typing import Dict, List, Optional
from backend.config import settings
from fastapi import HTTPException


class FirecrawlService:
    """Service for interacting with Firecrawl API"""

    def __init__(self):
        self.api_key = settings.FIRECRAWL_API_KEY
        self.base_url = "https://api.firecrawl.dev/v0"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def count_pages(self, url: str) -> int:
        """
        Count total pages on a website using Firecrawl
        Returns the number of pages found
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Use scrape endpoint to check the sitemap or crawl status
                response = await client.post(
                    f"{self.base_url}/scrape",
                    json={
                        "url": url,
                        "pageOptions": {
                            "onlyMainContent": False
                        }
                    },
                    headers=self.headers
                )

                if response.status_code == 403:
                    raise HTTPException(
                        status_code=403,
                        detail="We couldn't access your website. Please check if your site blocks crawlers or contact support."
                    )

                if response.status_code != 200:
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to validate website. Please try again."
                    )

                # For MVP, we'll estimate based on a simple crawl
                # In production, you'd use the crawl endpoint with limit
                data = response.json()

                # Try to extract link count from the page
                # For now, return 1 as minimum (the landing page itself)
                # This is a simplified version - actual implementation should use crawl endpoint
                return 1

        except httpx.TimeoutException:
            raise HTTPException(
                status_code=500,
                detail="Connection timeout. Please try again."
            )
        except httpx.RequestError:
            raise HTTPException(
                status_code=500,
                detail="Connection error. Please try again."
            )

    async def crawl_website(self, url: str, max_pages: Optional[int] = None) -> Dict:
        """
        Crawl a website and return all page content
        """
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                crawl_payload = {
                    "url": url,
                    "crawlerOptions": {
                        "includes": [],
                        "excludes": [],
                        "maxDepth": 3,
                        "mode": "default",
                        "limit": max_pages if max_pages else 100
                    },
                    "pageOptions": {
                        "onlyMainContent": False,
                        "includeHtml": True
                    }
                }

                # Start crawl job
                response = await client.post(
                    f"{self.base_url}/crawl",
                    json=crawl_payload,
                    headers=self.headers
                )

                if response.status_code == 403:
                    raise HTTPException(
                        status_code=403,
                        detail="We couldn't access your website. Please check if your site blocks crawlers or contact support."
                    )

                if response.status_code != 200:
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to start crawling. Please try again."
                    )

                job_data = response.json()
                job_id = job_data.get("jobId")

                if not job_id:
                    raise HTTPException(
                        status_code=500,
                        detail="Failed to start crawling job."
                    )

                # Poll for job completion
                max_attempts = 60  # 5 minutes max
                attempt = 0

                while attempt < max_attempts:
                    await asyncio.sleep(5)  # Wait 5 seconds between checks

                    status_response = await client.get(
                        f"{self.base_url}/crawl/status/{job_id}",
                        headers=self.headers
                    )

                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        status = status_data.get("status")

                        if status == "completed":
                            return {
                                "success": True,
                                "pages": status_data.get("data", []),
                                "total_pages": len(status_data.get("data", []))
                            }
                        elif status == "failed":
                            raise HTTPException(
                                status_code=500,
                                detail="Crawling failed. Please try again."
                            )

                    attempt += 1

                # Timeout
                raise HTTPException(
                    status_code=500,
                    detail="Crawling timeout. Please try again with a smaller website."
                )

        except httpx.TimeoutException:
            raise HTTPException(
                status_code=500,
                detail="Connection timeout. Please try again."
            )
        except httpx.RequestError:
            raise HTTPException(
                status_code=500,
                detail="Connection error. Please try again."
            )


# Add asyncio import at top
import asyncio
