const express = require('express');
const axios = require('axios');
const Translation = require('../models/Translation');
const auth = require('../middleware/auth');

const router = express.Router();

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
      // return response.data.data.translations[0].translatedText;
   } catch (error) {
      console.error('Google Translate API error:', error);
      throw new Error('Translation failed');
   }
};

router.post('/', async (req, res) => {
   try {
      const { text } = req.body;
      if (!text || text.trim() === '') {
         return res.status(400).json({ error: 'Text is required' });
      }

      let existingTranslation = await Translation.findOne({
         englishText: new RegExp(`^${text.trim()}$`, 'i'),
      });
      if (existingTranslation) {
         existingTranslation.usage_count += 1;
         await existingTranslation.save();

         return res.json({
            englishText: text,
            igboText: existingTranslation.igboText,
            source: 'database',
            verified: existingTranslation.verified,
         });
      }

      //if not in database, use Google Translate API
      const translatedText = await translateWithGoogle(text, 'es');

      // save new translation to database
      const newTranslation = new Translation({
         englishText: text.trim(),
         igboText: translatedText,
         usage_count: 1,
      });
      await newTranslation.save();

      res.json({
         englishText: text,
         igboText: translatedText,
         source: 'google',
         verified: false,
      });
   } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Translation failed' });
   }
});

router.post('/batch', auth, async (req, res) => {
   try {
      const { texts } = req.body;
      if (!Array.isArray(texts)) {
         return res.status(400).json({ error: 'Texts must be an array' });
      }
      const translations = [];

      for (const text of texts) {
         try {
            //check database first
            let existing = await Translation.findOne({
               englishText: new RegExp(`^${text.trim()}$`, 'i'),
            });
            if (existing) {
               translations.push({
                  englishText: text,
                  igboText: existing.igboText,
                  source: 'database',
               });
            } else {
               const translated = await translateWithGoogle(text, 'es');

               // save new database
               const newTranslation = new Translation({
                  englishText: text.trim(),
                  igboText: translated,
                  createdBy: req.user._id,
               });
               await newTranslation.save();

               translations.push({
                  englishText: text,
                  igboText: translated,
                  source: 'api',
               });
            }
         } catch (error) {
            translations.push({
               englishText: text,
               igboText: text, // Fallback to original
               source: 'error',
               error: error.message,
            });
         }
      }
      res.json({ translations });
   } catch (error) {
      console.error('Batch translation error:', error);
      res.status(500).json({ error: 'Batch translation failed' });
   }
});

const testTranslation = async () => {
   try {
      const result = await translateWithGoogle('How are you', 'ig');
      console.log('Translation result:', result);
   } catch (error) {
      console.error('Test failed:', error);
   }
};
// Call the test function
testTranslation();

module.exports = router;
