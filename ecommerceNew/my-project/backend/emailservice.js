const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOrderConfirmation(to, orderDetails) {
  const mailOptions = {
    from: `"VibeCart" <${process.env.EMAIL_USER}>`,
    to,
    subject: `VibeCart - Order Confirmed #${orderDetails.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>🎉 Order Confirmed!</h2>
        <p>Thank you for shopping with VibeCart.</p>

        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
        <p><strong>Amount:</strong> ₹${orderDetails.amount}</p>

        <p>Your payment was successful and your order has been placed.</p>

        <p>Thank you for choosing VibeCart ❤️</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOrderConfirmation };