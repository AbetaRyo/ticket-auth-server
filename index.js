const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// 秘密鍵（Renderにデプロイしたら環境変数に切り替える）
const SECRET = process.env.JWT_SECRET || "mysecretkey";

// チケット購入時 → JWT発行
app.post("/issue", (req, res) => {
  const { user_id, name, seat } = req.body;

  const token = jwt.sign(
    { user_id, name, seat, ticket_source: "purchase" },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// 入場時 → JWT検証
app.post("/verify", (req, res) => {
  const { token } = req.body;

  try {
    const payload = jwt.verify(token, SECRET);
    res.json({ valid: true, payload });
  } catch (err) {
    res.json({ valid: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
