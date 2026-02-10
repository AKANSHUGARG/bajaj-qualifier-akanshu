const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const CHITKARA_EMAIL = "akanshu0185.be23@chitkara.edu.in";

const isPrime = (num) => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

app.get('/health', (req, res) => {
  res.status(200).json({ is_success: true, official_email: CHITKARA_EMAIL });
});

app.post('/bfhl', async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    if (keys.length !== 1) return res.status(400).json({ is_success: false });

    const key = keys[0];
    const input = req.body[key];
    let data;

    switch (key) {
      case 'fibonacci':
        {
          let fib = [0, 1];
          while (fib.length < input) fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
          data = fib.slice(0, input);
        }
        break;
      case 'prime':
        data = input.filter(isPrime);
        break;
      case 'lcm':
        data = input.reduce((acc, val) => lcm(acc, val));
        break;
      case 'hcf':
        data = input.reduce((acc, val) => gcd(acc, val));
        break;
      case 'AI':
        {
          if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ is_success: false, error: 'Gemini API key missing' });
          }
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const result = await model.generateContent(`${input}. Answer in exactly one word.`);
          data = (result?.response?.text?.()) ? result.response.text().trim().replace(/[^\w]/g, '') : '';
        }
        break;
      default:
        return res.status(400).json({ is_success: false });
    }
    res.status(200).json({ is_success: true, official_email: CHITKARA_EMAIL, data });
  } catch (err) {
    res.status(500).json({ is_success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));