/**
 * QR Generator — NUMBER PRIVACY PROTECTED
 * ─────────────────────────────────────────
 * The QR encodes the SCAN PAGE URL, NOT any phone number.
 * Real numbers are stored server-side only.
 * When someone scans → they reach the scan page → call is bridged via Twilio.
 * Both caller and receiver see the Twilio virtual number — real numbers never exposed.
 */
const BRAND   = "EMERGENCY SAFETY QRR";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://emergencysafetyqrr.in";

export const generateBrandedQRCanvas = async (
  _phone: string,       // kept for API compat — NOT encoded in QR anymore
  vehicleNumber: string,
  qrId: string,
): Promise<HTMLCanvasElement> => {
  const QRCode = (await import("qrcode")).default;

  // ⚡ Encode scan page URL — real phone number is NEVER in the QR
  const scanUrl = `${SITE_URL}/scan/${qrId}`;

  const inner = document.createElement("canvas");
  await (QRCode as any).toCanvas(inner, scanUrl, {
    width: 280, margin: 2,
    color: { dark: "#1a1a1a", light: "#ffffff" },
    errorCorrectionLevel: "H",
  });

  const c = document.createElement("canvas");
  c.width = 400; c.height = 500;
  const ctx = c.getContext("2d")!;

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 400, 500);

  // ── Red top stripe ──────────────────────────────────────────────────────────
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(0, 0, 400, 62);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px 'Rajdhani', Arial";
  ctx.textAlign = "center";
  ctx.fillText(BRAND, 200, 28);
  ctx.font = "11px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("🔒 PRIVATE • SCAN TO CONNECT EMERGENCY CALL", 200, 50);

  // ── QR code ─────────────────────────────────────────────────────────────────
  ctx.drawImage(inner, 60, 72, 280, 280);

  // Corner accent marks
  const mk = "#dc2626", ms = 20, mt = 3;
  [[60,72],[340-ms,72],[60,352-ms],[340-ms,352-ms]].forEach(([x,y]) => {
    ctx.fillStyle = mk;
    ctx.fillRect(x, y, ms, mt);
    ctx.fillRect(x, y, mt, ms);
    ctx.fillRect(x+ms-mt, y, mt, ms);
    ctx.fillRect(x, y+ms-mt, ms, mt);
  });

  // ── Privacy shield badge ─────────────────────────────────────────────────────
  ctx.fillStyle = "#dcfce7";
  ctx.beginPath();
  ctx.roundRect(60, 360, 280, 28, 8);
  ctx.fill();
  ctx.fillStyle = "#15803d";
  ctx.font = "bold 11px Arial";
  ctx.fillText("🔒 NUMBER PRIVACY PROTECTED — Powered by Twilio", 200, 379);

  // ── Vehicle info row ─────────────────────────────────────────────────────────
  ctx.fillStyle = "#111827";
  ctx.font = "bold 16px 'Rajdhani', Arial";
  ctx.fillText(`${vehicleNumber}`, 200, 410);
  ctx.fillStyle = "#6b7280";
  ctx.font = "11px Arial";
  ctx.fillText("Scan to anonymously connect emergency call", 200, 428);

  // ── Bottom strip ─────────────────────────────────────────────────────────────
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(0, 440, 400, 60);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "9px monospace";
  ctx.fillText(`ID: ${qrId.slice(-12).toUpperCase()}`, 200, 458);
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 11px Arial";
  ctx.fillText("EMERGENCY SAFETY QRR  •  emergencysafetyqrr.in", 200, 476);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "9px Arial";
  ctx.fillText("Real phone numbers are never stored in this QR code", 200, 493);

  return c;
};

export const downloadQRAsPNG = async (phone: string, vehicleNumber: string, qrId: string) => {
  const c = await generateBrandedQRCanvas(phone, vehicleNumber, qrId);
  const a = document.createElement("a");
  a.download = `QRR_${vehicleNumber.replace(/\s/g,"_")}_PRIVATE.png`;
  a.href     = c.toDataURL("image/png");
  a.click();
};

export const downloadQRAsPDF = async (phone: string, vehicleNumber: string, qrId: string) => {
  try {
    const c   = await generateBrandedQRCanvas(phone, vehicleNumber, qrId);
    const img = c.toDataURL("image/png");
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw  = pdf.internal.pageSize.getWidth();
    const iw  = 100, ih = (c.height / c.width) * iw;

    pdf.setFontSize(18);
    pdf.setTextColor(220, 38, 38);
    pdf.setFont("helvetica", "bold");
    pdf.text(BRAND, pw / 2, 18, { align: "center" });

    pdf.addImage(img, "PNG", (pw - iw) / 2, 26, iw, ih);

    pdf.setFontSize(9);
    pdf.setTextColor(120);
    pdf.setFont("helvetica", "normal");
    pdf.text("🔒 Number Privacy Protected — Real numbers never in QR", pw / 2, 26 + ih + 8, { align: "center" });
    pdf.text("Scan to connect emergency call via masked bridge", pw / 2, 26 + ih + 14, { align: "center" });
    pdf.text("emergencysafetyqrr.in", pw / 2, 26 + ih + 20, { align: "center" });

    pdf.save(`QRR_${vehicleNumber.replace(/\s/g,"_")}_PRIVATE.pdf`);
  } catch {
    await downloadQRAsPNG(phone, vehicleNumber, qrId);
  }
};
