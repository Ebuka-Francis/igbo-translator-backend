const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema(
   {
      englishText: {
         type: String,
         required: true,
         trim: true,
      },
      igboText: {
         type: String,
         required: true,
         trim: true,
      },
      category: {
         type: String,
         default: 'general',
      },
      verified: {
         type: Boolean,
         default: false,
      },
      createdBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
      },
      usage_count: {
         type: Number,
         default: 0,
      },
   },
   {
      timestamps: true,
   }
);

//index for faster search
TranslationSchema.index({ englishText: 'text', igboText: 'text' });
module.exports = mongoose.model('Translation', TranslationSchema);
