// routes/dictionary.js
const express = require('express');
const Translation = require('../models/Translation');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all translations (with pagination)
router.get('/', async (req, res) => {
   try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search || '';

      const query = search
         ? {
              $or: [
                 { englishText: new RegExp(search, 'i') },
                 { igboText: new RegExp(search, 'i') },
              ],
           }
         : {};

      const translations = await Translation.find(query)
         .sort({ usage_count: -1, createdAt: -1 })
         .limit(limit * 1)
         .skip((page - 1) * limit)
         .populate('createdBy', 'name');

      const total = await Translation.countDocuments(query);

      res.json({
         translations,
         totalPages: Math.ceil(total / limit),
         currentPage: page,
         total,
      });
   } catch (error) {
      res.status(500).json({ error: 'Failed to fetch translations' });
   }
});

// Add new translation (admin only)
router.post('/', auth, async (req, res) => {
   try {
      const { englishText, igboText, category } = req.body;

      // Check if translation already exists
      const existing = await Translation.findOne({
         englishText: new RegExp(`^${englishText.trim()}$`, 'i'),
      });

      if (existing) {
         return res.status(400).json({ error: 'Translation already exists' });
      }

      const translation = new Translation({
         englishText: englishText.trim(),
         igboText: igboText.trim(),
         category: category || 'general',
         createdBy: req.user.id,
         verified: req.user.role === 'admin',
      });

      await translation.save();
      res.status(201).json(translation);
   } catch (error) {
      res.status(500).json({ error: 'Failed to add translation' });
   }
});

module.exports = router;
