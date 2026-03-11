/**
 * /api/call — Masked Calling via Exotel (Indian service)
 *
 * WHY EXOTEL:
 *  ✅ Indian company — works perfectly with Indian numbers
 *  ✅ No webhooks needed — just ONE API call
 *  ✅ No public URL required — works on localhost
 *  ✅ Both caller + receiver see only Exotel virtual number
 *  ✅ Real numbers NEVER exposed
 *
 * FLOW:
 *  1. Scanner taps "Call" on scan page
 *  2. Enters their number
 *  3. POST /api/call/connect  →  Exotel API called
 *  4. Exotel calls SCANNER first
 *  5. Scanner picks up → Exotel connects to EMERGENCY NUMBER
 *  6. Done — both see only Exotel number
 *
 * SETUP (free trial available):
 *  1. Sign up at https://exotel.com
 *  2. Get: Account SID, API Key, API Token, Virtual Number
 *  3. Add to .env (see bottom of this file)
 */

const express  = require("express");
const router   = express.Router();
const https    = require("https");
const QRRecord = require("../models/QRRecord");

// ── GET /api/call/check ───────────────────────────────────────────────────────
router.get("/check", (req, res) => {
  const configured = !!(
    process.env.EXOTEL_SID         &&
    process.env.EXOTEL_API_KEY     &&
    process.env.EXOTEL_API_TOKEN   &&
    process.env.EXOTEL_VIRTUAL_NUMBER
  );
  res.json({ success: true, callServiceAvailable: configured });
});

// ── POST /api/call/connect ────────────────────────────────────────────────────
// Body: { qrId, callerPhone, contactIndex? }
router.post("/connect", async (req, res) => {
  try {
    const { qrId, callerPhone, contactIndex = 1 } = req.body;

    if (!qrId || !callerPhone)
      return res.status(400).json({ success: false, message: "qrId and callerPhone required" });

    // Validate + clean caller number
    const cleanCaller = formatIndianPhone(callerPhone);
    if (!cleanCaller)
      return res.status(400).json({ success: false, message: "Enter valid 10-digit Indian mobile number" });

    // Load QR record — emergency number is ONLY here, never sent to frontend
    const qr = await QRRecord.findById(qrId);
    if (!qr || !qr.isActive)
      return res.status(404).json({ success: false, message: "QR not found or inactive" });

    // Pick contact
    const emergencyRaw = contactIndex === 2 && qr.emergencyContact2
      ? qr.emergencyContact2
      : qr.emergencyContact1;

    const emergencyNumber = formatIndianPhone(emergencyRaw);
    if (!emergencyNumber)
      return res.status(400).json({ success: false, message: "Emergency contact number invalid" });

    // ── Make Exotel click-to-call ─────────────────────────────────────────────
    // Exotel calls cleanCaller first → when answered → connects to emergencyNumber
    // Both sides see EXOTEL_VIRTUAL_NUMBER only
    await exotelConnect({
      from:     cleanCaller,          // scanner's number (called first)
      to:       emergencyNumber,      // emergency contact (called second, bridged)
      callerId: process.env.EXOTEL_VIRTUAL_NUMBER,  // what BOTH sides see
    });

    res.json({
      success:  true,
      message:  `Calling you now at ${maskPhone(cleanCaller)}. Pick up to connect to the vehicle owner.`,
    });

  } catch (err) {
    console.error("Exotel error:", err.message);

    if (err.message.includes("not configured"))
      return res.status(503).json({ success: false, message: "Calling service not configured. Contact admin." });

    res.status(500).json({ success: false, message: "Call failed: " + err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// Exotel API helper
// ══════════════════════════════════════════════════════════════════════════════
function exotelConnect({ from, to, callerId }) {
  return new Promise((resolve, reject) => {
    const sid   = process.env.EXOTEL_SID;
    const key   = process.env.EXOTEL_API_KEY;
    const token = process.env.EXOTEL_API_TOKEN;

    if (!sid || !key || !token || !callerId)
      return reject(new Error("Exotel credentials not configured in .env"));

    // Exotel click-to-call endpoint
    const postData = new URLSearchParams({
      From:     from,
      To:       to,
      CallerId: callerId,
      // Optional: TimeLimit (seconds), TimeOut, Record
      TimeLimit: "300",   // max 5 min
      TimeOut:   "30",    // ring for 30s
    }).toString();

    const options = {
      hostname: "api.exotel.com",
      path:     `/v1/Accounts/${sid}/Calls/connect`,
      method:   "POST",
      headers:  {
        "Content-Type":   "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
        "Authorization":  "Basic " + Buffer.from(`${key}:${token}`).toString("base64"),
      },
    };

    const req = https.request(options, (response) => {
      let data = "";
      response.on("data", chunk => data += chunk);
      response.on("end", () => {
        if (response.statusCode === 200 || response.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Exotel API error ${response.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatIndianPhone(raw) {
  if (!raw) return null;
  const d = raw.replace(/\D/g, "");
  let ten;
  if      (d.length === 10)                       ten = d;
  else if (d.length === 12 && d.startsWith("91")) ten = d.slice(2);
  else if (d.length === 11 && d.startsWith("0"))  ten = d.slice(1);
  else return null;
  if (!/^[6-9]\d{9}$/.test(ten)) return null;
  return `0${ten}`;  // Exotel uses 0XXXXXXXXXX format for Indian numbers
}

function maskPhone(phone) {
  const d = phone.replace(/\D/g, "").slice(-10);
  return `+91 ${d.slice(0,2)}XXXXXX${d.slice(8)}`;
}

module.exports = router;

/*
 * ── .env keys to add ─────────────────────────────────────────────────────────
 *
 * EXOTEL_SID=your_account_sid          ← from Exotel dashboard
 * EXOTEL_API_KEY=your_api_key          ← Settings → API Keys
 * EXOTEL_API_TOKEN=your_api_token      ← Settings → API Keys
 * EXOTEL_VIRTUAL_NUMBER=0XXXXXXXXXX    ← your Exotel virtual number (Exophone)
 *
 * SIGN UP: https://exotel.com  →  free trial includes test calls
 * DOCS:    https://developer.exotel.com/api/#call-connect
 */
