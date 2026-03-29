import { useState, useRef, useEffect } from "react";

const GREEN = "#8DC63F";
const GREEN_DARK = "#5A8A1A";
const RED = "#E8192C";
const CREAM = "#F2F0E8";
const DARK = "#1A1A1A";
const WHITE = "#FFFFFF";

const parse = v => parseFloat(v) || 0;
const fmt = n => `₱${isNaN(n) || !isFinite(n) ? "0.00" : n.toFixed(2)}`;

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
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "#E0DDD0";
      ctx.lineWidth = lineW;
      ctx.stroke();
      ctx.fillStyle = "#9A9585";
      ctx.font = `bold ${size * 0.1}px Nunito, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No data", cx, cy);
      return;
    }

    const segments = [
      { value: materialTotal, color: "#C0392B" },
      { value: laborTotal,    color: "#E8A0A8" },
      { value: otherTotal,    color: "#F5C6CB" },
    ];
    let start = -Math.PI / 2;
    segments.forEach(seg => {
      if (seg.value <= 0) return;
      const sweep = (seg.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + sweep);
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = lineW;
      ctx.stroke();
      start += sweep;
    });

    ctx.fillStyle = DARK;
    ctx.font = `bold ${size * 0.1}px Nunito, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fmt(total), cx, cy);
  }, [materialTotal, laborTotal, otherTotal, total]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <canvas ref={canvasRef} width={160} height={160} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
        {[
          { label: "Materials", color: "#C0392B", value: materialTotal },
          { label: "Labor",     color: "#E8A0A8", value: laborTotal },
          { label: "Other",     color: "#F5C6CB", value: otherTotal },
        ].map((s, i) => (
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
        style={{ flex: 1, minWidth: 0, padding: small ? "6px 6px" : "8px 8px", border: "none", background: "transparent", fontFamily: "'Fredoka One', cursive", fontSize: small ? 13 : 14, color: DARK, outline: "none", width: "100%" }} />
      {suffix && <span style={{ padding: "0 8px", fontSize: 11, color: "#9A9585", display: "flex", alignItems: "center", background: CREAM, whiteSpace: "nowrap" }}>{suffix}</span>}
    </div>
  );
}

function TxtInput({ value, onChange, placeholder, small }) {
  return (
    <input type="text" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: small ? "6px 8px" : "8px 10px", border: "2px solid #D8D5C5", borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontSize: small ? 12 : 13, color: DARK, background: CREAM, outline: "none", boxSizing: "border-box" }} />
  );
}

function Section({ title, emoji, children, note }) {
  return (
    <div style={{ background: WHITE, border: "2px solid #E0DDD0", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ background: CREAM, borderBottom: "2px solid #E0DDD0", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span style={{ fontFamily: "'Protest Riot', cursive", fontSize: 18, color: GREEN_DARK }}>{title}</span>
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
      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: red ? RED : GREEN_DARK, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, sub, highlight }) {
  return (
    <div style={{ background: highlight ? GREEN : WHITE, border: `2px solid ${highlight ? GREEN_DARK : "#E0DDD0"}`, borderRadius: 14, padding: "12px 14px", boxShadow: highlight ? "0 6px 20px rgba(141,198,63,0.3)" : "none", minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: highlight ? "rgba(255,255,255,0.8)" : "#9A9585", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: 22, color: highlight ? WHITE : GREEN_DARK, lineHeight: 1.1, wordBreak: "break-all" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: highlight ? "rgba(255,255,255,0.75)" : "#9A9585", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const DEFAULT_PRODUCTS = ["Chicken Wings"];
const UNITS = ["pc", "kg", "g", "ml", "l", "cup", "tbsp", "tsp", "pack", "dozen"];

// ── Main ─────────────────────────────────────────────────────────────────────
export default function PricingCalculator() {
  const [selectedProduct, setSelectedProduct]   = useState("");
  const [customProduct, setCustomProduct]       = useState("");
  const [showCustomInput, setShowCustomInput]   = useState(false);
  const [products, setProducts]                 = useState(DEFAULT_PRODUCTS);

  // Each row: { name, totalQty, unit, totalCost }
  const [materials, setMaterials] = useState([
    { name: "", totalQty: "", unit: "pc", totalCost: "" },
  ]);

  const [mealsPerMonth, setMealsPerMonth] = useState("");   // how many meals made this month

  const [hourlyRate, setHourlyRate]       = useState("");
  const [hoursSpent, setHoursSpent]       = useState("");
  const [rent, setRent]                   = useState("");
  const [utilities, setUtilities]         = useState("");
  const [tools, setTools]                 = useState("");
  const [unitsPerMonth, setUnitsPerMonth] = useState("");
  const [quantity, setQuantity]           = useState("1");
  const [marginPct, setMarginPct]         = useState("30");
  const [discountPct, setDiscountPct]     = useState("0");
  const [taxPct, setTaxPct]               = useState("0");

  const meals = Math.max(1, parse(mealsPerMonth));

  // cost per meal for each row = totalCost / meals
  const matRowPerMeal = m => {
    const tc = parse(m.totalCost);
    return meals > 0 ? tc / meals : 0;
  };

  const materialTotal   = materials.reduce((s, m) => s + parse(m.totalCost), 0);
  const materialPerMeal = materials.reduce((s, m) => s + matRowPerMeal(m), 0);

  const laborTotal      = parse(hourlyRate) * parse(hoursSpent);
  const monthlyOverhead = parse(rent) + parse(utilities) + parse(tools);
  const overheadPerUnit = parse(unitsPerMonth) > 0 ? monthlyOverhead / parse(unitsPerMonth) : 0;

  const costPerUnit     = materialPerMeal + laborTotal + overheadPerUnit;
  const marginAmt       = costPerUnit * (parse(marginPct) / 100);
  const priceBeforeDiscount = costPerUnit + marginAmt;
  const discountAmt     = priceBeforeDiscount * (parse(discountPct) / 100);
  const priceAfterDiscount  = priceBeforeDiscount - discountAmt;
  const taxAmt          = priceAfterDiscount * (parse(taxPct) / 100);
  const finalPrice      = priceAfterDiscount + taxAmt;
  const qty             = Math.max(1, parse(quantity));
  const totalRevenue    = finalPrice * qty;
  const totalProfit     = totalRevenue - costPerUnit * qty;
  const profitMarginReal = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const breakEven       = marginAmt > 0 ? Math.ceil(monthlyOverhead / marginAmt) : null;

  const addMaterial    = () => setMaterials(m => [...m, { name: "", totalQty: "", unit: "pc", totalCost: "" }]);
  const removeMaterial = i  => setMaterials(m => m.filter((_, idx) => idx !== i));
  const updateMat      = (i, f, v) => setMaterials(m => m.map((item, idx) => idx === i ? { ...item, [f]: v } : item));

  const handleAddCustomProduct = () => {
    if (!customProduct.trim()) return;
    setProducts(p => [...p, customProduct.trim()]);
    setSelectedProduct(customProduct.trim());
    setCustomProduct("");
    setShowCustomInput(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "'Nunito', sans-serif", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Protest+Riot&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        input[type=range]{accent-color:${GREEN};width:100%;margin-top:8px}
        select{-webkit-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%235A8A1A' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px !important;}
        .grid-2    { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid-3    { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .grid-stat { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .mat-table { width: 100%; border-collapse: collapse; }
        .mat-table th { font-size: 10px; font-weight: 800; color: #5A5850; letter-spacing: 1px; text-transform: uppercase; padding: 6px 6px; background: #F5F3EC; border-bottom: 2px solid #E0DDD0; text-align: left; white-space: nowrap; }
        .mat-table td { padding: 5px 3px; border-bottom: 1px solid #F0EEE5; vertical-align: middle; }
        .mat-table tr:last-child td { border-bottom: none; }
        .mat-and-chart { display: grid; grid-template-columns: 1fr 190px; gap: 16px; align-items: start; }
        @media (max-width: 600px) {
          .grid-3        { grid-template-columns: 1fr 1fr; }
          .grid-2        { grid-template-columns: 1fr; }
          .mat-and-chart { grid-template-columns: 1fr; }
        }
        @media (min-width: 600px) {
          .grid-stat { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: WHITE, borderBottom: `4px solid ${GREEN}`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: "clamp(24px,5vw,38px)", color: DARK, lineHeight: 1, animation: "float 3s ease-in-out infinite" }}>Molly's</div>
          <div style={{ fontSize: "clamp(9px,2vw,13px)", fontWeight: 900, color: GREEN_DARK, letterSpacing: 4, textTransform: "uppercase" }}>Crumby Corner</div>
        </div>
        <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: "clamp(14px,3vw,22px)", color: GREEN_DARK }}>Pricing Calculator</div>
      </div>

      {/* ── COGS Bar ── */}
      <div style={{ background: WHITE, borderBottom: "2px solid #E0DDD0", padding: "10px 20px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#9A9585", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Total cost of producing 1 product</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFF0F0", border: "2px solid #F5C0C0", borderRadius: 10, padding: "7px 14px" }}>
          <span style={{ fontFamily: "'Protest Riot', cursive", fontSize: 13, color: "#9A9585" }}>COGS</span>
          <span style={{ fontFamily: "'Protest Riot', cursive", fontSize: 20, color: RED }}>{fmt(costPerUnit)}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#9A9585", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>Sale price for 1 product only</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F0F9E0", border: `2px solid ${GREEN}`, borderRadius: 10, padding: "7px 14px" }}>
            <span style={{ fontFamily: "'Protest Riot', cursive", fontSize: 13, color: GREEN_DARK }}>Selling Price</span>
            <span style={{ fontFamily: "'Protest Riot', cursive", fontSize: 20, color: GREEN_DARK }}>{fmt(finalPrice)}</span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 14px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* STAT CARDS */}
        <div className="grid-stat">
          <StatCard label="Cost / meal" value={fmt(costPerUnit)} sub="materials + labor + overhead" />
          <StatCard label="Selling price" value={fmt(finalPrice)} sub="after discount & tax" highlight />
          <StatCard label="Profit / meal" value={fmt(finalPrice - costPerUnit)} sub={`${profitMarginReal.toFixed(1)}% margin`} />
          <StatCard label={`Total ×${qty}`} value={fmt(totalRevenue)} sub={`${fmt(totalProfit)} profit`} />
        </div>

        {/* SELECT PRODUCT */}
        <Section title="Select Product" emoji="🏷️" note="Reminder: Register products in the Products Dashboard.">
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Label>Product</Label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #D8D5C5", borderRadius: 10, fontFamily: "'Nunito', sans-serif", fontSize: 14, color: selectedProduct ? DARK : "#9A9585", background: CREAM, outline: "none" }}>
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
              <button onClick={() => { setShowCustomInput(false); setCustomProduct(""); }} style={{ padding: "8px 12px", background: "#FFF0F0", border: `2px solid #F5C0C0`, borderRadius: 10, color: RED, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>✕</button>
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
            <div>
              <Label hint="optional">Discount %</Label>
              <NumInput suffix="%" value={discountPct} onChange={setDiscountPct} />
            </div>
            <div>
              <Label hint="optional">Sales tax %</Label>
              <NumInput suffix="%" value={taxPct} onChange={setTaxPct} />
            </div>
          </div>
        </Section>

        {/* MATERIAL COST TABLE + DONUT */}
        <div className="mat-and-chart">
          <Section title="Material Cost" emoji="🧂" note="List all ingredients purchased this month. The cost per meal is auto-calculated.">

            {/* Meals per month input — KEY input */}
            <div style={{ background: "#F0F9E0", border: `2px solid ${GREEN}`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <Label>Meals / products made this month</Label>
                <NumInput suffix="meals" value={mealsPerMonth} onChange={setMealsPerMonth} placeholder="e.g. 200" />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#9A9585", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Material cost per meal</div>
                <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: 24, color: GREEN_DARK }}>{fmt(materialPerMeal)}</div>
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
                      <td><TxtInput value={m.name} onChange={v => updateMat(i, "name", v)} placeholder="e.g. Meat, Salt, Cooking Oil" small /></td>
                      <td><NumInput value={m.totalQty} onChange={v => updateMat(i, "totalQty", v)} placeholder="0" small /></td>
                      <td>
                        <select value={m.unit} onChange={e => updateMat(i, "unit", e.target.value)}
                          style={{ width: "100%", padding: "6px 8px", border: "2px solid #D8D5C5", borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontSize: 12, color: DARK, background: CREAM, outline: "none" }}>
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "stretch", background: CREAM, border: "2px solid #D8D5C5", borderRadius: 8, overflow: "hidden" }}>
                          <span style={{ padding: "0 5px", fontSize: 11, fontWeight: 700, color: GREEN_DARK, background: "#E8F5D0", borderRight: "1px solid #D8D5C5", display: "flex", alignItems: "center" }}>₱</span>
                          <input type="number" min="0" step="any" value={m.totalCost} placeholder="0" onChange={e => updateMat(i, "totalCost", e.target.value)}
                            style={{ flex: 1, minWidth: 0, padding: "6px 5px", border: "none", background: "transparent", fontFamily: "'Fredoka One', cursive", fontSize: 13, color: DARK, outline: "none", width: "100%" }} />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 13, color: GREEN_DARK, textAlign: "right", paddingRight: 4, whiteSpace: "nowrap", background: "#F0F9E0", borderRadius: 6, padding: "4px 8px" }}>
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

            {/* Monthly totals summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <TotalRow label="Total monthly spend" value={fmt(materialTotal)} />
              <TotalRow label="Material cost / meal" value={fmt(materialPerMeal)} />
            </div>
          </Section>

          {/* Donut */}
          <div style={{ background: WHITE, border: "2px solid #E0DDD0", borderRadius: 16, padding: "16px" }}>
            <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: 15, color: GREEN_DARK, marginBottom: 12, textAlign: "center" }}>Costing Breakdown</div>
            <DonutChart materialTotal={materialPerMeal} laborTotal={laborTotal} otherTotal={overheadPerUnit} />
          </div>
        </div>

        {/* LABOR */}
        <Section title="Labor / Time Spent" emoji="⏱️">
          <div className="grid-2">
            <div>
              <Label hint="your wage">Hourly rate</Label>
              <NumInput prefix="₱" suffix="/hr" value={hourlyRate} onChange={setHourlyRate} />
            </div>
            <div>
              <Label hint="per meal/unit">Hours spent</Label>
              <NumInput suffix="hrs" value={hoursSpent} onChange={setHoursSpent} />
            </div>
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
            <span style={{ fontFamily: "'Protest Riot', cursive", fontSize: 22, color: WHITE }}>💰 Price Breakdown</span>
          </div>
          <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 0 }}>

            {/* Product costing */}
            <div style={{ background: CREAM, borderRadius: 12, padding: "12px 16px", marginBottom: 12, border: "2px solid #E0DDD0" }}>
              <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: 15, color: GREEN_DARK, marginBottom: 8 }}>Product Costing</div>
              {[
                { label: "Material Cost (per meal)", value: fmt(materialPerMeal) },
                { label: "Labor Cost",               value: fmt(laborTotal) },
                { label: "Other Expenses",            value: fmt(overheadPerUnit) },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? "1px solid #E0DDD0" : "none", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#6B6860" }}>{r.label}</span>
                  <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 14, color: DARK }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* COGS */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#FFF0F0", borderRadius: 8, marginBottom: 8, gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: RED }}>COGS (cost per meal)</span>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: RED, whiteSpace: "nowrap" }}>{fmt(costPerUnit)}</span>
            </div>

            {/* Adjustments */}
            {[
              { label: `Discount (${discountPct}%)`,  value: `−${fmt(discountAmt)}`, color: parse(discountPct) > 0 ? RED : "#C0BBAD" },
              { label: `Profit (${marginPct}%)`,       value: fmt(marginAmt),         color: GREEN_DARK },
              { label: `Tax / VAT (${taxPct}%)`,       value: `+${fmt(taxAmt)}`,      color: parse(taxPct) > 0 ? DARK : "#C0BBAD" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #F0EEE5", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#6B6860" }}>{r.label}</span>
                <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 14, color: r.color, whiteSpace: "nowrap" }}>{r.value}</span>
              </div>
            ))}

            {/* Final price */}
            <div style={{ background: GREEN, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 8, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: "clamp(16px,4vw,20px)", color: WHITE }}>Final Selling Price</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>per meal / unit</div>
              </div>
              <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: "clamp(28px,8vw,36px)", color: WHITE }}>{fmt(finalPrice)}</div>
            </div>

            {qty > 1 && (
              <div style={{ marginTop: 10, background: CREAM, borderRadius: 12, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "2px solid #D8D5C5", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: DARK }}>×{qty} units · Total Revenue</div>
                  {breakEven && <div style={{ fontSize: 11, color: "#6B6860", marginTop: 2 }}>Break-even ≈ {breakEven} units / month</div>}
                </div>
                <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: "clamp(22px,6vw,28px)", color: GREEN_DARK, whiteSpace: "nowrap" }}>{fmt(totalRevenue)}</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}