const jwt = require('jsonwebtoken');

function backofficeAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '인증 토큰이 없습니다.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.backofficeUser = jwt.verify(token, process.env.BACKOFFICE_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
}

module.exports = backofficeAuth;
