const express = require('express');
const { db } = require('../data/database');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET all stock history
router.get('/', (req, res) => {
  try {
    const { productId, changeType, limit, offset } = req.query;
    let history = [...db.stockHistory];
    
    // Filter by product ID
    if (productId) {
      history = history.filter(h => h.productId === productId);
    }
    
    // Filter by change type
    if (changeType && changeType !== 'all') {
      history = history.filter(h => h.changeType === changeType);
    }
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    const total = history.length;
    const startIndex = offset ? parseInt(offset) : 0;
    const endIndex = limit ? startIndex + parseInt(limit) : history.length;
    const paginatedHistory = history.slice(startIndex, endIndex);
    
    res.json({
      data: paginatedHistory,
      total,
      offset: startIndex,
      limit: limit ? parseInt(limit) : total
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history', message: error.message });
  }
});

// GET stock history for a specific product
router.get('/product/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = db.products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const history = db.stockHistory
      .filter(h => h.productId === productId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku
      },
      history
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product history', message: error.message });
  }
});

// GET stock history summary/stats
router.get('/stats/summary', (req, res) => {
  try {
    const history = db.stockHistory;
    const products = db.products;
    
    // Calculate stats
    const totalChanges = history.length;
    const increases = history.filter(h => h.changeType === 'increase').length;
    const decreases = history.filter(h => h.changeType === 'decrease').length;
    
    // Products with most changes
    const productChangeCounts = {};
    history.forEach(h => {
      productChangeCounts[h.productId] = (productChangeCounts[h.productId] || 0) + 1;
    });
    
    const mostActiveProducts = Object.entries(productChangeCounts)
      .map(([productId, count]) => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          productName: product?.name || 'Unknown',
          changeCount: count
        };
      })
      .sort((a, b) => b.changeCount - a.changeCount)
      .slice(0, 5);
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentChanges = history.filter(h => new Date(h.timestamp) >= sevenDaysAgo).length;
    
    res.json({
      totalChanges,
      increases,
      decreases,
      recentChanges,
      mostActiveProducts
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
  }
});

module.exports = router;
