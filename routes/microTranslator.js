const axios = require('axios');
require('dotenv').config();

async function translateWithMicrosoft(text, targetLanguage = 'ig') {
   try {
      // Validate environment variables
      const subscriptionKey = process.env.MICROSOFT_TRANSLATOR_KEY;
      const endpoint =
         process.env.MICROSOFT_TRANSLATOR_ENDPOINT ||
         'https://api.cognitive.microsofttranslator.com';
      const region = process.env.MICROSOFT_TRANSLATOR_REGION || 'eastus';

      if (!subscriptionKey) {
         throw new Error(
            'Microsoft Translator subscription key is missing. Please check your .env file.'
         );
      }

      console.log('Using Microsoft Translator with region:', region);

      const response = await axios({
         method: 'POST',
         url: `${endpoint}/translate`,
         params: {
            'api-version': '3.0',
            to: targetLanguage,
         },
         headers: {
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'Ocp-Apim-Subscription-Region': region,
            'Content-Type': 'application/json',
            'X-ClientTraceId': generateTraceId(),
         },
         data: [
            {
               text: text,
            },
         ],
         timeout: 10000, // 10 second timeout
      });

      if (
         response.data &&
         response.data[0] &&
         response.data[0].translations &&
         response.data[0].translations[0]
      ) {
         const translatedText = response.data[0].translations[0].text;
         console.log('Microsoft translation successful:', {
            original: text,
            translated: translatedText,
         });
         return translatedText;
      } else {
         throw new Error('Invalid response format from Microsoft Translator');
      }
   } catch (error) {
      console.error('Microsoft Translator Error Details:', {
         message: error.message,
         status: error.response?.status,
         statusText: error.response?.statusText,
         data: error.response?.data,
         headers: error.response?.headers,
      });

      // Handle specific error cases
      if (error.response?.status === 401) {
         throw new Error(
            'Microsoft Translator authentication failed. Please check your subscription key and region.'
         );
      } else if (error.response?.status === 403) {
         throw new Error(
            'Microsoft Translator access forbidden. You may not be subscribed to this API or have exceeded your quota.'
         );
      } else if (error.response?.status === 429) {
         throw new Error(
            'Microsoft Translator rate limit exceeded. Please try again later.'
         );
      } else {
         throw new Error(`Microsoft translation failed: ${error.message}`);
      }
   }
}

// Helper function to generate trace ID for debugging
function generateTraceId() {
   return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
   });
}

// Test function
async function testMicrosoftTranslator() {
   try {
      console.log('Testing Microsoft Translator...');
      const result = await translateWithMicrosoft('Hello, how are you?', 'ig');
      console.log('Test successful:', result);
      return result;
   } catch (error) {
      console.error('Test failed:', error.message);
      throw error;
   }
}

module.exports = {
   translateWithMicrosoft,
   testMicrosoftTranslator,
};
