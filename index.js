import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { KJUR } from "jsrsasign";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = "your_super_secret_key"; // フロントと一致させること！
let savedJWT = null;

// 購入時QR保存
app.post("/save-purchase", (req, res) => {
  savedJWT = req.body.jwt;
  console.log("✅ 保存されたJWT:", savedJWT);
  res.json({ message: "購入QRを保存しました。" });
});

// 入場時QR照合
app.post("/verify-entry", (req, res) => {
  const entryJWT = req.body.jwt;
  if (!savedJWT) return res.json({ message: "購入データがまだ登録されていません。" });

  try {
    const purchasePayload = KJUR.jws.JWS.readSafeJSONString(
      Buffer.from(savedJWT.split(".")[1], "base64").toString()
    );
    const entryPayload = KJUR.jws.JWS.readSafeJSONString(
      Buffer.from(entryJWT.split(".")[1], "base64").toString()
    );

    if (
      purchasePayload.user_id === entryPayload.user_id &&
      purchasePayload.device_id === entryPayload.device_id
    ) {
      res.json({ message: "✅ 本人確認OK" });
    } else {
      res.json({ message: "❌ 一致しません" });
    }
  } catch (e) {
    console.error(e);
    res.json({ message: "JWTの解析に失敗しました。" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

