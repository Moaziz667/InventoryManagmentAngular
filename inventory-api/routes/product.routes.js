const express = require('express');
const { db, generateId } = require('../data/database');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Helper function to map product for API response
const mapProductForResponse = (product) => ({
  ...product,
  imageUrl: product.image || null,
  minStock: product.minStock || 10 // Default minStock
});

// GET all products
router.get('/', (req, res) => {
  try {
    const { category, stockStatus, search } = req.query;
    let products = [...db.products];
    
    // Filter by category
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    
    // Filter by stock status
    if (stockStatus && stockStatus !== 'all') {
      products = products.filter(p => {
        if (stockStatus === 'critical') return p.quantity <= 5;
        if (stockStatus === 'low') return p.quantity > 5 && p.quantity <= 15;
        if (stockStatus === 'sufficient') return p.quantity > 15;
        return true;
      });
    }
    
    // Search by name or SKU
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({ products: products.map(mapProductForResponse) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products', message: error.message });
  }
});

// GET single product by ID
router.get('/:id', (req, res) => {
  try {
    const product = db.products.find(p => p.id === req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product: mapProductForResponse(product) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product', message: error.message });
  }
});

// POST create new product
router.post('/', (req, res) => {
  try {
    const { name, category, sku, quantity, price, supplier, notes, imageUrl } = req.body;
    
    // Validation
    if (!name || !category || !sku || quantity === undefined || price === undefined || !supplier) {
      return res.status(400).json({ error: 'Required fields: name, category, sku, quantity, price, supplier' });
    }
    
    // Check for duplicate SKU
    const existingSku = db.products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
    if (existingSku) {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    
    const newProduct = {
      id: generateId(),
      name,
      category,
      sku,
      quantity: Number(quantity),
      price: Number(price),
      supplier,
      notes: notes || null,
      image: imageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add new product at beginning so newest products appear first
    db.products.unshift(newProduct);
    
    // Add to stock history
    db.stockHistory.unshift({
      id: generateId(),
      productId: newProduct.id,
      productName: newProduct.name,
      previousQuantity: 0,
      newQuantity: newProduct.quantity,
      changeAmount: newProduct.quantity,
      changeType: 'set',
      timestamp: new Date(),
      notes: 'Initial stock',
      userId: req.user.id
    });
    
    res.status(201).json({
      message: 'Product created successfully',
      product: mapProductForResponse(newProduct)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product', message: error.message });
  }
});

// PUT update product
router.put('/:id', (req, res) => {
  try {
    const productIndex = db.products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const existingProduct = db.products[productIndex];
    const { name, category, sku, quantity, price, supplier, notes, imageUrl } = req.body;
    
    // Check for duplicate SKU (excluding current product)
    if (sku && sku !== existingProduct.sku) {
      const duplicateSku = db.products.find(p => p.sku.toLowerCase() === sku.toLowerCase() && p.id !== req.params.id);
      if (duplicateSku) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }
    
    // Track quantity changes
    const oldQuantity = existingProduct.quantity;
    const newQuantity = quantity !== undefined ? Number(quantity) : oldQuantity;
    
    // Update product
    const updatedProduct = {
      ...existingProduct,
      name: name || existingProduct.name,
      category: category || existingProduct.category,
      sku: sku || existingProduct.sku,
      quantity: newQuantity,
      price: price !== undefined ? Number(price) : existingProduct.price,
      supplier: supplier || existingProduct.supplier,
      notes: notes !== undefined ? notes : existingProduct.notes,
      image: imageUrl !== undefined ? imageUrl : existingProduct.image,
      updatedAt: new Date()
    };
    
    db.products[productIndex] = updatedProduct;
    
    // Add to stock history if quantity changed
    if (oldQuantity !== newQuantity) {
      const changeType = newQuantity > oldQuantity ? 'increase' : 'decrease';
      
      db.stockHistory.unshift({
        id: generateId(),
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        previousQuantity: oldQuantity,
        newQuantity: newQuantity,
        changeAmount: Math.abs(newQuantity - oldQuantity),
        changeType,
        timestamp: new Date(),
        notes: req.body.historyNote || null,
        userId: req.user.id
      });
    }
    
    res.json({
      message: 'Product updated successfully',
      product: mapProductForResponse(updatedProduct)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product', message: error.message });
  }
});

// DELETE product
router.delete('/:id', (req, res) => {
  try {
    const productIndex = db.products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const deletedProduct = db.products.splice(productIndex, 1)[0];
    
    res.json({
      message: 'Product deleted successfully',
      product: mapProductForResponse(deletedProduct)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product', message: error.message });
  }
});

// GET product categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Office Supplies',
    'Furniture',
    'Tools & Hardware',
    'Health & Beauty',
    'Sports & Outdoors',
    'Other'
  ];
  res.json(categories);
});

module.exports = router;
