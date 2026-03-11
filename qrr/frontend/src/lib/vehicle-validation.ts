// src/lib/vehicle-validation.ts
// Validates Indian vehicle number formats:
//   Standard : MH 12 AB 1234  (State 2L + District 2N + Series 1-3L + Number 1-4N)
//   BH series: 23 BH 2345 AB  (Year 2N + BH + 4N + 2L/2N category)

export interface VehicleValidationResult {
  valid: boolean;
  formatted: string;   // auto-formatted with spaces
  error: string | null;
  type: "standard" | "bh" | null;
}

// All valid Indian state/UT codes
const STATE_CODES = new Set([
  "AN","AP","AR","AS","BR","CG","CH","DD","DL","DN","GA","GJ","HP",
  "HR","JH","JK","KA","KL","LA","LD","MH","ML","MN","MP","MZ","NL",
  "OD","PB","PY","RJ","SK","TN","TR","TS","UK","UP","WB",
]);

// Standard: DL 23 DE 3423  →  /^[A-Z]{2}\d{2}[A-Z]{1,3}\d{1,4}$/
const STANDARD_RE = /^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/;

// BH series: 23 BH 2345 AB  →  /^\d{2}BH\d{4}[A-Z0-9]{2}$/
const BH_RE = /^(\d{2})(BH)(\d{4})([A-Z]{2}|\d{2})$/;

/** Strip all whitespace/hyphens/dots and uppercase */
const normalize = (v: string) => v.replace(/[\s\-\.]/g, "").toUpperCase();

/** Auto-insert canonical spaces as the user types */
export const formatVehicleNumber = (raw: string): string => {
  const v = normalize(raw);

  // BH: 23BH234532 → 23 BH 2345 32
  if (/^\d{2}BH/.test(v)) {
    const parts = [v.slice(0, 2), v.slice(2, 4), v.slice(4, 8), v.slice(8, 10)];
    return parts.filter(Boolean).join(" ");
  }

  // Standard: MHABABCD → MH AB AB 1234
  if (v.length >= 2 && /^[A-Z]{2}/.test(v)) {
    const sc = v.slice(0, 2);            // state code
    const rest = v.slice(2);
    const dist  = rest.match(/^\d{1,2}/)?.[0]  ?? "";
    const after = rest.slice(dist.length);
    const ser   = after.match(/^[A-Z]{1,3}/)?.[0] ?? "";
    const num   = after.slice(ser.length).slice(0, 4);
    return [sc, dist, ser, num].filter(Boolean).join(" ");
  }

  return raw.toUpperCase();
};

export const validateVehicleNumber = (raw: string): VehicleValidationResult => {
  const v = normalize(raw);

  if (!v) return { valid: false, formatted: "", error: "Vehicle number is required", type: null };

  // ── BH series check ──────────────────────────────────────────────────────
  if (/^\d{2}BH/.test(v)) {
    if (!BH_RE.test(v)) {
      return {
        valid: false,
        formatted: formatVehicleNumber(raw),
        error: "BH format should be: 23 BH 2345 AB  (Year · BH · 4-digit number · 2-char category)",
        type: "bh",
      };
    }
    const year = parseInt(v.slice(0, 2), 10);
    const currentYear = new Date().getFullYear() % 100;
    if (year > currentYear + 1) {
      return {
        valid: false,
        formatted: formatVehicleNumber(raw),
        error: `Registration year '${year}' is in the future`,
        type: "bh",
      };
    }
    return { valid: true, formatted: formatVehicleNumber(raw), error: null, type: "bh" };
  }

  // ── Standard format check ─────────────────────────────────────────────────
  const match = v.match(STANDARD_RE);
  if (!match) {
    // Give a hint based on how far the user got
    if (v.length < 2)
      return { valid: false, formatted: formatVehicleNumber(raw), error: "Start with your state code, e.g. MH, DL, KA…", type: null };
    if (!/^[A-Z]{2}/.test(v))
      return { valid: false, formatted: formatVehicleNumber(raw), error: "First 2 characters must be letters (state code)", type: null };
    return {
      valid: false,
      formatted: formatVehicleNumber(raw),
      error: "Standard format: MH 12 AB 1234  (State · 2 digits · 1-3 letters · 1-4 digits)",
      type: "standard",
    };
  }

  const [, stateCode] = match;
  if (!STATE_CODES.has(stateCode)) {
    return {
      valid: false,
      formatted: formatVehicleNumber(raw),
      error: `'${stateCode}' is not a valid Indian state/UT code`,
      type: "standard",
    };
  }

  return { valid: true, formatted: formatVehicleNumber(raw), error: null, type: "standard" };
};
