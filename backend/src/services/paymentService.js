/**
 * paymentService — wraps Razorpay in test mode.
 * When MOCK_PAYMENTS=true, returns fake order/payment IDs so the app
 * runs without real Razorpay credentials.
 */

let razorpay = null;

const isMock = () => process.env.MOCK_PAYMENTS === 'true';

const getRazorpay = () => {
  if (!razorpay) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
};

/**
 * Create a Razorpay order (or a mock order).
 * @param {number} amount - amount in INR (will be converted to paise)
 * @param {string} receipt - unique receipt identifier
 * @returns {object} order object with id, amount, currency
 */
const createOrder = async (amount, receipt) => {
  if (isMock()) {
    return {
      id: `mock_order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      amount: amount * 100,
      currency: 'INR',
      receipt,
      isMock: true,
    };
  }

  const rp = getRazorpay();
  const order = await rp.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
  });
  return order;
};

/**
 * Verify Razorpay payment signature (skipped in mock mode).
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature
 * @returns {boolean}
 */
const verifyPayment = (orderId, paymentId, signature) => {
  if (isMock()) return true;

  const crypto = require('crypto');
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

module.exports = { createOrder, verifyPayment, isMock };

