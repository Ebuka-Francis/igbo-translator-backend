const handelBatch = async (req, res) => {
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
};

module.exports = {
   handelBatch,
};
