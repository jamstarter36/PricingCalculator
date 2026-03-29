import { useState } from "react";

const GREEN = "#8DC63F";
const GREEN_DARK = "#5A8A1A";
const RED = "#E8192C";
const CREAM = "#F2F0E8";
const DARK = "#1A1A1A";
const WHITE = "#FFFFFF";

const parse = v => parseFloat(v) || 0;
const fmt = n => `₱${isNaN(n) || !isFinite(n) ? "0.00" : n.toFixed(2)}`;

function Label({ children, hint }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: "#5A5850", letterSpacing: 1, textTransform: "uppercase" }}>{children}</span>
      {hint && <span style={{ fontSize: 11, color: "#9A9585", marginLeft: 6 }}>{hint}</span>}
    </div>
  );
}

function NumInput({ prefix, suffix, value, onChange, placeholder = "0" }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", background: CREAM, border: "2px solid #D8D5C5", borderRadius: 10, overflow: "hidden" }}>
      {prefix && <span style={{ padding: "0 10px", fontSize: 13, fontWeight: 700, color: GREEN_DARK, background: "#E8F5D0", borderRight: "1px solid #D8D5C5", display: "flex", alignItems: "center" }}>{prefix}</span>}
      <input type="number" min="0" step="any" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ flex: 1, minWidth: 0, padding: "10px 10px", border: "none", background: "transparent", fontFamily: "'Fredoka One', cursive", fontSize: 16, color: DARK, outline: "none" }} />
      {suffix && <span style={{ padding: "0 10px", fontSize: 12, color: "#9A9585", display: "flex", alignItems: "center", background: CREAM }}>{suffix}</span>}
    </div>
  );
}

function Section({ title, emoji, children }) {
  return (
    <div style={{ background: WHITE, border: "2px solid #E0DDD0", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ background: CREAM, borderBottom: "2px solid #E0DDD0", padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <span style={{ fontFamily: "'Protest Riot', cursive", fontSize: 18, color: GREEN_DARK }}>{title}</span>
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function TotalRow({ label, value }) {
  return (
    <div style={{ background: "#F0F9E0", border: `1.5px solid ${GREEN}`, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontWeight: 800, fontSize: 13, color: GREEN_DARK }}>{label}</span>
      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: GREEN_DARK }}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, sub, highlight }) {
  return (
    <div style={{ background: highlight ? GREEN : WHITE, border: `2px solid ${highlight ? GREEN_DARK : "#E0DDD0"}`, borderRadius: 14, padding: "14px 16px", boxShadow: highlight ? "0 6px 20px rgba(141,198,63,0.3)" : "none" }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: highlight ? "rgba(255,255,255,0.8)" : "#9A9585", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: 24, color: highlight ? WHITE : GREEN_DARK, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: highlight ? "rgba(255,255,255,0.75)" : "#9A9585", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function PricingCalculator() {
  const [materials, setMaterials] = useState([{ name: "Chicken Wings", cost: "" }]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [hoursSpent, setHoursSpent] = useState("");
  const [rent, setRent] = useState("");
  const [utilities, setUtilities] = useState("");
  const [tools, setTools] = useState("");
  const [unitsPerMonth, setUnitsPerMonth] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [marginPct, setMarginPct] = useState("30");
  const [discountPct, setDiscountPct] = useState("0");
  const [taxPct, setTaxPct] = useState("0");

  const materialTotal = materials.reduce((s, m) => s + parse(m.cost), 0);
  const laborTotal = parse(hourlyRate) * parse(hoursSpent);
  const monthlyOverhead = parse(rent) + parse(utilities) + parse(tools);
  const overheadPerUnit = parse(unitsPerMonth) > 0 ? monthlyOverhead / parse(unitsPerMonth) : 0;
  const costPerUnit = materialTotal + laborTotal + overheadPerUnit;
  const marginAmt = costPerUnit * (parse(marginPct) / 100);
  const priceBeforeDiscount = costPerUnit + marginAmt;
  const discountAmt = priceBeforeDiscount * (parse(discountPct) / 100);
  const priceAfterDiscount = priceBeforeDiscount - discountAmt;
  const taxAmt = priceAfterDiscount * (parse(taxPct) / 100);
  const finalPrice = priceAfterDiscount + taxAmt;
  const qty = Math.max(1, parse(quantity));
  const totalRevenue = finalPrice * qty;
  const totalCost = costPerUnit * qty;
  const totalProfit = totalRevenue - totalCost;
  const profitMarginReal = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const breakEven = marginAmt > 0 ? Math.ceil(monthlyOverhead / marginAmt) : null;

  const addMaterial = () => setMaterials(m => [...m, { name: "", cost: "" }]);
  const removeMaterial = i => setMaterials(m => m.filter((_, idx) => idx !== i));
  const updateMat = (i, f, v) => setMaterials(m => m.map((item, idx) => idx === i ? { ...item, [f]: v } : item));

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "'Nunito', sans-serif", padding: "0 0 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=Protest+Riot&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        input[type=range]{accent-color:${GREEN};width:100%;margin-top:8px}
      `}</style>

      <div style={{ background: WHITE, borderBottom: `4px solid ${GREEN}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: "clamp(24px,5vw,38px)", color: DARK, lineHeight: 1, animation: "float 3s ease-in-out infinite" }}>Molly's</div>
          <div style={{ fontSize: "clamp(9px,2vw,13px)", fontWeight: 900, color: GREEN_DARK, letterSpacing: 4, textTransform: "uppercase" }}>Crumby Corner</div>
        </div>
        <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: "clamp(14px,3vw,22px)", color: GREEN_DARK }}>Pricing Calculator</div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
          <StatCard label="Cost / unit" value={fmt(costPerUnit)} sub="materials + labor + overhead" />
          <StatCard label="Selling price" value={fmt(finalPrice)} sub="after discount & tax" highlight />
          <StatCard label="Profit / unit" value={fmt(finalPrice - costPerUnit)} sub={`${profitMarginReal.toFixed(1)}% margin`} />
          <StatCard label={`Total (×${qty})`} value={fmt(totalRevenue)} sub={`${fmt(totalProfit)} profit`} />
        </div>

        {/* 1. MATERIALS */}
        <Section title="Cost of Materials" emoji="🧂">
          {materials.map((m, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 140px auto", gap: 8, alignItems: "center" }}>
              <input value={m.name} onChange={e => updateMat(i, "name", e.target.value)} placeholder="Ingredient / item"
                style={{ padding: "10px 12px", border: "2px solid #D8D5C5", borderRadius: 10, fontFamily: "'Nunito', sans-serif", fontSize: 14, color: DARK, background: CREAM, outline: "none" }} />
              <div style={{ display: "flex", alignItems: "stretch", background: CREAM, border: "2px solid #D8D5C5", borderRadius: 10, overflow: "hidden" }}>
                <span style={{ padding: "0 8px", fontSize: 13, fontWeight: 700, color: GREEN_DARK, background: "#E8F5D0", borderRight: "1px solid #D8D5C5", display: "flex", alignItems: "center" }}>₱</span>
                <input type="number" min="0" step="any" value={m.cost} placeholder="0" onChange={e => updateMat(i, "cost", e.target.value)}
                  style={{ flex: 1, minWidth: 0, padding: "10px 8px", border: "none", background: "transparent", fontFamily: "'Fredoka One', cursive", fontSize: 15, color: DARK, outline: "none" }} />
              </div>
              {materials.length > 1
                ? <button onClick={() => removeMaterial(i)} style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #F5C0C0", background: "#FFF0F0", color: RED, fontSize: 18, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                : <div style={{ width: 34 }} />}
            </div>
          ))}
          <button onClick={addMaterial} style={{ padding: "9px 16px", border: `2px dashed ${GREEN}`, borderRadius: 10, background: "#F0F9E0", color: GREEN_DARK, fontSize: 13, fontWeight: 800, cursor: "pointer", alignSelf: "flex-start" }}>
            + Add ingredient
          </button>
          <TotalRow label="Materials total" value={fmt(materialTotal)} />
        </Section>

        {/* 2. LABOR */}
        <Section title="Labor / Time Spent" emoji="⏱️">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
            <div>
              <Label hint="your wage">Hourly rate</Label>
              <NumInput prefix="₱" suffix="/hr" value={hourlyRate} onChange={setHourlyRate} />
            </div>
            <div>
              <Label hint="per batch/unit">Hours spent</Label>
              <NumInput suffix="hrs" value={hoursSpent} onChange={setHoursSpent} />
            </div>
          </div>
          <TotalRow label="Labor total" value={fmt(laborTotal)} />
        </Section>

        {/* 3. OVERHEAD */}
        <Section title="Overhead" emoji="🏠">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
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

        {/* 4. QUANTITY + MARGIN + DISCOUNT + TAX */}
        <Section title="Quantity, Margin & Adjustments" emoji="📊">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
            <div>
              <Label>Quantity to sell</Label>
              <NumInput suffix="pcs" value={quantity} onChange={setQuantity} placeholder="1" />
            </div>
            <div>
              <Label hint={`= ${fmt(marginAmt)}/unit`}>Profit margin</Label>
              <NumInput suffix="%" value={marginPct} onChange={setMarginPct} />
              <input type="range" min="0" max="100" step="1" value={marginPct} onChange={e => setMarginPct(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
            <div>
              <Label hint="optional">Discount</Label>
              <NumInput suffix="%" value={discountPct} onChange={setDiscountPct} />
            </div>
            <div>
              <Label hint="optional">Tax / VAT</Label>
              <NumInput suffix="%" value={taxPct} onChange={setTaxPct} />
            </div>
          </div>
        </Section>

        {/* BREAKDOWN */}
        <div style={{ background: WHITE, border: `3px solid ${GREEN}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 28px rgba(141,198,63,0.2)" }}>
          <div style={{ background: GREEN, padding: "12px 20px" }}>
            <span style={{ fontFamily: "'Protest Riot', cursive", fontSize: 22, color: WHITE }}>💰 Price Breakdown</span>
          </div>
          <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { label: "Materials", value: fmt(materialTotal) },
              { label: "Labor", value: fmt(laborTotal) },
              { label: "Overhead / unit", value: fmt(overheadPerUnit) },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #F0EEE5" }}>
                <span style={{ fontSize: 13, color: "#6B6860" }}>{r.label}</span>
                <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 14, color: DARK }}>{r.value}</span>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#F0F9E0", borderRadius: 8, margin: "4px 0" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: GREEN_DARK }}>Cost per unit</span>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: GREEN_DARK }}>{fmt(costPerUnit)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #F0EEE5" }}>
              <span style={{ fontSize: 13, color: "#6B6860" }}>+ Profit margin ({marginPct}%)</span>
              <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 14, color: GREEN_DARK }}>+{fmt(marginAmt)}</span>
            </div>

            {parse(discountPct) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #F0EEE5" }}>
                <span style={{ fontSize: 13, color: "#6B6860" }}>− Discount ({discountPct}%)</span>
                <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 14, color: RED }}>−{fmt(discountAmt)}</span>
              </div>
            )}

            {parse(taxPct) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #F0EEE5" }}>
                <span style={{ fontSize: 13, color: "#6B6860" }}>+ Tax / VAT ({taxPct}%)</span>
                <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 14, color: DARK }}>+{fmt(taxAmt)}</span>
              </div>
            )}

            <div style={{ background: GREEN, borderRadius: 12, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <div>
                <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: 20, color: WHITE }}>Final Selling Price</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>per unit</div>
              </div>
              <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: 36, color: WHITE }}>{fmt(finalPrice)}</div>
            </div>

            {qty > 1 && (
              <div style={{ marginTop: 10, background: CREAM, borderRadius: 12, padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "2px solid #D8D5C5" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: DARK }}>×{qty} units · Total Revenue</div>
                  {breakEven && <div style={{ fontSize: 11, color: "#6B6860", marginTop: 2 }}>Break-even ≈ {breakEven} units / month</div>}
                </div>
                <div style={{ fontFamily: "'Protest Riot', cursive", fontSize: 28, color: GREEN_DARK }}>{fmt(totalRevenue)}</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}