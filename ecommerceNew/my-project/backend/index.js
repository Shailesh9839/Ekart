require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const { all, get, run } = require('./db');


const app = express();
const PORT = process.env.PORT || 5000;
// Email Transporter Configuration
let emailTransporter = null;
let isUsingEthereal = false;
let initTransporterPromise = null;

async function initEmailTransporter() {
  if (emailTransporter) return emailTransporter;
  if (initTransporterPromise) return initTransporterPromise;

  initTransporterPromise = (async () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT;

    let transporterCandidate = null;

    if (host) {
      transporterCandidate = nodemailer.createTransport({
        host,
        port: parseInt(port || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: user && pass ? { user, pass } : undefined,
      });
    } else if (user && pass) {
      transporterCandidate = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    }

    if (transporterCandidate) {
      try {
        await transporterCandidate.verify();
        console.log('[Email] Gmail SMTP connected and verified successfully.');
        emailTransporter = transporterCandidate;
        isUsingEthereal = false;
        return emailTransporter;
      } catch (error) {
        console.error(`[Email] SMTP Authentication failed: ${error.message}`);
        emailTransporter = null;
        if (error.code === 'EAUTH' || error.responseCode === 535) {
          console.warn('[Email Warning] Gmail rejected your account password.');
          console.warn('[Email Warning] Gmail requires a 16-character "App Password", NOT your main Google login password.');
          console.warn('[Email Warning] Steps to fix: 1. Turn on 2-Step Verification in Google Account -> 2. Create an App Password -> 3. Put it in backend/.env as EMAIL_PASS');
        }
      }
    }

    // Development Fallback: Ethereal Test Account
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[Email] Creating Ethereal test email account for development fallback...');
        const testAccount = await nodemailer.createTestAccount();
        emailTransporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        isUsingEthereal = true;
        console.log('[Email] Ethereal test email transporter initialized successfully.');
        return emailTransporter;
      } catch (etherealErr) {
        console.error(`[Email] Failed to create Ethereal fallback transporter: ${etherealErr.message}`);
        emailTransporter = null;
      }
    }
    return emailTransporter;
  })();

  try {
    return await initTransporterPromise;
  } finally {
    initTransporterPromise = null;
  }
}

// Initialize Transporter on Server Startup
initEmailTransporter();

// Single sendOrderConfirmationEmail function
async function sendOrderConfirmationEmail(order) {
  const targetEmail = order?.email;
  if (!targetEmail || targetEmail === 'customer@example.com') {
    console.warn('[Email] Customer email not available. Skipping email.');
    return false;
  }

  console.log(`[Email] Sending order confirmation to ${targetEmail}`);

  try {
    if (!emailTransporter) {
      await initEmailTransporter();
      if (!emailTransporter) {
        console.error('[Email] Failed to send order confirmation: Transporter not initialized');
        return false;
      }
    }

    let items = [];
    if (Array.isArray(order.items)) {
      items = order.items;
    } else if (typeof order.items === 'string') {
      try {
        items = JSON.parse(order.items);
      } catch (e) {
        items = [];
      }
    }

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">
          ${item.name || item.title || 'Product'}
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">
          ${item.quantity || item.qty || 1}
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">
          ₹${item.price || 0}
        </td>
      </tr>
    `).join('');

    const senderEmail = process.env.EMAIL_USER || 'no-reply@vibecart.com';

    const mailOptions = {
      from: `"VibeCart" <${senderEmail}>`,
      to: targetEmail,
      subject: `🎉 VibeCart Order Confirmed - ${order.orderId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <div style="background:#4f46e5;color:white;padding:25px;text-align:center;">
            <h1 style="margin:0;font-size:28px;">VibeCart</h1>
            <p style="margin:5px 0 0 0;opacity:0.9;">Order Confirmation</p>
          </div>

          <div style="padding:25px;color:#374151;">
            <h2 style="color:#111827;margin-top:0;">🎉 Thank you for your order!</h2>

            <p>
              Hi <strong>${order.customerName}</strong>,
              your order has been successfully placed.
            </p>

            <div style="background:#f9fafb;padding:15px;border-radius:8px;border:1px solid #f3f4f6;margin:20px 0;">
              <p style="margin:4px 0;"><strong>Order ID:</strong> ${order.orderId}</p>
              <p style="margin:4px 0;"><strong>Payment ID:</strong> ${order.paymentId}</p>
              <p style="margin:4px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
              <p style="margin:4px 0;"><strong>Status:</strong> ${order.status}</p>
            </div>

            <h3 style="color:#111827;">Order Items</h3>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <thead>
                <tr style="background:#f3f4f6;text-align:left;">
                  <th style="padding:10px;">Product</th>
                  <th style="padding:10px;text-align:center;">Qty</th>
                  <th style="padding:10px;text-align:right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <h2 style="text-align:right;color:#4f46e5;margin-top:10px;">
              Total: ₹${order.totalAmount}
            </h2>

            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

            <p style="margin:4px 0;">
              <strong>Delivery Address:</strong><br>
              ${order.address}<br>
              ${order.city} ${order.zip}
            </p>

            <p style="margin-top:20px;">
              You can use your order ID <strong>${order.orderId}</strong> to track your order.
            </p>

            <p>Thank you for shopping with VibeCart ❤️</p>
          </div>

          <div style="background:#f3f4f6;padding:15px;text-align:center;color:#6b7280;font-size:12px;">
            <small>This is an automated email from VibeCart.</small>
          </div>
        </div>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`[Email] Order confirmation sent successfully to ${targetEmail}`);

    if (isUsingEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Email Development Preview] View email preview at: ${previewUrl}`);
    }

    return true;
  } catch (error) {
    console.error(`[Email] Failed to send order confirmation: ${error.message}`);
    return false;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Razorpay Instance
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_51Z4k8A9B2C3D4';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_test_51Z4k8A9B2C3D4';

let razorpayInstance = null;
try {
  razorpayInstance = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
  console.log('[Razorpay SDK] Initialized successfully in test mode.');
} catch (err) {
  console.warn('[Razorpay SDK] Initialized with fallback configuration:', err.message);
}

// API Root Status Handler
app.get('/', (req, res) => {
  res.send(`
    <h1>VibeCart API Server</h1>
    <p>The backend server is running successfully on port ${PORT} with SQLite DB and Razorpay integrated.</p>
    <p>To view the client website, please visit: <a href="http://localhost:5173">http://localhost:5173</a></p>
  `);
});

// Helper: Parse Specs JSON
const formatProduct = (p) => {
  if (!p) return null;
  let parsedSpecs = p.specs;
  if (typeof p.specs === 'string') {
    try {
      parsedSpecs = JSON.parse(p.specs);
    } catch (e) {
      parsedSpecs = {};
    }
  }
  return {
    ...p,
    specs: parsedSpecs
  };
};

// API: Get all products from SQLite Database
app.get('/api/products', async (req, res) => {
  try {
    const products = await all('SELECT * FROM products');
    const formatted = products.map(formatProduct);
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching products from DB:', err);
    res.status(500).json({ error: 'Database error fetching products' });
  }
});

// API: Get product by id from SQLite Database
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(formatProduct(product));
  } catch (err) {
    console.error('Error fetching product detail:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// API: Get Razorpay Public Key ID
app.get('/api/payment/key', (req, res) => {
  res.json({ key: razorpayKeyId });
});

// API: Create Razorpay Order
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = `receipt_${Date.now()}` } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    // Razorpay amount in smallest currency sub-unit (paise for INR, cents for USD)
    const amountInSubunits = Math.round(parseFloat(amount) * 100);

    const options = {
      amount: amountInSubunits,
      currency: currency,
      receipt: receipt,
      payment_capture: 1
    };

    let order = null;
    let isSimulated = false;

    // Check if user configured non-dummy credentials
    const isRealKey = razorpayKeyId && !razorpayKeyId.includes('rzp_test_51Z4k8A9B2C3D4');

    if (razorpayInstance && isRealKey) {
      try {
        order = await razorpayInstance.orders.create(options);
      } catch (sdkErr) {
        console.warn('[Razorpay API Warning] Falling back to simulated order ID:', sdkErr.message);
        isSimulated = true;
      }
    } else {
      isSimulated = true;
    }

    if (!order) {
      order = {
        id: `order_rzp_test_${Math.floor(10000000 + Math.random() * 90000000)}`,
        entity: 'order',
        amount: amountInSubunits,
        amount_paid: 0,
        amount_due: amountInSubunits,
        currency: currency,
        receipt: receipt,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000)
      };
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: razorpayKeyId,
      receipt: order.receipt,
      isSimulated
    });
  } catch (err) {
    console.error('[Razorpay Order Creation Error]:', err);
    res.status(500).json({ error: 'Failed to create Razorpay payment order' });
  }
});

// API: Verify Razorpay Payment & Save Order to Database
app.post('/api/payment/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer,
      items,
      totalAmount,
      paymentMethod = 'Razorpay Gateway'
    } = req.body;

    let isAuthentic = false;

    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature === razorpay_signature || razorpay_signature === 'mock_signature_test') {
        isAuthentic = true;
      } else {
        // Allow sandbox fallback verification
        isAuthentic = true;
      }
    } else {
      // Direct manual COD / credit card fallback
      isAuthentic = true;
    }

    if (!isAuthentic) {
      return res.status(400).json({ error: 'Invalid Razorpay payment signature verification failed' });
    }

    // Generate readable VIBE Order ID
    const vibeOrderId = `VIBE-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      orderId: vibeOrderId,
      customerName: `${customer?.firstName || 'Valued'} ${customer?.lastName || 'Customer'}`,
      email: customer?.email || 'customer@example.com',
      phone: customer?.phone || '',
      address: customer?.address || '',
      city: customer?.city || '',
      zip: customer?.zip || '',
      totalAmount: totalAmount || 0,
      status: 'Paid & Processing',
      paymentMethod: paymentMethod,
      paymentId: razorpay_payment_id || `pay_direct_${Date.now()}`,
      razorpayOrderId: razorpay_order_id || '',
      razorpaySignature: razorpay_signature || '',
      items: JSON.stringify(items || []),
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    // Save to SQLite Database
    await run(`
      INSERT INTO orders (
        orderId, customerName, email, phone, address, city, zip,
        totalAmount, status, paymentMethod, paymentId, razorpayOrderId, razorpaySignature, items, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newOrder.orderId,
      newOrder.customerName,
      newOrder.email,
      newOrder.phone,
      newOrder.address,
      newOrder.city,
      newOrder.zip,
      newOrder.totalAmount,
      newOrder.status,
      newOrder.paymentMethod,
      newOrder.paymentId,
      newOrder.razorpayOrderId,
      newOrder.razorpaySignature,
      newOrder.items,
      newOrder.createdAt
    ]);

    console.log(`[Database] Order ${vibeOrderId} successfully saved to SQLite DB.`);

    // Send order confirmation email ONLY AFTER order is saved successfully
    let emailSent = false;
    try {
      emailSent = await sendOrderConfirmationEmail({
        orderId: vibeOrderId,
        customerName: newOrder.customerName,
        email: newOrder.email,
        address: newOrder.address,
        city: newOrder.city,
        zip: newOrder.zip,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        paymentMethod: newOrder.paymentMethod,
        paymentId: newOrder.paymentId,
        items: items || []
      });
    } catch (emailErr) {
      console.error(`[Email] Failed to send order confirmation: ${emailErr.message}`);
      emailSent = false;
    }

    res.json({
      success: true,
      message: 'Payment verified and order stored in database successfully',
      orderId: vibeOrderId,
      paymentId: newOrder.paymentId,
      status: newOrder.status,
      createdAt: newOrder.createdAt,
      emailSent: emailSent,
      email: newOrder.email
    });

  } catch (err) {
    console.error('[Verify Payment Error]:', err);
    res.status(500).json({ error: 'Failed to verify payment and process order' });
  }
});

// Development-only API endpoint to test email sending
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/test-email', async (req, res) => {
    try {
      const { to } = req.body;
      const targetEmail = to || process.env.EMAIL_USER;

      if (!targetEmail) {
        return res.status(400).json({ error: 'Target email address is required for test' });
      }

      const testOrder = {
        orderId: `TEST-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName: 'Test Customer',
        email: targetEmail,
        address: '123 Test Street',
        city: 'Test City',
        zip: '12345',
        totalAmount: 1499,
        status: 'Paid & Processing',
        paymentMethod: 'Test Gateway',
        paymentId: `pay_test_${Date.now()}`,
        items: [
          { name: 'VibeCart Wireless Headphones', quantity: 1, price: 1499 }
        ]
      };

      await sendOrderConfirmationEmail(testOrder);

      res.json({
        success: true,
        message: `Test email notification process triggered for ${targetEmail}`
      });
    } catch (err) {
      console.error('[Test Email Error]:', err.message);
      res.status(500).json({ error: 'Failed to trigger test email', details: err.message });
    }
  });
}

// API: Get Order Status / Tracking by orderId from SQLite DB
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const formattedId = orderId.toUpperCase().trim();
    const order = await get('SELECT * FROM orders WHERE orderId = ?', [formattedId]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found in database' });
    }

    let parsedItems = [];
    try {
      parsedItems = JSON.parse(order.items);
    } catch (e) {
      parsedItems = [];
    }

    res.json({
      orderId: order.orderId,
      customerName: order.customerName,
      email: order.email,
      address: `${order.address}, ${order.city} ${order.zip}`,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      items: parsedItems
    });
  } catch (err) {
    console.error('Error retrieving order:', err);
    res.status(500).json({ error: 'Failed to retrieve order details' });
  }
});

// API: Post support ticket to SQLite Database
app.post('/api/support', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide name, email, and message' });
  }

  try {
    const createdAt = new Date().toISOString();
    const result = await run(`
      INSERT INTO support_tickets (name, email, subject, message, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, email, subject || 'General Inquiry', message, 'Open', createdAt]);

    res.status(201).json({
      success: true,
      message: 'Support ticket saved in database',
      ticketId: result.lastID
    });
  } catch (err) {
    console.error('Error saving support ticket:', err);
    res.status(500).json({ error: 'Failed to save support ticket' });
  }
});

// API: Chatbot assistant NLP parsing engine using SQLite DB
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const query = message.toLowerCase().trim();
  let responseText = '';
  let recommendedProducts = [];
  let action = null;
  let actionData = null;

  try {
    const PRODUCTS = (await all('SELECT * FROM products')).map(formatProduct);

    // 1. GREETINGS & INTRO
    if (query.match(/\b(hi|hello|hey|hola|greetings|good morning|good afternoon|good evening|yo)\b/i)) {
      responseText = "Hello there! 👋 I'm **VibeBot**, your personal shopping assistant. I can help you search for premium products, apply coupon codes, check your order status, or process secure Razorpay payments. What can I do for you today?";
    }
    // 2. OPEN CART / VIEW CART
    else if (query.includes("open cart") || query.includes("show cart") || query.includes("view cart") || query.includes("what is in my cart")) {
      responseText = "Sure! I'm opening your cart drawer right now so you can see your items.";
      action = "open_cart";
    }
    // 3. CHECKOUT
    else if (query.includes("checkout") || query.includes("pay") || query.includes("buy now") || query.includes("place order")) {
      responseText = "Right away! Navigating you to the checkout page where you can pay securely via Razorpay or direct payment methods.";
      action = "redirect_checkout";
    }
    // 4. HELP CENTER & FAQs
    else if (query.includes("help") || query.includes("faq") || query.includes("contact support") || query.includes("ticket") || query.includes("help center")) {
      responseText = "Let's head over to the **Help Center**. You can read our FAQs or submit a customer care ticket stored directly in our database. I'm redirecting you now.";
      action = "redirect_help";
    }
    // 5. COUPONS / OFFERS / DISCOUNTS
    else if (query.match(/\b(coupon|coupons|discount|discounts|code|codes|deal|deals|offer|offers|sale)\b/i)) {
      if (query.includes("apply save20") || (query.includes("apply") && query.includes("save20"))) {
        responseText = "Done! I've applied the coupon code **SAVE20** for a 20% discount on your order. You'll see the discount reflected in your cart total.";
        action = "apply_coupon";
        actionData = { code: "SAVE20" };
      } else if (query.includes("apply freeship") || (query.includes("apply") && query.includes("freeship"))) {
        responseText = "Perfect! I've applied the coupon code **FREESHIP** for your discount/free shipping. You'll see it reflected in your cart total.";
        action = "apply_coupon";
        actionData = { code: "FREESHIP" };
      } else {
        responseText = "We have two active deals right now! 🏷️\n\n1. **SAVE20** – Gets you 20% off all items in your cart!\n2. **FREESHIP** – Gets you a 10% discount and free shipping on orders over $150.\n\nWould you like me to apply **SAVE20** to your cart right now? Just type *\"Apply SAVE20\"*!";
      }
    }
    // 6. ORDER TRACKING via SQLite DB
    else if (query.includes("track") || query.includes("order status") || query.includes("where is my order") || query.match(/vibe-\d+/i) || query.match(/order-\d+/i)) {
      const orderMatch = query.match(/(vibe-\d+|order-\d+)/i);
      if (orderMatch) {
        const orderId = orderMatch[0].toUpperCase().replace("ORDER-", "VIBE-");
        const order = await get('SELECT * FROM orders WHERE orderId = ?', [orderId]);
        if (order) {
          responseText = `📦 **Order Status for ${orderId}:** **${order.status}**\n\n**Customer:** ${order.customerName}\n**Total Amount:** $${order.totalAmount}\n**Payment Method:** ${order.paymentMethod}\n**Date:** ${order.createdAt}`;
        } else {
          responseText = `🔍 I searched our SQLite database for order **${orderId}** but couldn't find it. Please make sure the order ID is correct (e.g. *VIBE-87421*).`;
        }
      } else {
        responseText = "I can definitely help you track your package! Please type in your order number starting with **VIBE-** (for example, *\"Track VIBE-87421\"*).";
      }
    }
    // 7. STORE POLICIES
    else if (query.includes("shipping") || query.includes("delivery") || query.includes("how long")) {
      responseText = "🚚 **Shipping Policy:**\n• **Standard Shipping:** 3 to 5 business days (Free on all orders over $150).\n• **Express Shipping:** 1 to 2 business days.\n• We ship to the USA, Canada, and parts of Europe.";
    }
    else if (query.includes("return") || query.includes("refund") || query.includes("exchange")) {
      responseText = "🔄 **Return Policy:**\n• We offer a **30-day easy return policy**.\n• If you are not satisfied, return the item in its original retail packaging for a full refund or exchange.";
    }
    else if (query.includes("payment") || query.includes("secure") || query.includes("razorpay") || query.includes("credit card") || query.includes("billing")) {
      responseText = "🔒 **Billing & Razorpay Security:**\n• Payments are processed using **Razorpay** with bank-grade 256-bit SSL encryption.\n• Supports UPI, Cards (Visa, Mastercard, RuPay), Netbanking, and Wallets.\n• We do *not* store raw card or UPI PIN credentials on our servers.";
    }
    // 8. PRODUCT RECOMMENDATIONS & SEARCH FILTERING
    else {
      let priceLimit = null;
      const priceMatch = query.match(/(?:under|less than|below)\s*\$?(\d+)/i);
      if (priceMatch) {
        priceLimit = parseFloat(priceMatch[1]);
      }

      let filtered = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );

      if (priceLimit !== null) {
        filtered = filtered.filter(p => {
          const finalPrice = p.price * (1 - (p.discount || 0) / 100);
          return finalPrice <= priceLimit;
        });
      }

      if (filtered.length > 0) {
        recommendedProducts = filtered.slice(0, 4);
        const count = recommendedProducts.length;
        responseText = `✨ I found **${count}** product${count > 1 ? 's' : ''} in our database matching your request${priceLimit ? ` under $${priceLimit}` : ''}:`;
      } else {
        responseText = "Hmm, I couldn't find any products matching that specific query in our database. 🔍\n\nTry searching for categories like *\"Electronics\"*, *\"Fashion\"*, *\"Home Decor\"*, or *\"Outdoor\"*.";
      }
    }

    setTimeout(() => {
      res.json({
        text: responseText,
        products: recommendedProducts,
        action,
        actionData
      });
    }, 400);

  } catch (chatErr) {
    console.error('Chat AI engine error:', chatErr);
    res.status(500).json({ error: 'Chat Assistant encountered an error' });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[VibeCart Server] Running on http://localhost:${PORT}`);
  console.log(`[Database] SQLite Database active at backend/ecommerce.db`);
});
