import { useState, useRef, useEffect, useCallback } from "react";

const GREEN = "#8DC63F";
const GREEN_DARK = "#5A8A1A";
const RED = "#E8192C";
const CREAM = "#F2F0E8";
const DARK = "#1A1A1A";
const WHITE = "#FFFFFF";

const parse = v => parseFloat(v) || 0;
const fmt = n => `₱${isNaN(n) || !isFinite(n) ? "0.00" : n.toFixed(2)}`;

const STORAGE_KEY = "mollys_pricing_data";

const DEFAULT_STATE = {
  selectedProduct: "",
  materials: [{ name: "", totalQty: "", unit: "pc", totalCost: "" }],
  mealsPerMonth: "",
  hourlyRate: "",
  hoursSpent: "",
  rent: "",
  utilities: "",
  tools: "",
  unitsPerMonth: "",
  quantity: "1",
  marginPct: "30",
  discountPct: "0",
  taxPct: "0",
  products: ["Chicken Wings", "Matcha Latte", "Ube Pandesal", "Cream Puff", "Biko"],
};

// ── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ materialTotal, laborTotal, otherTotal }) {
  const canvasRef = useRef(null);
  const total = materialTotal + laborTotal + otherTotal;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, r = size * 0.35, lineW = size * 0.16;
    ctx.clearRect(0, 0, size, size);
    if (total === 0) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#E0DDD0"; ctx.lineWidth = lineW; ctx.stroke();
      ctx.fillStyle = "#9A9585"; ctx.font = `bold ${size * 0.1}px Nunito,sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("No data", cx, cy); return;
    }
    const segs = [{ value: materialTotal, color: "#C0392B" }, { value: laborTotal, color: "#E8A0A8" }, { value: otherTotal, color: "#F5C6CB" }];
    let start = -Math.PI / 2;
    segs.forEach(s => {
      if (s.value <= 0) return;
      const sweep = (s.value / total) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(cx, cy, r, start, start + sweep);
      ctx.strokeStyle = s.color; ctx.lineWidth = lineW; ctx.stroke();
      start += sweep;
    });
    ctx.fillStyle = DARK; ctx.font = `bold ${size * 0.1}px Nunito,sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(fmt(total), cx, cy);
  }, [materialTotal, laborTotal, otherTotal, total]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <canvas ref={canvasRef} width={160} height={160} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
        {[{ label: "Materials", color: "#C0392B", value: materialTotal }, { label: "Labor", color: "#E8A0A8", value: laborTotal }, { label: "Other", color: "#F5C6CB", value: otherTotal }].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: "#6B6860", flex: 1 }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: DARK }}>{total > 0 ? ((s.value / total) * 100).toFixed(1) + "%" : "0%"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function Label({ children, hint }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: "#5A5850", letterSpacing: 1, textTransform: "uppercase" }}>{children}</span>
      {hint && <span style={{ fontSize: 11, color: "#9A9585", marginLeft: 6 }}>{hint}</span>}
    </div>
  );
}
function NumInput({ prefix, suffix, value, onChange, placeholder = "0", small }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", background: CREAM, border: "2px solid #D8D5C5", borderRadius: 8, overflow: "hidden" }}>
      {prefix && <span style={{ padding: "0 8px", fontSize: 12, fontWeight: 700, color: GREEN_DARK, background: "#E8F5D0", borderRight: "1px solid #D8D5C5", display: "flex", alignItems: "center" }}>{prefix}</span>}
      <input type="number" min="0" step="any" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, padding: small ? "6px 6px" : "8px 8px", border: "none", background: "transparent", fontFamily: "'Fredoka One',cursive", fontSize: small ? 13 : 14, color: DARK, outline: "none", width: "100%" }} />
      {suffix && <span style={{ padding: "0 8px", fontSize: 11, color: "#9A9585", display: "flex", alignItems: "center", background: CREAM, whiteSpace: "nowrap" }}>{suffix}</span>}
    </div>
  );
}
function TxtInput({ value, onChange, placeholder, small }) {
  return (
    <input type="text" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: small ? "6px 8px" : "8px 10px", border: "2px solid #D8D5C5", borderRadius: 8, fontFamily: "'Nunito',sans-serif", fontSize: small ? 12 : 13, color: DARK, background: CREAM, outline: "none", boxSizing: "border-box" }} />
  );
}
function Section({ title, emoji, children, note }) {
  return (
    <div style={{ background: WHITE, border: "2px solid #E0DDD0", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ background: CREAM, borderBottom: "2px solid #E0DDD0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span style={{ fontFamily: "'Protest Riot',cursive", fontSize: 18, color: GREEN_DARK }}>{title}</span>
      </div>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {note && <div style={{ fontSize: 11, color: "#9A9585" }}>{note}</div>}
        {children}
      </div>
    </div>
  );
}
function TotalRow({ label, value, red }) {
  return (
    <div style={{ background: red ? "#FFF0F0" : "#F0F9E0", border: `1.5px solid ${red ? "#F5C0C0" : GREEN}`, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
      <span style={{ fontWeight: 800, fontSize: 13, color: red ? RED : GREEN_DARK }}>{label}</span>
      <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: red ? RED : GREEN_DARK, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}
function StatCard({ label, value, sub, highlight, big }) {
  return (
    <div style={{ background: highlight ? GREEN : WHITE, border: `2px solid ${highlight ? GREEN_DARK : "#E0DDD0"}`, borderRadius: 14, padding: "12px 14px", boxShadow: highlight ? "0 6px 20px rgba(141,198,63,0.3)" : "none", minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: highlight ? "rgba(255,255,255,0.8)" : "#9A9585", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Protest Riot',cursive", fontSize: big ? 28 : 22, color: highlight ? WHITE : GREEN_DARK, lineHeight: 1.1, wordBreak: "break-all" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: highlight ? "rgba(255,255,255,0.75)" : "#9A9585", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const UNITS = ["pc", "kg", "g", "ml", "l", "cup", "tbsp", "tsp", "pack", "dozen"];

// ── Main ─────────────────────────────────────────────────────────────────────
export default function PricingCalculator() {
  const [loaded, setLoaded]                   = useState(false);
  const [toast, setToast]                     = useState(null); // { msg, type: "success"|"error"|"info" }
  const [showStoragePanel, setShowStoragePanel] = useState(false);
  const importRef                             = useRef(null);

  const [selectedProduct, setSelectedProduct] = useState(DEFAULT_STATE.selectedProduct);
  const [customProduct, setCustomProduct]     = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [products, setProducts]               = useState(DEFAULT_STATE.products);
  const [materials, setMaterials]             = useState(DEFAULT_STATE.materials);
  const [mealsPerMonth, setMealsPerMonth]     = useState(DEFAULT_STATE.mealsPerMonth);
  const [hourlyRate, setHourlyRate]           = useState(DEFAULT_STATE.hourlyRate);
  const [hoursSpent, setHoursSpent]           = useState(DEFAULT_STATE.hoursSpent);
  const [rent, setRent]                       = useState(DEFAULT_STATE.rent);
  const [utilities, setUtilities]             = useState(DEFAULT_STATE.utilities);
  const [tools, setTools]                     = useState(DEFAULT_STATE.tools);
  const [unitsPerMonth, setUnitsPerMonth]     = useState(DEFAULT_STATE.unitsPerMonth);
  const [quantity, setQuantity]               = useState(DEFAULT_STATE.quantity);
  const [marginPct, setMarginPct]             = useState(DEFAULT_STATE.marginPct);
  const [discountPct, setDiscountPct]         = useState(DEFAULT_STATE.discountPct);
  const [taxPct, setTaxPct]                   = useState(DEFAULT_STATE.taxPct);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Get current snapshot ──
  const getSnapshot = useCallback(() => ({
    selectedProduct, materials, mealsPerMonth,
    hourlyRate, hoursSpent, rent, utilities, tools,
    unitsPerMonth, quantity, marginPct, discountPct, taxPct, products,
    savedAt: new Date().toISOString(),
  }), [selectedProduct, materials, mealsPerMonth, hourlyRate, hoursSpent, rent, utilities, tools, unitsPerMonth, quantity, marginPct, discountPct, taxPct, products]);

  // ── Apply saved data ──
  const applyData = (saved) => {
    if (!saved) return;
    if (saved.selectedProduct !== undefined) setSelectedProduct(saved.selectedProduct);
    if (saved.materials)      setMaterials(saved.materials);
    if (saved.mealsPerMonth !== undefined)  setMealsPerMonth(saved.mealsPerMonth);
    if (saved.hourlyRate !== undefined)     setHourlyRate(saved.hourlyRate);
    if (saved.hoursSpent !== undefined)     setHoursSpent(saved.hoursSpent);
    if (saved.rent !== undefined)           setRent(saved.rent);
    if (saved.utilities !== undefined)      setUtilities(saved.utilities);
    if (saved.tools !== undefined)          setTools(saved.tools);
    if (saved.unitsPerMonth !== undefined)  setUnitsPerMonth(saved.unitsPerMonth);
    if (saved.quantity)       setQuantity(saved.quantity);
    if (saved.marginPct)      setMarginPct(saved.marginPct);
    if (saved.discountPct !== undefined)    setDiscountPct(saved.discountPct);
    if (saved.taxPct !== undefined)         setTaxPct(saved.taxPct);
    if (saved.products)       setProducts(saved.products);
  };

  // ── Load from localStorage on mount ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) applyData(JSON.parse(raw));
    } catch (e) {}
    setLoaded(true);
  }, []);

  // ── LOCAL STORAGE: Save ──
  const handleLocalSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getSnapshot()));
      showToast("✓ Saved to local storage!", "success");
    } catch (e) {
      showToast("Failed to save to local storage.", "error");
    }
  };

  // ── LOCAL STORAGE: Load ──
  const handleLocalLoad = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { showToast("No saved data found in local storage.", "info"); return; }
      const saved = JSON.parse(raw);
      applyData(saved);
      const when = saved.savedAt ? new Date(saved.savedAt).toLocaleString() : "unknown time";
      showToast(`✓ Loaded! (saved ${when})`, "success");
    } catch (e) {
      showToast("Failed to load from local storage.", "error");
    }
  };

  // ── LOCAL STORAGE: Clear ──
  const handleLocalClear = () => {
    if (!window.confirm("Clear saved data from local storage?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      showToast("Local storage cleared.", "info");
    } catch (e) {
      showToast("Failed to clear.", "error");
    }
  };

  // ── JSON: Export ──
  const handleExportJSON = () => {
    try {
      const data = JSON.stringify(getSnapshot(), null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `mollys_pricing_${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("✓ JSON file downloaded!", "success");
    } catch (e) {
      showToast("Export failed.", "error");
    }
  };

  // ── JSON: Import ──
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const saved = JSON.parse(ev.target.result);
        applyData(saved);
        showToast(`✓ Imported from ${file.name}`, "success");
      } catch (err) {
        showToast("Invalid JSON file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Reset all ──
  const handleReset = () => {
    if (!window.confirm("Clear all inputs and start fresh?")) return;
    applyData({ ...DEFAULT_STATE, savedAt: null });
    showToast("Reset complete.", "info");
  };

  // ── Calculations ──
  const meals = Math.max(1, parse(mealsPerMonth));
  const matRowPerMeal  = m => parse(m.totalCost) / meals;
  const materialTotal  = materials.reduce((s, m) => s + parse(m.totalCost), 0);
  const materialPerMeal = materials.reduce((s, m) => s + matRowPerMeal(m), 0);
  const laborTotal     = parse(hourlyRate) * parse(hoursSpent);
  const monthlyOverhead = parse(rent) + parse(utilities) + parse(tools);
  const overheadPerUnit = parse(unitsPerMonth) > 0 ? monthlyOverhead / parse(unitsPerMonth) : 0;
  const costPerUnit    = materialPerMeal + laborTotal + overheadPerUnit;
  const marginAmt      = costPerUnit * (parse(marginPct) / 100);
  const priceBeforeDiscount = costPerUnit + marginAmt;
  const discountAmt    = priceBeforeDiscount * (parse(discountPct) / 100);
  const priceAfterDiscount  = priceBeforeDiscount - discountAmt;
  const taxAmt         = priceAfterDiscount * (parse(taxPct) / 100);
  const finalPrice     = priceAfterDiscount + taxAmt;
  const qty            = Math.max(1, parse(quantity));
  const totalRevenue   = finalPrice * qty;
  const totalProfit    = totalRevenue - costPerUnit * qty;
  const profitMarginReal = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const breakEven      = marginAmt > 0 ? Math.ceil(monthlyOverhead / marginAmt) : null;

  const addMaterial    = () => setMaterials(m => [...m, { name: "", totalQty: "", unit: "pc", totalCost: "" }]);
  const removeMaterial = i  => setMaterials(m => m.filter((_, idx) => idx !== i));
  const updateMat      = (i, f, v) => setMaterials(m => m.map((item, idx) => idx === i ? { ...item, [f]: v } : item));

  const handleAddCustomProduct = () => {
    if (!customProduct.trim()) return;
    setProducts(p => [...p, customProduct.trim()]);
    setSelectedProduct(customProduct.trim());
    setCustomProduct(""); setShowCustomInput(false);
  };

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif" }}>
      <div style={{ fontFamily: "'Protest Riot',cursive", fontSize: 24, color: GREEN_DARK }}>Loading…</div>
    </div>
  );

  const toastBg = toast?.type === "success" ? GREEN_DARK : toast?.type === "error" ? RED : "#666";

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "'Nunito',sans-serif", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Protest+Riot&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        input[type=range]{accent-color:${GREEN};width:100%;margin-top:8px}
        select{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235A8A1A' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px !important;}
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
        .grid-stat { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
        .mat-table { width:100%; border-collapse:collapse; }
        .mat-table th { font-size:10px; font-weight:800; color:#5A5850; letter-spacing:1px; text-transform:uppercase; padding:6px 6px; background:#F5F3EC; border-bottom:2px solid #E0DDD0; text-align:left; white-space:nowrap; }
        .mat-table td { padding:5px 3px; border-bottom:1px solid #F0EEE5; vertical-align:middle; }
        .mat-table tr:last-child td { border-bottom:none; }
        .mat-and-chart { display:grid; grid-template-columns:1fr 190px; gap:16px; align-items:start; }
        .storage-btn { padding:10px 14px; border-radius:10px; font-weight:800; font-size:12px; cursor:pointer; border:2px solid; transition:opacity .15s; white-space:nowrap; font-family:'Nunito',sans-serif; }
        .storage-btn:hover { opacity:.85; }
        @media (max-width:600px) {
          .grid-3 { grid-template-columns:1fr 1fr; }
          .grid-2 { grid-template-columns:1fr; }
          .mat-and-chart { grid-template-columns:1fr; }
          .storage-panel-grid { grid-template-columns:1fr !important; }
        }
        @media (min-width:600px) { .grid-stat { grid-template-columns:repeat(4,1fr); } }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toastBg, color: WHITE, padding: "10px 22px", borderRadius: 12, fontWeight: 800, fontSize: 13, zIndex: 999, animation: "fadeUp .25s ease", whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          {toast.msg}
        </div>
      )}

      {/* ── Hidden file input for import ── */}
      <input ref={importRef} type="file" accept=".json" onChange={handleImportJSON} style={{ display: "none" }} />

      {/* ── Header ── */}
      <div style={{ background: WHITE, borderBottom: `4px solid ${GREEN}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontFamily: "'Protest Riot',cursive", fontSize: "clamp(24px,5vw,38px)", color: DARK, lineHeight: 1, animation: "float 3s ease-in-out infinite" }}>Molly's</div>
          <div style={{ fontSize: "clamp(9px,2vw,13px)", fontWeight: 900, color: GREEN_DARK, letterSpacing: 4, textTransform: "uppercase" }}>Crumby Corner</div>
        </div>
        <div style={{ fontFamily: "'Protest Riot',cursive", fontSize: "clamp(14px,3vw,22px)", color: GREEN_DARK }}>Pricing Calculator</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowStoragePanel(v => !v)}
            style={{ padding: "9px 16px", background: showStoragePanel ? GREEN_DARK : GREEN, border: "none", borderRadius: 10, color: WHITE, fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
            💾 Save / Load
          </button>
          <button onClick={handleReset}
            style={{ padding: "9px 14px", background: "#FFF0F0", border: "2px solid #F5C0C0", borderRadius: 10, color: RED, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            🗑 Reset
          </button>
        </div>
      </div>

      {/* ── Storage Panel ── */}
      {showStoragePanel && (
        <div style={{ background: "#1A1A1A", padding: "20px", animation: "slideDown .2s ease", borderBottom: `3px solid ${GREEN}` }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="storage-panel-grid">

            {/* Local Storage */}
            <div style={{ background: "#2A2A2A", borderRadius: 14, padding: "16px", border: "2px solid #3A3A3A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 20 }}>🗄️</span>
                <span style={{ fontFamily: "'Protest Riot',cursive", fontSize: 16, color: WHITE }}>Local Storage</span>
              </div>
              <div style={{ fontSize: 11, color: "#9A9585", marginBottom: 14 }}>
                Stays saved in your browser. Survives tab/browser close. Cleared if you clear browser data.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={handleLocalSave} className="storage-btn" style={{ background: GREEN, borderColor: GREEN_DARK, color: WHITE }}>
                  💾 Save now
                </button>
                <button onClick={handleLocalLoad} className="storage-btn" style={{ background: "#3A3A3A", borderColor: "#555", color: WHITE }}>
                  📂 Load saved
                </button>
                <button onClick={handleLocalClear} className="storage-btn" style={{ background: "transparent", borderColor: "#993333", color: "#FF6B6B" }}>
                  🗑 Clear
                </button>
              </div>
            </div>

            {/* JSON Export / Import */}
            <div style={{ background: "#2A2A2A", borderRadius: 14, padding: "16px", border: "2px solid #3A3A3A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 20 }}>📄</span>
                <span style={{ fontFamily: "'Protest Riot',cursive", fontSize: 16, color: WHITE }}>Export / Import JSON</span>
              </div>
              <div style={{ fontSize: 11, color: "#9A9585", marginBottom: 14 }}>
                Download your data as a file. Share it, back it up, or load it on another device anytime.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={handleExportJSON} className="storage-btn" style={{ background: "#185FA5", borderColor: "#0C447C", color: WHITE }}>
                  ⬇️ Export .json
                </button>
                <button onClick={() => importRef.current?.click()} className="storage-btn" style={{ background: "#3A3A3A", borderColor: "#555", color: WHITE }}>
                  ⬆️ Import .json
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── COGS Bar ── */}
      <div style={{ background: WHITE, borderBottom: "2px solid #E0DDD0", padding: "10px 20px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#9A9585", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Total cost of producing 1 product</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFF0F0", border: "2px solid #F5C0C0", borderRadius: 10, padding: "7px 14px" }}>
          <span style={{ fontFamily: "'Protest Riot',cursive", fontSize: 13, color: "#9A9585" }}>COGS</span>
          <span style={{ fontFamily: "'Protest Riot',cursive", fontSize: 20, color: RED }}>{fmt(costPerUnit)}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#9A9585", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Customer pays</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F0F9E0", border: `2px solid ${GREEN}`, borderRadius: 10, padding: "7px 14px" }}>
            <span style={{ fontFamily: "'Protest Riot',cursive", fontSize: 13, color: GREEN_DARK }}>Price per meal</span>
            <span style={{ fontFamily: "'Protest Riot',cursive", fontSize: 20, color: GREEN_DARK }}>{fmt(finalPrice)}</span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 14px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* STAT CARDS */}
        <div className="grid-stat">
          <StatCard label="Cost / meal (COGS)" value={fmt(costPerUnit)} sub="materials + labor + overhead" />
          <StatCard label="💰 Customer pays" value={fmt(finalPrice)} sub="final price per meal" highlight big />
          <StatCard label="Profit / meal" value={fmt(finalPrice - costPerUnit)} sub={`${profitMarginReal.toFixed(1)}% margin`} />
          <StatCard label={`Total ×${qty} meals`} value={fmt(totalRevenue)} sub={`${fmt(totalProfit)} profit`} />
        </div>

        {/* SELECT PRODUCT */}
        <Section title="Select Product" emoji="🏷️" note="Reminder: Register products in the Products Dashboard.">
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Label>Product</Label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #D8D5C5", borderRadius: 10, fontFamily: "'Nunito',sans-serif", fontSize: 14, color: selectedProduct ? DARK : "#9A9585", background: CREAM, outline: "none" }}>
                <option value="">— Select a product —</option>
                {products.map((p, i) => <option key={i} value={p}>{p}</option>)}
              </select>
            </div>
            <button onClick={() => setShowCustomInput(v => !v)}
              style={{ padding: "10px 16px", border: `2px dashed ${GREEN}`, borderRadius: 10, background: "#F0F9E0", color: GREEN_DARK, fontSize: 12, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
              + New product
            </button>
          </div>
          {showCustomInput && (
            <div style={{ display: "flex", gap: 8 }}>
              <TxtInput value={customProduct} onChange={setCustomProduct} placeholder="Enter new product name…" />
              <button onClick={handleAddCustomProduct} style={{ padding: "8px 16px", background: GREEN, border: "none", borderRadius: 10, color: WHITE, fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>Add</button>
              <button onClick={() => { setShowCustomInput(false); setCustomProduct(""); }} style={{ padding: "8px 12px", background: "#FFF0F0", border: "2px solid #F5C0C0", borderRadius: 10, color: RED, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>✕</button>
            </div>
          )}
        </Section>

        {/* PRICING SETTINGS */}
        <Section title="Pricing Settings" emoji="📊" note="Note: Discount and Sales Tax are optional.">
          <div className="grid-3">
            <div>
              <Label hint={`= ${fmt(marginAmt)}/meal`}>Profit margin %</Label>
              <NumInput suffix="%" value={marginPct} onChange={setMarginPct} />
              <input type="range" min="0" max="100" step="1" value={marginPct} onChange={e => setMarginPct(e.target.value)} />
            </div>
            <div><Label hint="optional">Discount %</Label><NumInput suffix="%" value={discountPct} onChange={setDiscountPct} /></div>
            <div><Label hint="optional">Sales tax %</Label><NumInput suffix="%" value={taxPct} onChange={setTaxPct} /></div>
          </div>
        </Section>

        {/* MATERIAL COST + DONUT */}
        <div className="mat-and-chart">
          <Section title="Material Cost" emoji="🧂" note="List all ingredients purchased this month. Cost per meal is auto-calculated.">
            <div style={{ background: "#F0F9E0", border: `2px solid ${GREEN}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <Label>Meals / products made this month</Label>
                <NumInput suffix="meals" value={mealsPerMonth} onChange={setMealsPerMonth} placeholder="e.g. 300" />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#9A9585", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Material cost per meal</div>
                <div style={{ fontFamily: "'Protest Riot',cursive", fontSize: 24, color: GREEN_DARK }}>{fmt(materialPerMeal)}</div>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="mat-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: 120 }}>Ingredient</th>
                    <th style={{ width: 70 }}>Total Qty</th>
                    <th style={{ width: 72 }}>Unit</th>
                    <th style={{ width: 105 }}>Total Cost</th>
                    <th style={{ width: 100 }}>Cost / Meal</th>
                    <th style={{ width: 32 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, i) => (
                    <tr key={i}>
                      <td><TxtInput value={m.name} onChange={v => updateMat(i, "name", v)} placeholder="e.g. Chicken" small /></td>
                      <td><NumInput value={m.totalQty} onChange={v => updateMat(i, "totalQty", v)} placeholder="0" small /></td>
                      <td>
                        <select value={m.unit} onChange={e => updateMat(i, "unit", e.target.value)}
                          style={{ width: "100%", padding: "6px 8px", border: "2px solid #D8D5C5", borderRadius: 8, fontFamily: "'Nunito',sans-serif", fontSize: 12, color: DARK, background: CREAM, outline: "none" }}>
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "stretch", background: CREAM, border: "2px solid #D8D5C5", borderRadius: 8, overflow: "hidden" }}>
                          <span style={{ padding: "0 5px", fontSize: 11, fontWeight: 700, color: GREEN_DARK, background: "#E8F5D0", borderRight: "1px solid #D8D5C5", display: "flex", alignItems: "center" }}>₱</span>
                          <input type="number" min="0" step="any" value={m.totalCost} placeholder="0" onChange={e => updateMat(i, "totalCost", e.target.value)}
                            style={{ flex: 1, minWidth: 0, padding: "6px 5px", border: "none", background: "transparent", fontFamily: "'Fredoka One',cursive", fontSize: 13, color: DARK, outline: "none", width: "100%" }} />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 13, color: GREEN_DARK, textAlign: "right", background: "#F0F9E0", borderRadius: 6, padding: "4px 8px", whiteSpace: "nowrap" }}>
                          {fmt(matRowPerMeal(m))}
                        </div>
                      </td>
                      <td>
                        {materials.length > 1
                          ? <button onClick={() => removeMaterial(i)} style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #F5C0C0", background: "#FFF0F0", color: RED, fontSize: 15, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                          : <div style={{ width: 28 }} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addMaterial} style={{ padding: "7px 14px", border: `2px dashed ${GREEN}`, borderRadius: 10, background: "#F0F9E0", color: GREEN_DARK, fontSize: 12, fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}>
              + Add ingredient
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <TotalRow label="Total monthly spend" value={fmt(materialTotal)} />
              <TotalRow label="Material cost / meal" value={fmt(materialPerMeal)} />
            </div>
          </Section>
          <div style={{ background: WHITE, border: "2px solid #E0DDD0", borderRadius: 16, padding: "16px" }}>
            <div style={{ fontFamily: "'Protest Riot',cursive", fontSize: 15, color: GREEN_DARK, marginBottom: 12, textAlign: "center" }}>Costing Breakdown</div>
            <DonutChart materialTotal={materialPerMeal} laborTotal={laborTotal} otherTotal={overheadPerUnit} />
          </div>
        </div>

        {/* LABOR */}
        <Section title="Labor / Time Spent" emoji="⏱️">
          <div className="grid-2">
            <div><Label hint="your wage">Hourly rate</Label><NumInput prefix="₱" suffix="/hr" value={hourlyRate} onChange={setHourlyRate} /></div>
            <div><Label hint="per meal/unit">Hours spent</Label><NumInput suffix="hrs" value={hoursSpent} onChange={setHoursSpent} /></div>
          </div>
          <TotalRow label="Labor cost per meal" value={fmt(laborTotal)} />
        </Section>

        {/* OVERHEAD */}
        <Section title="Overhead" emoji="🏠">
          <div className="grid-3">
            <div><Label hint="monthly">Rent</Label><NumInput prefix="₱" value={rent} onChange={setRent} /></div>
            <div><Label hint="monthly">Utilities</Label><NumInput prefix="₱" value={utilities} onChange={setUtilities} /></div>
            <div><Label hint="monthly">Tools & supplies</Label><NumInput prefix="₱" value={tools} onChange={setTools} /></div>
          </div>
          <div>
            <Label hint="to spread overhead cost">Units produced per month</Label>
            <NumInput suffix="units/mo" value={unitsPerMonth} onChange={setUnitsPerMonth} />
          </div>
          <TotalRow label={`Monthly overhead · ${fmt(overheadPerUnit)}/unit`} value={fmt(monthlyOverhead)} />
        </Section>

        {/* QUANTITY */}
        <Section title="Quantity to Sell" emoji="📦">
          <div style={{ maxWidth: 280 }}>
            <Label>Number of units</Label>
            <NumInput suffix="pcs" value={quantity} onChange={setQuantity} placeholder="1" />
          </div>
        </Section>

        {/* BREAKDOWN */}
        <div style={{ background: WHITE, border: `3px solid ${GREEN}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 28px rgba(141,198,63,0.2)" }}>
          <div style={{ background: GREEN, padding: "12px 20px" }}>
            <span style={{ fontFamily: "'Protest Riot',cursive", fontSize: 22, color: WHITE }}>💰 Price Breakdown</span>
          </div>
          <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ background: CREAM, borderRadius: 12, padding: "12px 16px", marginBottom: 12, border: "2px solid #E0DDD0" }}>
              <div style={{ fontFamily: "'Protest Riot',cursive", fontSize: 15, color: GREEN_DARK, marginBottom: 8 }}>Product Costing</div>
              {[
                { label: "Material Cost (per meal)", value: fmt(materialPerMeal) },
                { label: "Labor Cost",               value: fmt(laborTotal) },
                { label: "Other Expenses",            value: fmt(overheadPerUnit) },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? "1px solid #E0DDD0" : "none", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#6B6860" }}>{r.label}</span>
                  <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 14, color: DARK }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#FFF0F0", borderRadius: 8, marginBottom: 8, gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: RED }}>COGS (cost per meal)</span>
              <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: RED, whiteSpace: "nowrap" }}>{fmt(costPerUnit)}</span>
            </div>
            {[
              { label: `Discount (${discountPct}%)`, value: `−${fmt(discountAmt)}`, color: parse(discountPct) > 0 ? RED : "#C0BBAD" },
              { label: `Profit (${marginPct}%)`,     value: fmt(marginAmt),         color: GREEN_DARK },
              { label: `Tax / VAT (${taxPct}%)`,     value: `+${fmt(taxAmt)}`,      color: parse(taxPct) > 0 ? DARK : "#C0BBAD" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #F0EEE5", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#6B6860" }}>{r.label}</span>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 14, color: r.color, whiteSpace: "nowrap" }}>{r.value}</span>
              </div>
            ))}
            <div style={{ background: GREEN, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 8, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Protest Riot',cursive", fontSize: "clamp(16px,4vw,20px)", color: WHITE }}>Customer Pays</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>price per meal</div>
              </div>
              <div style={{ fontFamily: "'Protest Riot',cursive", fontSize: "clamp(28px,8vw,36px)", color: WHITE }}>{fmt(finalPrice)}</div>
            </div>
            {qty > 1 && (
              <div style={{ marginTop: 10, background: CREAM, borderRadius: 12, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "2px solid #D8D5C5", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: DARK }}>×{qty} meals · Total Revenue</div>
                  {breakEven && <div style={{ fontSize: 11, color: "#6B6860", marginTop: 2 }}>Break-even ≈ {breakEven} meals / month</div>}
                </div>
                <div style={{ fontFamily: "'Protest Riot',cursive", fontSize: "clamp(22px,6vw,28px)", color: GREEN_DARK, whiteSpace: "nowrap" }}>{fmt(totalRevenue)}</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}