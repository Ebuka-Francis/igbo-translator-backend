const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const router = require('./routes/translate');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOption = {
   origin: [
      'https://ebuka-francis-translation.vercel.app',
      /^https?:\/\/localhost(:\d+)?$/,
   ],
};

// Middleware
app.use(cors(corsOption));
app.use(express.json());

// Database connection
mongoose.connect(
   process.env.MONGODB_URI || 'mongodb://localhost:27017/igbo-translator'
);

//Routes
// app.use('/api/translate', require('./routes/translate'));
// app.use('api/auth', require('./routes/auth'));
app.use(router);
app.use('/api/auth', authRouter);
// app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
   res.json({ message: 'Igbo Translator API is running' });
});

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
