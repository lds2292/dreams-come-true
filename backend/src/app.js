const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// CloudFront/Nginx 리버스 프록시 뒤에서 실행되므로 trust proxy 설정
app.set('trust proxy', 1);

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean)
  : true; // 개발 환경: 전체 허용

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = app;
