import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NEWS_API_KEY = 'aaf1241fe4db437faba32b0a0cf433af'; // Replace with your actual API key
const BASE_URL = 'https://newsapi.org/v2';

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
}

// Keyword to page mapping
const KEYWORD_PAGE_MAPPING: { [key: string]: string } = {
  'grocery': '/products',
  'shopping': '/products',
  'food': '/products',
  'vegetable': '/products?category=Vegetables',
  'fruit': '/products?category=Fruits',
  'dairy': '/products?category=Dairy',
  'meat': '/products?category=Meat',
  'organic': '/products',
  'healthy': '/products',
  'recipe': '/products',
  'cooking': '/products',
  'nutrition': '/products',
  'diet': '/products',
  'safety': '/about',
  'quality': '/about',
  'service': '/services',
  'delivery': '/services',
  'subscription': '/subscriptions',
  'gift': '/diaspora-gifting',
  'international': '/diaspora-gifting'
};

class NewsService {
  async getTopHeadlines(category: string = 'business', pageSize: number = 10) {
    try {
      const response = await axios.get(`${BASE_URL}/top-headlines`, {
        params: {
          category,
          pageSize,
          apiKey: NEWS_API_KEY
        }
      });
      
      return response.data.articles as NewsArticle[];
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  }

  async searchArticles(query: string, pageSize: number = 10) {
    try {
      const response = await axios.get(`${BASE_URL}/everything`, {
        params: {
          q: query,
          pageSize,
          sortBy: 'publishedAt',
          apiKey: NEWS_API_KEY
        }
      });
      
      return response.data.articles as NewsArticle[];
    } catch (error) {
      console.error('Error searching news:', error);
      throw error;
    }
  }
  
  // Get relevant page URL for an article based on its content
  getRelevantPageUrl(article: NewsArticle): string {
    const title = article.title.toLowerCase();
    const description = article.description.toLowerCase();
    const content = (article.content || '').toLowerCase();
    
    // Combine all text to search
    const fullText = `${title} ${description} ${content}`;
    
    // Find matching keywords
    for (const [keyword, page] of Object.entries(KEYWORD_PAGE_MAPPING)) {
      if (fullText.includes(keyword)) {
        return page;
      }
    }
    
    // Default to home page if no keywords match
    return '/';
  }
}

export const newsService = new NewsService();