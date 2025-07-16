// // middleware/auth.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// module.exports = async (req, res, next) => {
//    try {
//       const token = req.header('Authorization')?.replace('Bearer ', '');

//       if (!token) {
//          return res
//             .status(401)
//             .json({ error: 'No token, authorization denied' });
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id).select('-password');

//       if (!user) {
//          return res.status(401).json({ error: 'Token is not valid' });
//       }

//       req.user = user;
//       next();
//    } catch (error) {
//       res.status(401).json({ error: 'Token is not valid' });
//    }
// };

// middleware/auth.js
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isTokenBlacklisted } = require('../routes/auth');

const auth = async (req, res, next) => {
   try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
         return res
            .status(401)
            .json({ error: 'No token, authorization denied' });
      }

      // Check if token is blacklisted
      if (isTokenBlacklisted(token)) {
         return res.status(401).json({ error: 'Token has been invalidated' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
         return res.status(401).json({ error: 'Token is not valid' });
      }

      req.user = user;
      next();
   } catch (error) {
      res.status(401).json({ error: 'Token is not valid' });
   }
};

module.exports = auth;
