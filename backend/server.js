const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'inventory_secret_key_2024';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db';

app.use(cors());
app.use(express.json());

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A név megadása kötelező'],
    trim: true,
    minlength: [3, 'A névnek legalább 3 karakter hosszúnak kell lennie']
  },
  password: {
    type: String,
    required: [true, 'A jelszó megadása kötelező'],
    minlength: [6, 'A jelszónak legalább 6 karakter hosszúnak kell lennie']
  },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A termék neve kötelező'],
    trim: true,
    minlength: [2, 'A névnek legalább 2 karakter hosszúnak kell lennie']
  },
  description: {
    type: String,
    required: [true, 'A leírás kötelező'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Az ár megadása kötelező'],
    min: [0, 'Az ár nem lehet negatív']
  },
  quantity: {
    type: Number,
    required: [true, 'A mennyiség megadása kötelező'],
    min: [0, 'A mennyiség nem lehet negatív'],
    validate: {
      validator: Number.isInteger,
      message: 'A mennyiségnek egész számnak kell lennie'
    }
  },
  category: {
    type: String,
    required: [true, 'A kategória megadása kötelező'],
    trim: true
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Nincs érvényes token, hozzáférés megtagadva' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Érvénytelen token' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: 'A név és jelszó megadása kötelező' });
    }

    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: 'Ez a felhasználónév már foglalt' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'Sikeres regisztráció',
      token,
      user: { id: user._id, name: user.name }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Szerverhiba' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: 'A név és jelszó megadása kötelező' });
    }

    const user = await User.findOne({ name });
    if (!user) {
      return res.status(401).json({ message: 'Helytelen felhasználónév vagy jelszó' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Helytelen felhasználónév vagy jelszó' });
    }

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Sikeres bejelentkezés',
      token,
      user: { id: user._id, name: user.name }
    });
  } catch (err) {
    res.status(500).json({ message: 'Szerverhiba' });
  }
});

app.get('/api/products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Szerverhiba' });
  }
});

app.get('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'A termék nem található' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Szerverhiba' });
  }
});

app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;
    const product = new Product({ name, description, price, quantity, category });
    await product.save();
    res.status(201).json({ message: 'Termék sikeresen hozzáadva', product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Szerverhiba' });
  }
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'A termék nem található' });
    }
    res.json({ message: 'Termék sikeresen frissítve', product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Szerverhiba' });
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'A termék nem található' });
    }
    res.json({ message: 'Termék sikeresen törölve' });
  } catch (err) {
    res.status(500).json({ message: 'Szerverhiba' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Szerver: http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB hiba:', err.message);
    app.listen(PORT, () => console.log(`Szerver (DB nélkül): http://localhost:${PORT}`));
  });

module.exports = app;
