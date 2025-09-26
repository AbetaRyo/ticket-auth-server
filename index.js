import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { KJUR } from "jsrsasign";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = "your_super_secret_key";
let savedJWT = null;

app.post("/save-purchase", (req, res) => {
  savedJWT = req.body.jwt;
  console.log("保存されたJWT:", savedJWT);
  res.json({ message: "保存完了" });
});

app.post("/verify-entry", (req, res) => {
  const entryJWT = req.body.jwt;
  if (!savedJWT) return res.json({ message: "購入データが未登録です" });

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
      res.json({ message: "❌ 情報が一致しません" });
    }
  } catch (e) {
    console.error(e);
    res.json({ message: "JWT解析エラー" });
  }
});

// Render対応：ポート指定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

