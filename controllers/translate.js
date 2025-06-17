const axios = require('axios');
const Translation = require('../models/Translation');
const auth = require('../middleware/auth');

// Google Translate API function
const translateWithGoogle = async (text, toLanguage = 'fr') => {
   const options = {
      method: 'POST',
      url: 'https://google-api31.p.rapidapi.com/gtranslate',
      headers: {
         'x-rapidapi-key': process.env.RAPIDAPI_KEY,
         'x-rapidapi-host': 'google-api31.p.rapidapi.com',
         'Content-Type': 'application/json',
      },
      data: {
         text,
         to: toLanguage,
         from_lang: '',
      },
   };

   try {
      const response = await axios.request(options);
      console.log(response.data);
      return response.data.translated_text;
   } catch (error) {
      console.error('Google Translate API error:', error);
      throw new Error('Translation failed');
   }
};

const translateText = async (req, res) => {
   const { text } = req.body;
   if (!text) {
      return res.status(400).json({ error: 'Text is required' });
   }

   try {
      // Check database first
      let existing = await Translation.findOne({
         englishText: new RegExp(`^${text.trim()}$`, 'i'),
      });

      if (existing) {
         return res.json({
            englishText: text,
            igboText: existing.igboText,
            source: 'database',
         });
      }

      // Translate using Google Translate API
      const translated = await translateWithGoogle(text, 'ig');

      console.log('Translated text:', translated);

      // Save new translation to database
      const newTranslation = new Translation({
         englishText: text.trim(),
         igboText: translated,
         //  createdBy: req.user._id,
      });
      await newTranslation.save();

      res.status(200).json({
         englishText: text,
         igboText: translated,
         source: 'api',
      });
   } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Translation failed' });
   }
};

module.exports = {
   translateText,
   // Add other exports as needed, e.g., batch translation
};
