const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Generate hash synchronously for default admin
const adminPasswordHash = bcrypt.hashSync('admin123', 10);

// Product images from Unsplash (free to use)
const productImages = {
  electronics: [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop', // keyboard
    'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&h=300&fit=crop', // usb hub
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop', // mouse
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop', // webcam
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', // lamp
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', // headphones
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&h=300&fit=crop', // monitor
  ],
  furniture: [
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=300&fit=crop', // chair
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop', // desk
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', // sofa
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop', // shelf
  ],
  office: [
    'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=300&fit=crop', // paper
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=300&fit=crop', // notebook
    'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=300&fit=crop', // pens
    'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&h=300&fit=crop', // stapler
  ],
  tools: [
    'https://images.unsplash.com/photo-1581147036324-c17ac41f3e8b?w=400&h=300&fit=crop', // tools
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop', // toolbox
  ]
};

// In-memory database (replace with real DB like MongoDB, PostgreSQL, etc.)
const db = {
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@inventory.com',
      password: adminPasswordHash,
      role: 'admin',
      createdAt: new Date('2024-01-01')
    }
  ],
  
  products: [
    {
      id: '1',
      name: 'Wireless Mechanical Keyboard',
      category: 'Electronics',
      sku: 'EL-KB-001',
      quantity: 45,
      price: 89.99,
      supplier: 'TechSupplies Inc.',
      notes: 'RGB backlight, Cherry MX switches',
      image: productImages.electronics[0],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-20')
    },
    {
      id: '2',
      name: 'USB-C Hub 7-in-1',
      category: 'Electronics',
      sku: 'EL-HB-002',
      quantity: 3,
      price: 49.99,
      supplier: 'TechSupplies Inc.',
      notes: 'CRITICAL - Reorder immediately!',
      image: productImages.electronics[1],
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-11-25')
    },
    {
      id: '3',
      name: 'Ergonomic Office Chair Pro',
      category: 'Furniture',
      sku: 'FN-CH-001',
      quantity: 12,
      price: 349.99,
      supplier: 'ComfortSeating Ltd.',
      notes: 'Lumbar support, mesh back, adjustable arms',
      image: productImages.furniture[0],
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-11-15')
    },
    {
      id: '4',
      name: 'Premium A4 Copy Paper',
      category: 'Office Supplies',
      sku: 'OS-PP-001',
      quantity: 150,
      price: 12.99,
      supplier: 'PaperWorld',
      notes: '500 sheets, 80gsm, bright white',
      image: productImages.office[0],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-11-10')
    },
    {
      id: '5',
      name: 'Electric Standing Desk',
      category: 'Furniture',
      sku: 'FN-DK-002',
      quantity: 8,
      price: 459.99,
      supplier: 'ComfortSeating Ltd.',
      notes: 'Memory presets, 70" width',
      image: productImages.furniture[1],
      createdAt: new Date('2024-04-12'),
      updatedAt: new Date('2024-11-22')
    },
    {
      id: '6',
      name: 'Wireless Ergonomic Mouse',
      category: 'Electronics',
      sku: 'EL-MS-001',
      quantity: 67,
      price: 39.99,
      supplier: 'TechSupplies Inc.',
      notes: 'Silent click, 4000 DPI',
      image: productImages.electronics[2],
      createdAt: new Date('2024-02-28'),
      updatedAt: new Date('2024-11-18')
    },
    {
      id: '7',
      name: 'Dual Monitor Arm Stand',
      category: 'Furniture',
      sku: 'FN-MS-001',
      quantity: 25,
      price: 79.99,
      supplier: 'ComfortSeating Ltd.',
      notes: 'Supports up to 32" monitors',
      image: productImages.furniture[3],
      createdAt: new Date('2024-05-15'),
      updatedAt: new Date('2024-11-12')
    },
    {
      id: '8',
      name: 'Premium Ballpoint Pens',
      category: 'Office Supplies',
      sku: 'OS-PN-001',
      quantity: 2,
      price: 15.99,
      supplier: 'PaperWorld',
      notes: 'CRITICAL - Box of 50, blue ink',
      image: productImages.office[2],
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-11-26')
    },
    {
      id: '9',
      name: 'LED Desk Lamp with Wireless Charger',
      category: 'Electronics',
      sku: 'EL-LP-001',
      quantity: 18,
      price: 59.99,
      supplier: 'TechSupplies Inc.',
      notes: '5 brightness levels, USB port',
      image: productImages.electronics[4],
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-11-08')
    },
    {
      id: '10',
      name: 'Manila File Folders',
      category: 'Office Supplies',
      sku: 'OS-FF-001',
      quantity: 35,
      price: 18.99,
      supplier: 'PaperWorld',
      notes: 'Pack of 100, letter size',
      image: productImages.office[1],
      createdAt: new Date('2024-04-25'),
      updatedAt: new Date('2024-11-14')
    },
    {
      id: '11',
      name: 'HD Webcam 1080p with Mic',
      category: 'Electronics',
      sku: 'EL-WC-001',
      quantity: 5,
      price: 79.99,
      supplier: 'TechSupplies Inc.',
      notes: 'Auto-focus, noise cancelling mic',
      image: productImages.electronics[3],
      createdAt: new Date('2024-07-10'),
      updatedAt: new Date('2024-11-24')
    },
    {
      id: '12',
      name: 'Magnetic Whiteboard 4x3 ft',
      category: 'Office Supplies',
      sku: 'OS-WB-001',
      quantity: 10,
      price: 89.99,
      supplier: 'OfficeMax',
      notes: 'Includes markers and eraser',
      image: productImages.office[3],
      createdAt: new Date('2024-08-05'),
      updatedAt: new Date('2024-11-05')
    },
    {
      id: '13',
      name: 'Noise Cancelling Headphones',
      category: 'Electronics',
      sku: 'EL-HP-001',
      quantity: 22,
      price: 199.99,
      supplier: 'TechSupplies Inc.',
      notes: '30hr battery, Bluetooth 5.0',
      image: productImages.electronics[5],
      createdAt: new Date('2024-08-15'),
      updatedAt: new Date('2024-11-20')
    },
    {
      id: '14',
      name: '27" 4K Monitor',
      category: 'Electronics',
      sku: 'EL-MN-001',
      quantity: 14,
      price: 449.99,
      supplier: 'TechSupplies Inc.',
      notes: 'IPS panel, USB-C connectivity',
      image: productImages.electronics[6],
      createdAt: new Date('2024-09-01'),
      updatedAt: new Date('2024-11-18')
    },
    {
      id: '15',
      name: 'Executive Leather Chair',
      category: 'Furniture',
      sku: 'FN-CH-002',
      quantity: 6,
      price: 599.99,
      supplier: 'ComfortSeating Ltd.',
      notes: 'Genuine leather, high back',
      image: productImages.furniture[2],
      createdAt: new Date('2024-09-10'),
      updatedAt: new Date('2024-11-12')
    },
    {
      id: '16',
      name: 'Professional Tool Kit',
      category: 'Tools & Hardware',
      sku: 'TL-KT-001',
      quantity: 30,
      price: 129.99,
      supplier: 'BuildRight Tools',
      notes: '150 pieces, lifetime warranty',
      image: productImages.tools[0],
      createdAt: new Date('2024-09-20'),
      updatedAt: new Date('2024-11-08')
    },
    {
      id: '17',
      name: 'Heavy Duty Toolbox',
      category: 'Tools & Hardware',
      sku: 'TL-BX-001',
      quantity: 4,
      price: 89.99,
      supplier: 'BuildRight Tools',
      notes: 'LOW STOCK - Water resistant',
      image: productImages.tools[1],
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date('2024-11-22')
    },
    {
      id: '18',
      name: 'Spiral Notebooks (12 Pack)',
      category: 'Office Supplies',
      sku: 'OS-NB-001',
      quantity: 85,
      price: 24.99,
      supplier: 'PaperWorld',
      notes: 'College ruled, 70 sheets each',
      image: productImages.office[1],
      createdAt: new Date('2024-10-10'),
      updatedAt: new Date('2024-11-15')
    },
    {
      id: '19',
      name: 'Wireless Presenter Remote',
      category: 'Electronics',
      sku: 'EL-PR-001',
      quantity: 40,
      price: 34.99,
      supplier: 'TechSupplies Inc.',
      notes: 'Laser pointer, 100ft range',
      image: productImages.electronics[1],
      createdAt: new Date('2024-10-20'),
      updatedAt: new Date('2024-11-10')
    },
    {
      id: '20',
      name: 'Desktop Organizer Set',
      category: 'Office Supplies',
      sku: 'OS-OR-001',
      quantity: 55,
      price: 32.99,
      supplier: 'OfficeMax',
      notes: 'Mesh design, 6 compartments',
      image: productImages.office[3],
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-25')
    }
  ],
  
  stockHistory: [
    {
      id: 'h1',
      productId: '2',
      productName: 'USB-C Hub 7-in-1',
      previousQuantity: 15,
      newQuantity: 3,
      changeAmount: 12,
      changeType: 'decrease',
      timestamp: new Date('2024-11-25'),
      notes: 'Large corporate order fulfilled',
      userId: '1'
    },
    {
      id: 'h2',
      productId: '1',
      productName: 'Wireless Mechanical Keyboard',
      previousQuantity: 30,
      newQuantity: 45,
      changeAmount: 15,
      changeType: 'increase',
      timestamp: new Date('2024-11-20'),
      notes: 'Restocked from supplier',
      userId: '1'
    },
    {
      id: 'h3',
      productId: '8',
      productName: 'Premium Ballpoint Pens',
      previousQuantity: 20,
      newQuantity: 2,
      changeAmount: 18,
      changeType: 'decrease',
      timestamp: new Date('2024-11-26'),
      notes: 'Monthly office supply distribution',
      userId: '1'
    },
    {
      id: 'h4',
      productId: '3',
      productName: 'Ergonomic Office Chair Pro',
      previousQuantity: 8,
      newQuantity: 12,
      changeAmount: 4,
      changeType: 'increase',
      timestamp: new Date('2024-11-15'),
      notes: 'New shipment received',
      userId: '1'
    },
    {
      id: 'h5',
      productId: '11',
      productName: 'HD Webcam 1080p with Mic',
      previousQuantity: 12,
      newQuantity: 5,
      changeAmount: 7,
      changeType: 'decrease',
      timestamp: new Date('2024-11-24'),
      notes: 'Remote work equipment order',
      userId: '1'
    },
    {
      id: 'h6',
      productId: '14',
      productName: '27" 4K Monitor',
      previousQuantity: 20,
      newQuantity: 14,
      changeAmount: 6,
      changeType: 'decrease',
      timestamp: new Date('2024-11-18'),
      notes: 'Office upgrade project',
      userId: '1'
    },
    {
      id: 'h7',
      productId: '17',
      productName: 'Heavy Duty Toolbox',
      previousQuantity: 15,
      newQuantity: 4,
      changeAmount: 11,
      changeType: 'decrease',
      timestamp: new Date('2024-11-22'),
      notes: 'Maintenance team order',
      userId: '1'
    },
    {
      id: 'h8',
      productId: '6',
      productName: 'Wireless Ergonomic Mouse',
      previousQuantity: 50,
      newQuantity: 67,
      changeAmount: 17,
      changeType: 'increase',
      timestamp: new Date('2024-11-18'),
      notes: 'Bulk order from supplier',
      userId: '1'
    }
  ]
};

// Helper functions
const generateId = () => uuidv4();

module.exports = { db, generateId };
