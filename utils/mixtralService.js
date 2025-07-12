const axios = require('axios');
require('dotenv').config();

class MixtralService {
  constructor() {
    this.apiKey = process.env.MIXTRAL_API_KEY;
    this.baseURL = process.env.MIXTRAL_BASE_URL || 'https://api.mistral.ai/v1';
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequestWithRetry(requestFn, attempt = 1) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.response?.status === 429 && attempt < this.retryAttempts) {
        console.log(`Rate limited (429). Retrying in ${this.retryDelay}ms... (Attempt ${attempt}/${this.retryAttempts})`);
        await this.delay(this.retryDelay * attempt); // Exponential backoff
        return this.makeRequestWithRetry(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  // Helper function to determine if it's an expense
  determineIsExpense(extractedText) {
    const text = extractedText.toLowerCase();
    
    // Find the first occurrence of "from" and "to"
    const fromIndex = text.indexOf('from');
    const toIndex = text.indexOf('to');
    
    // If "from" appears first (or "to" doesn't exist), it's income (false)
    if (fromIndex !== -1 && (toIndex === -1 || fromIndex < toIndex)) {
      return false;
    }
    
    // If "to" appears first (or "from" doesn't exist), it's expense (true)
    if (toIndex !== -1 && (fromIndex === -1 || toIndex < fromIndex)) {
      return true;
    }
    
    // Default to true if neither is found
    return true;
  }

  // Helper function to extract name based on isExpense
  extractName(extractedText, isExpense) {
    const text = extractedText.toLowerCase();
    
    if (isExpense) {
      // Look for "paid to" or "to:" followed by name
      const paidToMatch = text.match(/(?:paid to|to:?)\s*([^\n\r]+)/i);
      if (paidToMatch) {
        return paidToMatch[1].trim();
      }
      
      // Look for "to" at the beginning followed by name
      const toMatch = text.match(/^to\s+([^\n\r]+)/i);
      if (toMatch) {
        return toMatch[1].trim();
      }
    } else {
      // Look for "from" followed by name
      const fromMatch = text.match(/(?:from|from:?)\s*([^\n\r]+)/i);
      if (fromMatch) {
        return fromMatch[1].trim();
      }
    }
    
    return null;
  }

  async parseReceiptData(extractedText) {
    try {
      // First, determine if it's an expense
      const isExpense = this.determineIsExpense(extractedText);
      
      // Extract name based on isExpense
      const name = this.extractName(extractedText, isExpense);
      
      const prompt = `
        Parse the following receipt/bill text and extract ONLY these specific fields:
        
        ${extractedText}
        
        Please extract and return ONLY a JSON object with the following structure:
        {
          "amount": "numeric amount (extract the main transaction amount)",
          "date": "transaction date in YYYY-MM-DD format",
          "time": "transaction time in HH:MM format (24-hour format)"
        }
        
        Rules:
        - Extract only the main transaction amount (ignore fees, taxes separately)
        - Date should be in YYYY-MM-DD format
        - Time should be in HH:MM format (24-hour)
        - If any field is not found, use null
        - Return only the JSON object, no additional text
      `;

      const response = await this.makeRequestWithRetry(async () => {
        return axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: 'mistral-large-latest',
            messages: [
              {
                role: 'system',
                content: 'You are a receipt parsing assistant. Extract only the specified fields and return valid JSON.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.1,
            max_tokens: 300
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
      });

      const parsedResponse = response.data.choices[0].message.content;
      
      // Extract JSON from response
      const jsonMatch = parsedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Combine AI extracted data with our logic
        return {
          isExpense: isExpense,
          name: name,
          amount: parsedData.amount,
          date: parsedData.date,
          time: parsedData.time
        };
      }
      
      throw new Error('Failed to parse JSON response from Mixtral');
      
    } catch (error) {
      console.error('Mixtral API Error:', error.message);
      
      if (error.response?.status === 429) {
        throw new Error(`Mixtral rate limit exceeded. Please try again in a few minutes or check your account limits.`);
      }
      
      throw new Error(`Mixtral parsing failed: ${error.message}`);
    }
  }

  async categorizeExpense(description, amount) {
    try {
      const prompt = `
        Categorize this expense based on the description and amount:
        Description: ${description}
        Amount: ${amount}
        
        Return only one of these categories:
        - food
        - transport
        - shopping
        - entertainment
        - healthcare
        - education
        - utilities
        - other
        
        Return only the category name, nothing else.
      `;

      const response = await this.makeRequestWithRetry(async () => {
        return axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: 'mistral-large-latest',
            messages: [
              {
                role: 'system',
                content: 'You are an expense categorization assistant. Return only the category name.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.1,
            max_tokens: 50
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
      });

      return response.data.choices[0].message.content.trim().toLowerCase();
      
    } catch (error) {
      console.error('Mixtral categorization error:', error.message);
      return 'other'; // fallback category
    }
  }
}

module.exports = new MixtralService(); 