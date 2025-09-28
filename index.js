import express from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = "your_super_secret_key"; // JWT生成と同じ秘密鍵を使用

// ✅ JWT署名検証＆一致判定API
app.post("/verify", (req, res) => {
  const { jwt1, jwt2 } = req.body;
  if (!jwt1 || !jwt2) {
    return res.status(400).json({ error: "JWTが不足しています" });
  }

  try {
    const decoded1 = jwt.verify(jwt1, SECRET_KEY);
    const decoded2 = jwt.verify(jwt2, SECRET_KEY);

    const same_person =
      decoded1.user_id === decoded2.user_id &&
      decoded1.device_id === decoded2.device_id &&
      decoded1.ticket_source === decoded2.ticket_source;

    res.json({
      valid: true,
      same_person,
      payload1: decoded1,
      payload2: decoded2
    });
  } catch (err) {
    console.error("JWT検証エラー:", err.message);
    res.json({ valid: false, error: "JWT検証失敗" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.get("/health", (req, res) => res.send("Server running ✅"));
