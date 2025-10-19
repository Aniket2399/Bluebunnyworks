const express = require('express');
const Checkout = require('../models/Checkout');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// ====================
// Create a new checkout
// POST /api/checkout
// Private
// ====================
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: 'No items in checkout' });
  }

  try {
    // Create local checkout record
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod: 'stripe', // default to Stripe
      totalPrice,
      paymentStatus: 'Pending',
      isPaid: false,
      stripeSessionId: null, // initialize
    });

    res.status(201).json({ checkout: newCheckout });
  } catch (error) {
    console.error('Error creating checkout', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ====================
// Create Stripe session
// POST /api/checkout/:id/stripe-session
// Private
// ====================
router.post('/:id/stripe-session', protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) return res.status(404).json({ message: "Checkout not found" });
    if (checkout.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: checkout.checkoutItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.name, images: [item.image] },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      metadata: {
        checkoutId: checkout._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    // Save Stripe session ID
    checkout.stripeSessionId = session.id;
    await checkout.save();

    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ====================
// Stripe webhook
// POST /api/checkout/webhook
// Public
// ====================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const checkout = await Checkout.findOne({ stripeSessionId: session.id });
      if (checkout && !checkout.isPaid) {
        checkout.isPaid = true;
        checkout.paymentStatus = 'paid';
        checkout.paidAt = new Date();
        checkout.paymentDetails = session;
        await checkout.save();
      }
    } catch (err) {
      console.error('Error updating checkout after Stripe payment', err);
    }
  }

  res.json({ received: true });
});

// ====================
// Finalize checkout and create order
// POST /api/checkout/:id/finalize
// Private
// ====================
router.post('/:id/finalize', protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ message: 'Checkout not found' });

    // Ensure checkout is paid via Stripe
    if (!checkout.isPaid) {
      if (!checkout.stripeSessionId)
        return res.status(400).json({ message: 'No Stripe session available' });

      const session = await stripe.checkout.sessions.retrieve(checkout.stripeSessionId);
      if (session.payment_status !== 'paid')
        return res.status(400).json({ message: 'Payment not completed yet' });

      checkout.isPaid = true;
      checkout.paymentStatus = 'paid';
      checkout.paidAt = new Date();
      checkout.paymentDetails = session;
      await checkout.save();
    }

    if (checkout.isFinalized)
      return res.status(400).json({ message: 'Checkout already finalized' });

    // Create order
    const finalOrder = await Order.create({
      user: checkout.user,
      orderItems: checkout.checkoutItems,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice: checkout.totalPrice,
      isPaid: true,
      paidAt: checkout.paidAt,
      isDelivered: false,
      paymentStatus: 'paid',
      paymentDetails: checkout.paymentDetails,
    });

    checkout.isFinalized = true;
    checkout.finalizedAt = Date.now();
    await checkout.save();

    await Cart.findOneAndDelete({ user: checkout.user });

    res.status(201).json(finalOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ====================
// Get checkout by Stripe session ID
// GET /api/checkout/session/:session_id
// Private
// ====================
router.get('/session/:session_id', protect, async (req, res) => {
  try {
    const { session_id } = req.params;
    const checkout = await Checkout.findOne({ stripeSessionId: session_id });
    if (!checkout) return res.status(404).json({ message: 'Checkout not found' });

    if (checkout.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    res.json(checkout);
  } catch (err) {
    console.error('Error fetching checkout by session ID:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
