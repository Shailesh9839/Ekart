const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('[SQLite DB] Connected to database at:', dbPath);
  }
});

// Promise wrappers for sqlite queries
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Seed Products if table is empty
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "AeroSound Pro Headphones",
    category: "Electronics",
    price: 249.99,
    rating: 4.8,
    reviewsCount: 124,
    discount: 15,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    description: "Experience premium sound with our advanced hybrid active noise cancelling technology. Soft memory foam ear cups and a lightweight headband provide long-lasting comfort, while smart sensors automatically pause your music when headphones are taken off.",
    specs: JSON.stringify({
      "Battery Life": "Up to 40 Hours",
      "Bluetooth Version": "5.2 LE",
      "Noise Cancellation": "Active Hybrid (ANC)",
      "Charging Port": "USB-C Fast Charge",
      "Weight": "250g"
    }),
    inStock: 8
  },
  {
    id: 2,
    name: "VeloTime Smart Watch S3",
    category: "Electronics",
    price: 189.99,
    rating: 4.6,
    reviewsCount: 98,
    discount: 0,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    description: "Stay connected, active, and healthy. Features a high-definition AMOLED always-on display, 24/7 heart rate monitoring, advanced sleep analysis, GPS tracking, and a premium waterproof metal body with interchangeable fluoroelastomer straps.",
    specs: JSON.stringify({
      "Display": "1.43-inch AMOLED",
      "Water Resistance": "5 ATM / 50m",
      "Battery Life": "Up to 10 Days",
      "Sensors": "Heart Rate, SpO2, Accelerometer, Gyroscope"
    }),
    inStock: 12
  },
  {
    id: 3,
    name: "KeyCraft Mechanical Keyboard",
    category: "Electronics",
    price: 129.99,
    rating: 4.9,
    reviewsCount: 76,
    discount: 10,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    description: "A compact 75% hot-swappable mechanical keyboard designed for coders and creators. Features premium tactile brown switches, double-shot PBT keycaps, customized sound-dampening foam layers, and stunning RGB backlighting with multiple dynamic modes.",
    specs: JSON.stringify({
      "Form Factor": "75% Compact Layout",
      "Switch Type": "Hot-swappable Tactile Brown",
      "Keycaps": "Double-shot PBT Cherry Profile",
      "Connectivity": "USB-C, 2.4Ghz Wireless, Bluetooth 5.0"
    }),
    inStock: 5
  },
  {
    id: 4,
    name: "Urban Knit Oversized Hoodie",
    category: "Fashion",
    price: 79.99,
    rating: 4.5,
    reviewsCount: 142,
    discount: 20,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80",
    description: "An ultra-soft heavy fleece hoodie featuring a relaxed dropped-shoulder silhouette, premium embroidered front detailing, double-lined spacious hood, and ribbed cuffs. Designed to stay plush and vibrant wash after wash.",
    specs: JSON.stringify({
      "Material": "80% Organic Cotton, 20% Recycled Polyester",
      "Fit": "Relaxed Oversized Silhouette",
      "Weight": "450 GSM Heavyweight Fleece",
      "Care Instructions": "Machine wash cold, lay flat to dry"
    }),
    inStock: 15
  },
  {
    id: 5,
    name: "Heritage Leather Jacket",
    category: "Fashion",
    price: 299.99,
    rating: 4.7,
    reviewsCount: 64,
    discount: 0,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    description: "A timeless masterpiece crafted from top-grain buttery soft lambskin leather. Features customized antique silver zippers, quilted shoulder panels, adjustable waist side tabs, and a sleek silky lining. The jacket matures and develops a unique character over time.",
    specs: JSON.stringify({
      "Shell Material": "100% Top-grain Lambskin Leather",
      "Lining Material": "100% Premium Satin Polyester",
      "Hardware": "Heavy-duty YKK Zippers",
      "Pockets": "3 Exterior Zip, 2 Interior Slip"
    }),
    inStock: 3
  },
  {
    id: 6,
    name: "Nimbus Cushion Runner Sneakers",
    category: "Fashion",
    price: 119.99,
    rating: 4.4,
    reviewsCount: 188,
    discount: 5,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    description: "Step onto the clouds. Engineered with breathable engineered knit uppers, responsive nitrogen-infused foam midsoles, and high-abrasion slip-resistant rubber outsoles. Delivers unmatched bounce and joint protection for running or daily commutes.",
    specs: JSON.stringify({
      "Upper": "Engineered Breathable Mesh",
      "Midsole": "Supercritical Nitrogen-infused Foam",
      "Outsole": "Duragrip Rubber",
      "Drop": "8mm Heel-to-Toe Drop"
    }),
    inStock: 20
  },
  {
    id: 7,
    name: "Aura Ceramic Vase Set",
    category: "Home Decor",
    price: 49.99,
    rating: 4.7,
    reviewsCount: 53,
    discount: 0,
    image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format&fit=crop&q=80",
    description: "A trio of hand-finished ribbed ceramic vases with a modern matte sandy-textured glaze. Featuring diverse shapes, they look exquisite styled together with dried pampas grass, fresh stems, or displayed alone as minimal sculptural objects.",
    specs: JSON.stringify({
      "Material": "100% Hand-crafted Stoneware Ceramic",
      "Finish": "Sand-textured Matte Glaze",
      "Vase heights": "Small (12cm), Medium (18cm), Large (24cm)",
      "Waterproof": "Yes, completely glazed inside"
    }),
    inStock: 14
  },
  {
    id: 8,
    name: "Lunar Brass Desk Lamp",
    category: "Home Decor",
    price: 89.99,
    rating: 4.8,
    reviewsCount: 45,
    discount: 15,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    description: "Illuminate your desk with mid-century elegance. Made with a heavy marble circular base, solid brass rotating arm, and a beautiful frosted opal glass spherical shade that diffuses light softly to reduce eye fatigue.",
    specs: JSON.stringify({
      "Base Material": "Genuine White Carrara Marble",
      "Structure Material": "Polished Solid Brass",
      "Shade": "Frosted Opal Glass",
      "Bulb Included": "G9 LED bulb, 3000K Warm White"
    }),
    inStock: 6
  },
  {
    id: 9,
    name: "Amber Santal Scented Candle",
    category: "Home Decor",
    price: 24.99,
    rating: 4.6,
    reviewsCount: 112,
    discount: 0,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80",
    description: "Fill your sanctuary with cozy, rich notes of sandalwood, glowing warm amber, spicy cardamom, and fresh leather. Hand-poured in a dark amber glass jar with a premium crackling wooden wick that burns slowly and evenly.",
    specs: JSON.stringify({
      "Wax Blend": "100% Natural Organic Soy Wax",
      "Burn Time": "Approximately 55-60 Hours",
      "Wick Type": "Single Sustainable Wooden Crackle Wick",
      "Fragrance Notes": "Sandalwood, Amber, Cardamom, Leather, Musk"
    }),
    inStock: 30
  },
  {
    id: 10,
    name: "Apex 40L Waterproof Backpack",
    category: "Outdoor",
    price: 139.99,
    rating: 4.9,
    reviewsCount: 84,
    discount: 10,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    description: "Engineered for rugged environments. Crafted from military-grade high-density ripstop nylon with waterproof TPU coatings, heat-sealed seams, roll-top closure, and ergonomic padded harness straps. Includes a dedicated padded compartment for a 16-inch laptop.",
    specs: JSON.stringify({
      "Capacity": "40 Liters",
      "Material": "1000D Cordura Ripstop Nylon with TPU Coated Backing",
      "Waterproofing Class": "IPX6 (Resists high-pressure heavy spray)",
      "Laptop Sleeve": "Fits up to 16\" MacBook Pro"
    }),
    inStock: 9
  },
  {
    id: 11,
    name: "Summit Dome 3-Person Tent",
    category: "Outdoor",
    price: 219.99,
    rating: 4.7,
    reviewsCount: 39,
    discount: 0,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80",
    description: "A lightweight, double-walled 3-season tent that pitches in under 5 minutes. Features ultra-strong aviation aluminium poles, waterproof rainfly with fully taped seams, dual entry doors, vestibules, and mesh micro-windows for excellent ventilation.",
    specs: JSON.stringify({
      "Capacity": "3 Adults",
      "Packed Weight": "2.8 kg",
      "Rainfly Material": "20D Ripstop Nylon, 3000mm Polyurethane waterproof rating",
      "Poles": "DAC Featherlite Aviation Aluminium"
    }),
    inStock: 4
  },
  {
    id: 12,
    name: "ThermaFlow Vacuum Flask",
    category: "Outdoor",
    price: 34.99,
    rating: 4.8,
    reviewsCount: 165,
    discount: 10,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
    description: "Keep hydration at the perfect temperature. Double-walled vacuum insulation keeps drinks ice cold for up to 24 hours, or piping hot for up to 12 hours. Sleek sweat-free powder coat finish with a leakproof insulated flex lid.",
    specs: JSON.stringify({
      "Capacity": "950ml (32 oz)",
      "Material": "Professional-grade 18/8 Stainless Steel",
      "Insulation": "TempShield Double-wall Vacuum",
      "BPA Free": "Yes, absolutely"
    }),
    inStock: 25
  }
];

const INITIAL_ORDERS = {
  "VIBE-87421": { status: "Out for Delivery", date: "June 13, 2026", courier: "FedEx Express", history: ["Order received (June 10)", "Processed at sorting center (June 11)", "Departed facility (June 12)", "Out for delivery today (June 13)"] },
  "VIBE-39201": { status: "Delivered", date: "June 08, 2026", courier: "UPS", history: ["Order received (June 05)", "Shipped (June 06)", "Delivered (June 08)"] },
  "VIBE-10842": { status: "Processing", date: "June 12, 2026", courier: "DHL", history: ["Order received (June 12)", "Fulfillment in progress at Warehouse 4"] },
  "VIBE-54910": { status: "Cancelled", date: "May 30, 2026", courier: "N/A", history: ["Order received (May 30)", "Payment Failed", "Order Cancelled"] }
};

// Initialize Table Schema
const initDb = async () => {
  try {
    // 1. Products Table
    await run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        rating REAL,
        reviewsCount INTEGER,
        discount REAL DEFAULT 0,
        image TEXT,
        description TEXT,
        specs TEXT,
        inStock INTEGER DEFAULT 0
      )
    `);

    // Check if products table is empty
    const productCountRow = await get(`SELECT COUNT(*) as count FROM products`);
    if (productCountRow.count === 0) {
      console.log('[SQLite DB] Seeding initial product catalog...');
      const insertStmt = `
        INSERT INTO products (id, name, category, price, rating, reviewsCount, discount, image, description, specs, inStock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      for (const p of INITIAL_PRODUCTS) {
        await run(insertStmt, [
          p.id, p.name, p.category, p.price, p.rating, p.reviewsCount,
          p.discount, p.image, p.description, p.specs, p.inStock
        ]);
      }
      console.log('[SQLite DB] Successfully seeded products!');
    }

    // 2. Orders Table
    await run(`
      CREATE TABLE IF NOT EXISTS orders (
        orderId TEXT PRIMARY KEY,
        customerName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        zip TEXT NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT NOT NULL,
        paymentMethod TEXT NOT NULL,
        paymentId TEXT,
        razorpayOrderId TEXT,
        razorpaySignature TEXT,
        items TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);

    // Seed mock tracking orders if not present
    for (const [orderId, data] of Object.entries(INITIAL_ORDERS)) {
      const existingOrder = await get(`SELECT orderId FROM orders WHERE orderId = ?`, [orderId]);
      if (!existingOrder) {
        await run(`
          INSERT INTO orders (orderId, customerName, email, phone, address, city, zip, totalAmount, status, paymentMethod, paymentId, items, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          "Valued Customer",
          "customer@example.com",
          "+1-555-0192",
          "123 Tech Blvd",
          "San Francisco",
          "94107",
          199.99,
          data.status,
          "Razorpay / Prepaid",
          `pay_mock_${orderId}`,
          JSON.stringify([{ name: "Sample Item", price: 199.99, quantity: 1 }]),
          data.date
        ]);
      }
    }

    // 3. Support Tickets Table
    await run(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'Open',
        createdAt TEXT NOT NULL
      )
    `);

    console.log('[SQLite DB] All tables verified and initialized successfully.');
  } catch (err) {
    console.error('[SQLite DB] Initialization error:', err);
  }
};

initDb();

module.exports = {
  db,
  run,
  all,
  get
};
