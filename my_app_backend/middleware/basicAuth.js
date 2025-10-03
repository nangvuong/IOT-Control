const basicAuth = (req, res, next) => {
  // Lấy header Authorization
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Access to API"');
    return res.status(401).json({ message: "Authorization required" });
  }

  // Tách username:password từ header
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [username, password] = credentials.split(":");

  // Lấy username, password từ biến môi trường (.env)
  const USER = process.env.BASIC_AUTH_USERNAME;
  const PASS = process.env.BASIC_AUTH_PASSWORD;

  // Kiểm tra
  if (username === USER && password === PASS) {
    return next(); // Cho phép đi tiếp
  }

  return res.status(403).json({ message: "Invalid credentials" });
};

module.exports = basicAuth;
