const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class ScrapingService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (compatible; KlaroBot/2.0; +https://klaro.ai/bot)';
    this.timeout = 10000; // 10 seconds
    this.maxRetries = 3;
  }

  async scrapePage(url, retries = 0) {
    try {
      console.log(`Scraping page: ${url}`);
      
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 400 // Accept redirects
      });

      if (!response.data) {
        throw new Error('No content received');
      }

      const $ = cheerio.load(response.data);
      
      // Extract comprehensive page data
      const pageData = {
        url,
        title: $('title').text().trim() || '',
        description: $('meta[name="description"]').attr('content') || '',
        
        // Headings structure
        headings: this.extractHeadings($),
        
        // Navigation and links
        links: this.extractLinks($, url),
        
        // Interactive elements
        buttons: this.extractButtons($),
        forms: this.extractForms($),
        inputs: this.extractInputs($),
        
        // Content sections
        content: this.extractContent($),
        
        // Meta information
        lastScraped: new Date().toISOString(),
        responseTime: response.headers['x-response-time'] || null,
        statusCode: response.status
      };

      console.log(`Successfully scraped: ${url} (${pageData.title})`);
      return pageData;

    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      
      // Retry logic
      if (retries < this.maxRetries && this.shouldRetry(error)) {
        console.log(`Retrying ${url} (attempt ${retries + 1}/${this.maxRetries})`);
        await this.delay(1000 * (retries + 1)); // Exponential backoff
        return this.scrapePage(url, retries + 1);
      }
      
      return null;
    }
  }

  async scrapeWebsite(domain, maxPages = 50) {
    const visited = new Set();
    const toVisit = [domain];
    const pages = {};
    const errors = [];
    let pagesScraped = 0;

    console.log(`Starting website scrape: ${domain} (max ${maxPages} pages)`);

    while (toVisit.length > 0 && pagesScraped < maxPages) {
      const url = toVisit.shift();
      
      if (visited.has(url)) continue;
      visited.add(url);

      // Rate limiting
      if (pagesScraped > 0) {
        await this.delay(200); // 200ms between requests
      }

      const pageData = await this.scrapePage(url);
      
      if (pageData) {
        pages[url] = pageData;
        pagesScraped++;
        
        // Find more links to scrape (same domain only)
        const newLinks = this.findInternalLinks(pageData.links, domain, visited);
        toVisit.push(...newLinks.slice(0, 10)); // Limit new links per page
        
        console.log(`Scraped ${pagesScraped}/${maxPages}: ${pageData.title}`);
      } else {
        errors.push({ url, error: 'Failed to scrape' });
      }
    }

    console.log(`Website scraping completed: ${pagesScraped} pages scraped`);

    return {
      domain,
      pages,
      pagesScraped,
      totalPages: visited.size,
      errors,
      completedAt: new Date().toISOString()
    };
  }

  extractHeadings($) {
    const headings = [];
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (text && text.length > 0) {
        headings.push({
          level: el.tagName.toLowerCase(),
          text: text,
          id: $el.attr('id') || null
        });
      }
    });
    return headings.slice(0, 20); // Limit to prevent bloat
  }

  extractLinks($, baseUrl) {
    const links = [];
    $('a[href]').each((i, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      const text = $el.text().trim();
      
      if (href && text) {
        try {
          const fullUrl = new URL(href, baseUrl).href;
          links.push({
            text: text,
            href: fullUrl,
            title: $el.attr('title') || null,
            target: $el.attr('target') || null
          });
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });
    return links.slice(0, 50); // Limit to prevent bloat
  }

  extractButtons($) {
    const buttons = [];
    $('button, input[type="submit"], input[type="button"], a[role="button"]').each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim() || $el.val() || $el.attr('aria-label') || '';
      
      if (text) {
        buttons.push({
          text: text,
          id: $el.attr('id') || null,
          className: $el.attr('class') || null,
          type: $el.attr('type') || el.tagName.toLowerCase(),
          disabled: $el.prop('disabled') || false
        });
      }
    });
    return buttons.slice(0, 30);
  }

  extractForms($) {
    const forms = [];
    $('form').each((i, el) => {
      const $el = $(el);
      forms.push({
        id: $el.attr('id') || null,
        action: $el.attr('action') || null,
        method: $el.attr('method') || 'get',
        inputs: $el.find('input, textarea, select').length
      });
    });
    return forms;
  }

  extractInputs($) {
    const inputs = [];
    $('input, textarea, select').each((i, el) => {
      const $el = $(el);
      inputs.push({
        type: $el.attr('type') || el.tagName.toLowerCase(),
        name: $el.attr('name') || null,
        id: $el.attr('id') || null,
        placeholder: $el.attr('placeholder') || null,
        required: $el.prop('required') || false
      });
    });
    return inputs.slice(0, 20);
  }

  extractContent($) {
    // Extract main content areas
    const content = [];
    
    // Try to find main content areas
    const contentSelectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '.content',
      '#content',
      'article',
      '.post',
      '.page-content'
    ];

    for (const selector of contentSelectors) {
      const $content = $(selector);
      if ($content.length > 0) {
        const text = $content.text().trim();
        if (text.length > 100) { // Only include substantial content
          content.push({
            selector,
            text: text.substring(0, 1000), // Limit content length
            wordCount: text.split(/\s+/).length
          });
          break; // Use first substantial content area found
        }
      }
    }

    // Fallback to body content if no main content found
    if (content.length === 0) {
      const bodyText = $('body').text().trim();
      if (bodyText.length > 100) {
        content.push({
          selector: 'body',
          text: bodyText.substring(0, 1000),
          wordCount: bodyText.split(/\s+/).length
        });
      }
    }

    return content;
  }

  findInternalLinks(links, domain, visited) {
    const baseDomain = new URL(domain).hostname;
    const internalLinks = [];

    for (const link of links) {
      try {
        const linkUrl = new URL(link.href);
        
        // Check if it's the same domain and not already visited
        if (linkUrl.hostname === baseDomain && !visited.has(link.href)) {
          // Skip certain file types and fragments
          if (!this.shouldSkipUrl(link.href)) {
            internalLinks.push(link.href);
          }
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }

    return internalLinks;
  }

  shouldSkipUrl(url) {
    const skipPatterns = [
      /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|tar|gz)$/i,
      /\.(jpg|jpeg|png|gif|svg|ico|webp)$/i,
      /\.(mp3|mp4|avi|mov|wmv|flv)$/i,
      /#/,  // Skip fragments
      /mailto:/,
      /tel:/,
      /javascript:/
    ];

    return skipPatterns.some(pattern => pattern.test(url));
  }

  shouldRetry(error) {
    // Retry on network errors, timeouts, and 5xx errors
    return (
      error.code === 'ECONNRESET' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      (error.response && error.response.status >= 500)
    );
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check for scraping service
  async healthCheck() {
    try {
      const testUrl = 'https://httpbin.org/html';
      const result = await this.scrapePage(testUrl);
      
      return {
        status: result ? 'ok' : 'error',
        message: result ? 'Scraping service is operational' : 'Failed to scrape test page',
        testUrl
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        testUrl: 'https://httpbin.org/html'
      };
    }
  }
}

module.exports = { ScrapingService };