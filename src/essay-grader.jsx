import { useState, useRef, useEffect } from "react";

// ── i18n ──
const i18n = {
  en: {
    title: "Essay Grader", subtitle: "by Madlen", loadSample: "Load Sample", clear: "Clear",
    studentEssay: "Student Essay", words: "words",
    placeholder: "Paste the student's essay here...",
    gradeBtn: "Grade Essay", analyzing: "Sanatsal zekayla analiz ediliyor...", // Actually wait, analyzing: "Analyzing essay..."
    noEssayTitle: "No essay graded yet",
    noEssayDesc: 'Paste or type a student essay on the left, then click "Grade Essay" to get live AI scores, feedback, and inline corrections.',
    analyzingMsg: "AI is reading and analyzing the essay...",
    overallScore: "Overall Score", teacherSummary: "Teacher Summary",
    inlineCorrections: "Inline Corrections", issuesFound: "issues found",
    suggestedRevision: "Suggested Revision",
    customFocus: "Custom Focus", customFocusLabel: "Teacher's Custom Criteria",
    customPlaceholder: "e.g. Use of relative pronouns, paragraph transitions...",
    customHint: "Add a specific skill or focus area you want evaluated",
    addCriteria: "Add", quickChips: ["Pronoun usage", "Paragraph transitions", "Use of evidence", "Vocabulary range", "Persuasive tone", "Sentence variety"],
    customResult: "Custom Focus Analysis",
    settingsTitle: "AI Configuration", settingsDesc: "Enter your Gemini API key to enable live, unmetered AI grading. Keys are saved securely in your browser's local storage and never sent to our servers.",
    saveKey: "Save Key",
    scores: [
      { label: "Argument & Thesis", max: 10, color: "#FF6B6B" },
      { label: "Evidence & Support", max: 10, color: "#FFA16C" },
      { label: "Clarity & Structure", max: 10, color: "#45B69F" },
      { label: "Grammar & Mechanics", max: 10, color: "#9D74FF" },
    ],
  },
  tr: {
    title: "Kompozisyon Değerlendirici", subtitle: "Madlen", loadSample: "Örnek Yükle", clear: "Temizle",
    studentEssay: "Öğrenci Kompozisyonu", words: "kelime",
    placeholder: "Öğrencinin kompozisyonunu buraya yapıştırın...",
    gradeBtn: "Değerlendir", analyzing: "Yapay zeka değerlendiriyor...",
    noEssayTitle: "Henüz değerlendirme yapılmadı",
    noEssayDesc: 'Sol tarafa öğrenci kompozisyonunu yapıştırın, ardından "Değerlendir" butonuna tıklayarak canlı yapay zeka analizi alın.',
    analyzingMsg: "Yapay zeka kompozisyonu okuyor ve analiz ediyor...",
    overallScore: "Genel Puan", teacherSummary: "Öğretmen Özeti",
    inlineCorrections: "Satır İçi Düzeltmeler", issuesFound: "sorun bulundu",
    suggestedRevision: "Önerilen Düzeltme",
    customFocus: "Özel Odak", customFocusLabel: "Öğretmenin Özel Kriterleri",
    customPlaceholder: "örn. Zamir kullanımı, paragraf geçişleri...",
    customHint: "Değerlendirilmesini istediğiniz belirli bir beceri veya odak alanı ekleyin",
    addCriteria: "Ekle", quickChips: ["Zamir kullanımı", "Paragraf geçişleri", "Kanıt kullanımı", "Kelime çeşitliliği", "İkna edici ton", "Cümle çeşitliliği"],
    customResult: "Özel Odak Analizi",
    settingsTitle: "Yapay Zeka Ayarları", settingsDesc: "Canlı ve sınırsız YZ değerlendirmesi için Gemini API anahtarınızı girin. Anahtarlar tarayıcınızın yerel depolama alanına güvenle kaydedilir ve sunucularımıza gönderilmez.",
    saveKey: "Kaydet",
    scores: [
      { label: "Argüman & Tez", max: 10, color: "#FF6B6B" },
      { label: "Kanıt & Destek", max: 10, color: "#FFA16C" },
      { label: "Açıklık & Yapı", max: 10, color: "#45B69F" },
      { label: "Dilbilgisi & Yazım", max: 10, color: "#9D74FF" },
    ],
  },
};
// Fixing english translation for 'analyzing'
i18n.en.analyzing = "Analyzing essay...";

// ── Samples ──
const SAMPLE_EN = `The industrial revolution was a period of great change in the world. It started in England in the late 1700s and spread to other countries. Many people moved from farms to cities to work in factories. This was a big change for society.

The working conditions in factories was very bad. Children had to work long hours and the pay was very low. There was no safety rules and many workers got injured. The factory owners did not care about the workers health.

However the industrial revolution also brought many good things. New inventions like the steam engine and the spinning jenny made production faster. Transportation improved with railways and steamships. These changes helped the economy grow.

In conclusion the industrial revolution had both positive and negative effects. While it caused suffering for many workers it also led to important technological advances. We can learn from this period of history to make better decisions about technology today.`;

const SAMPLE_TR = `Sanayi devrimi dünyada büyük değişikliklere yol açan bir dönemdir. 1700'lerin sonlarında İngiltere'de başlamış ve diğer ülkelere yayılmıştır. Birçok insan çiftliklerden şehirlere taşınarak fabrikalarda çalışmaya başladı. Bu toplum için büyük bir değişiklikdi.

Fabrikalardaki çalışma koşulları çok kötüydü. Çocuklar uzun saatler çalışmak zorundaydı ve ücretler çok düşüktü. Hiçbir güvenlik kuralı yokdu ve birçok işçi yaralandı. Fabrika sahipleri işçilerin sağlığını umursamıyordu.

Ancak sanayi devrimi birçok iyi şey de getirdi. Buhar makinası ve eğirme makinesi gibi yeni icatlar üretimi hızlandırdı. Demiryolları ve buharlı gemilerle ulaşım gelişti. Bu değişiklikler ekonominin büyümesine yardım etti.

Sonuç olarak sanayi devriminin hem olumlu hemde olumsuz etkileri olmuştur. İşçiler için acıya neden olsa da önemli teknolojik gelişmelere de yol açmıştır. Bu dönemden ders çıkararak teknoloji hakkında daha iyi kararlar verebiliriz.`;

// ── Colors ──
const typeColors = {
  Grammar: { bg: "#FEF2F2", border: "#F87171", text: "#DC2626", glow: "rgba(248, 113, 113, 0.4)" },
  Evidence: { bg: "#FFFBEB", border: "#FBBF24", text: "#D97706", glow: "rgba(251, 191, 36, 0.4)" },
  Clarity: { bg: "#EFF6FF", border: "#60A5FA", text: "#2563EB", glow: "rgba(96, 165, 250, 0.4)" },
  Dilbilgisi: { bg: "#FEF2F2", border: "#F87171", text: "#DC2626", glow: "rgba(248, 113, 113, 0.4)" },
  "Kanıt": { bg: "#FFFBEB", border: "#FBBF24", text: "#D97706", glow: "rgba(251, 191, 36, 0.4)" },
  "Açıklık": { bg: "#EFF6FF", border: "#60A5FA", text: "#2563EB", glow: "rgba(96, 165, 250, 0.4)" },
};

const CUSTOM_COLOR = "#34D399";
const MAIN_GRADIENT = "linear-gradient(135deg, #FF6B6B 0%, #FFA16C 100%)";

// ── Sub-components ──
function ScoreBar({ label, score, max, color }) {
  const pct = (score / max) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600, color: "#1F2937" }}>
        <span>{label}</span>
        <span style={{ color, textShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>{score}<span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>/{max}</span></span>
      </div>
      <div style={{ width: "100%", height: 10, borderRadius: 99, background: "rgba(0,0,0,0.03)", overflow: "hidden", position: "relative", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ 
          width: `${pct}%`, height: "100%", borderRadius: 99, background: color, 
          transition: "width 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s", 
          boxShadow: `0 0 12px ${color}99`, position: "relative"
        }}>
          <div style={{ 
            position: "absolute", top: 0, left: "-100%", right: 0, bottom: 0, 
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)", 
            animation: "shine 2.5s infinite ease-in-out" 
          }} />
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }) {
  const c = typeColors[type] || typeColors.Grammar;
  return (
    <span style={{ 
      display: "inline-block", padding: "4px 12px", borderRadius: 99, fontSize: 11, 
      fontWeight: 700, letterSpacing: "0.04em", background: c.bg, color: c.text, 
      border: `1px solid ${c.border}66`, fontFamily: "'Inter', sans-serif", 
      textTransform: "uppercase", boxShadow: `0 4px 12px ${c.glow}` 
    }}>
      {type}
    </span>
  );
}

// ── Main ──
export default function EssayGrader() {
  const [lang, setLang] = useState("en");
  const [essay, setEssay] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [activeCorrection, setActiveCorrection] = useState(null);
  const [hoveredLine, setHoveredLine] = useState(null);
  
  const [customCriteria, setCustomCriteria] = useState([]);
  const [criteriaInput, setCriteriaInput] = useState("");
  const [showCriteriaPanel, setShowCriteriaPanel] = useState(false);
  
  // API settings
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  const rightPanelRef = useRef(null);
  const correctionRefs = useRef({});

  useEffect(() => {
    const saved = localStorage.getItem("essayGraderApiKey");
    if (saved) setApiKey(saved);
  }, []);

  const t = i18n[lang];

  const handleLangChange = (newLang) => {
    setLang(newLang); setEssay(""); setResults(null); setErrorText(null);
    setActiveCorrection(null); setCustomCriteria([]); setCriteriaInput("");
  };

  const handleAddCriteria = () => {
    const val = criteriaInput.trim();
    if (val && !customCriteria.includes(val) && customCriteria.length < 3) {
      setCustomCriteria([...customCriteria, val]);
      setCriteriaInput("");
    }
  };

  const handleChipClick = (chip) => {
    if (!customCriteria.includes(chip) && customCriteria.length < 3) {
      setCustomCriteria([...customCriteria, chip]);
    }
  };

  const handleRemoveCriteria = (idx) => {
    setCustomCriteria(customCriteria.filter((_, i) => i !== idx));
  };

  const handleGrade = async () => {
    if (!essay.trim()) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setLoading(true); setResults(null); setActiveCorrection(null); setErrorText(null);
    
    try {
      const prompt = `You are an expert ${lang === "en" ? "English" : "Turkish"} essay grader. 
Analyze the following essay. Provide the output STRICTLY as a JSON object with this exact structure:
{
  "summary": "A 3-4 sentence comprehensive teacher summary",
  "scores": {
    "${t.scores[0].label}": (number 1-10),
    "${t.scores[1].label}": (number 1-10),
    "${t.scores[2].label}": (number 1-10),
    "${t.scores[3].label}": (number 1-10)
  },
  "corrections": [
    {
      "line": "exact sub-string directly extracted from the essay containing an error/flaw",
      "type": "${lang === "en" ? 'Grammar" | "Evidence" | "Clarity' : 'Dilbilgisi" | "Kanıt" | "Açıklık'}",
      "fix": "Specific explanation of the issue in ${lang === "en" ? "English" : "Turkish"}",
      "suggestion": "Specific suggested revision in ${lang === "en" ? "English" : "Turkish"}"
    }
  ],
  "customFeedback": {
    ${customCriteria.length > 0 ? customCriteria.map(c => `"${c}": { "score": (number 1-10), "max": 10, "feedback": "Detailed analysis regarding this specific criteria in ${lang === "en" ? "English" : "Turkish"}" }`).join(",\n    ") : `// leave empty if no custom criteria`}
  }
}
RESPOND ENTIRELY IN ${lang === "en" ? "ENGLISH" : "TURKISH"}. MUST BE VALID JSON WITHOUT MARKDOWN BACKTICKS. Extract at least 3-6 primary corrections showing the EXACT line from the essay.

Essay text:
"""
${essay}
"""`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error("API request failed. Please check your API key.");
      const data = await response.json();
      let textResponse = data.candidates[0].content.parts[0].text;
      
      // Cleanup any markdown artifacts just in case
      if (textResponse.startsWith("\`\`\`json")) textResponse = textResponse.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "");
      
      const parsedResults = JSON.parse(textResponse);
      setResults(parsedResults);
    } catch (err) {
      console.error(err);
      setErrorText(lang === "en" ? "Failed to grade essay. Please check your API key and try again." : "Kompozisyon değerlendirilemedi. Lütfen API anahtarınızı kontrol edip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const getRenderScores = () => {
    if (!results || !results.scores) return [];
    return t.scores.map(base => ({
      ...base,
      score: results.scores[base.label] || 5
    }));
  };

  const activeScores = getRenderScores();
  const totalScore = activeScores.reduce((a, s) => a + s.score, 0);
  const totalMax = t.scores.reduce((a, s) => a + s.max, 0);

  const getCustomResults = () => {
    if (!results || !results.customFeedback || customCriteria.length === 0) return [];
    return customCriteria.map((c) => {
      const fb = results.customFeedback[c];
      if (fb) return { criteria: c, ...fb };
      return { criteria: c, score: 5, max: 10, feedback: "Analysis hidden or missing." };
    }).filter(f => !!f);
  };

  const renderEssayWithHighlights = () => {
    if (!results || !results.corrections) return null;
    return essay.split("\n").map((line, lineIdx) => {
      if (line.trim() === "") return <div key={lineIdx} style={{ height: 16 }} />;
      const sentences = line.match(/[^.!?]+[.!?]+/g) || [line];
      return (
        <p key={lineIdx} style={{ margin: "0 0 16px 0", lineHeight: 1.9, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, color: "#1F2937" }}>
          {sentences.map((sentence, sIdx) => {
            const correction = results.corrections.find((c) => sentence.includes(c.line) || c.line.includes(sentence.trim()));
            if (correction) {
              const corrIdx = results.corrections.indexOf(correction);
              const isActive = activeCorrection === corrIdx;
              const isHovered = hoveredLine === corrIdx;
              const c = typeColors[correction.type] || typeColors.Grammar;
              return (
                <span key={sIdx} onClick={() => setActiveCorrection(isActive ? null : corrIdx)} 
                  onMouseEnter={() => setHoveredLine(corrIdx)} onMouseLeave={() => setHoveredLine(null)}
                  style={{ 
                    background: isActive ? c.border + "33" : isHovered ? c.bg : c.bg + "88", 
                    borderBottom: `2.5px solid ${c.border}`, padding: "2px 0", 
                    cursor: "pointer", borderRadius: 4, transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
                    boxShadow: isActive ? `0 0 0 3px ${c.border}44` : "none",
                    position: "relative", zIndex: isActive ? 10 : 1
                  }}>
                  {sentence}
                </span>
              );
            }
            return <span key={sIdx} style={{ opacity: activeCorrection !== null ? 0.6 : 1, transition: "opacity 0.4s" }}>{sentence}</span>;
          })}
        </p>
      );
    });
  };

  return (
    <div style={{ 
      width: "100%", height: "100vh", 
      background: "#fafafa",
      backgroundImage: "radial-gradient(at 20% 30%, hsla(8,100%,74%,0.1) 0px, transparent 60%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.08) 0px, transparent 50%), radial-gradient(at 0% 80%, hsla(330,100%,83%,0.15) 0px, transparent 60%)",
      fontFamily: "'Inter', sans-serif",
      overflow: "hidden", display: "flex", flexDirection: "column"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeInUp 0.2s" }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: "32px 40px", width: 480, maxWidth: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 12px", fontFamily: "'Outfit', sans-serif", fontSize: 24, color: "#1F2937" }}>{t.settingsTitle}</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{t.settingsDesc}</p>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIzaSy..."
              style={{ width: "100%", padding: "14px 18px", borderRadius: 12, border: "1px solid #D1D5DB", fontSize: 16, fontFamily: "monospace", marginBottom: 24, background: "#F9FAFB", outline: "none", boxSizing: "border-box" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => setShowSettings(false)} style={{ padding: "10px 20px", borderRadius: 99, border: "none", background: "transparent", color: "#6B7280", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button className="primary-btn" onClick={() => { localStorage.setItem("essayGraderApiKey", apiKey); setShowSettings(false); }}
                style={{ padding: "10px 24px", borderRadius: 99, border: "none", background: MAIN_GRADIENT, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                {t.saveKey}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glass Header */}
      <div style={{ 
        background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03)",
        padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 100
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ 
            width: 44, height: 44, borderRadius: 14, background: MAIN_GRADIENT, 
            boxShadow: "0 8px 24px rgba(255, 107, 107, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", 
            color: "#fff", fontWeight: 700, fontSize: 20, fontFamily: "'Instrument Serif', serif"
          }}>M</div>
          <div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400, color: "#1F2937" }}>{t.title}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#FF6B6B", marginLeft: 12, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(255, 107, 107, 0.1)", padding: "4px 10px", borderRadius: 99 }}>{t.subtitle}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => setShowSettings(true)} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", opacity: 0.6, marginRight: 8, transition: "opacity 0.2s" }} title="API Settings">⚙️</button>
          <button className="glass-btn" onClick={() => setLang(lang === "en" ? "tr" : "en")} style={{ padding: "10px 20px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, color: "#4B5563", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>{lang === "en" ? "EN" : "TR"}</button>
          <button className="glass-btn" onClick={() => {setEssay(lang === "en" ? SAMPLE_EN : SAMPLE_TR); setResults(null); setErrorText(null);}} style={{ padding: "10px 24px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, color: "#4B5563", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>{t.loadSample}</button>
          <button className="glass-btn" onClick={() => {setEssay(""); setResults(null); setErrorText(null);}} style={{ padding: "10px 24px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600, color: "#4B5563", cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>{t.clear}</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", padding: "24px 40px", gap: 32 }}>
        {/* Left Card */}
        <div className="card-hover" style={{ 
          flex: 1, display: "flex", flexDirection: "column", background: "rgba(255, 255, 255, 0.8)", 
          backdropFilter: "blur(20px)", borderRadius: 28, border: "1px solid rgba(255, 255, 255, 0.9)",
          boxShadow: "0 20px 60px -10px rgba(0,0,0,0.06)", overflow: "hidden"
        }}>
          <div style={{ padding: "24px 32px 20px", borderBottom: "1px solid rgba(0,0,0,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Outfit', sans-serif" }}>{t.studentEssay}</span>
            {essay && <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, background: "rgba(0,0,0,0.04)", padding: "4px 12px", borderRadius: 99 }}>{essay.split(/\s+/).filter(Boolean).length} {t.words}</span>}
          </div>

          <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
            {!results ? (
              <textarea value={essay} onChange={(e) => setEssay(e.target.value)} placeholder={t.placeholder}
                style={{ width: "100%", height: "100%", border: "none", outline: "none", resize: "none", padding: "32px 36px", fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, lineHeight: 1.9, color: "#374151", background: "transparent", boxSizing: "border-box" }} />
            ) : <div style={{ padding: "32px 36px" }}>{renderEssayWithHighlights()}</div>}
          </div>

          {!results && (
            <div style={{ background: "rgba(255,255,255,0.6)", borderTop: "1px solid rgba(0,0,0,0.03)", backdropFilter: "blur(10px)" }}>
              
              {/* Toggle */}
              <button onClick={() => setShowCriteriaPanel(!showCriteriaPanel)}
                style={{ width: "100%", padding: "16px 32px", border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontFamily: "'Outfit', sans-serif", borderBottom: showCriteriaPanel ? "1px solid rgba(0,0,0,0.03)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: customCriteria.length > 0 ? "rgba(52, 211, 153, 0.2)" : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: customCriteria.length > 0 ? CUSTOM_COLOR : "#9CA3AF" }}>
                    {customCriteria.length > 0 ? "✓" : "+"}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: customCriteria.length > 0 ? CUSTOM_COLOR : "#6B7280" }}>
                    {t.customFocusLabel}
                    {customCriteria.length > 0 && <span style={{ fontWeight: 500, color: "#9CA3AF", marginLeft: 8 }}>({customCriteria.length}/3)</span>}
                  </span>
                </div>
                <span style={{ fontSize: 16, color: "#9CA3AF", transform: showCriteriaPanel ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>▾</span>
              </button>

              {/* Criteria Panel */}
              {showCriteriaPanel && (
                <div style={{ padding: "20px 32px 24px", animation: "fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                  <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 14px", lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>{t.customHint}</p>

                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <input
                      value={criteriaInput} onChange={(e) => setCriteriaInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCriteria()}
                      placeholder={t.customPlaceholder} disabled={customCriteria.length >= 3}
                      style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 14, fontFamily: "'Inter', sans-serif", color: "#374151", outline: "none", background: customCriteria.length >= 3 ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.8)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}
                    />
                    <button onClick={handleAddCriteria} disabled={!criteriaInput.trim() || customCriteria.length >= 3}
                      style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: !criteriaInput.trim() || customCriteria.length >= 3 ? "rgba(0,0,0,0.05)" : CUSTOM_COLOR, color: !criteriaInput.trim() || customCriteria.length >= 3 ? "#9CA3AF" : "#fff", fontSize: 14, fontWeight: 700, cursor: !criteriaInput.trim() || customCriteria.length >= 3 ? "default" : "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: !criteriaInput.trim() || customCriteria.length >= 3 ? "none" : `0 4px 12px ${CUSTOM_COLOR}66`, transition: "all 0.2s" }}>
                      {t.addCriteria}
                    </button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: customCriteria.length > 0 ? 16 : 0 }}>
                    {t.quickChips.filter((c) => !customCriteria.includes(c)).slice(0, 6).map((chip) => (
                      <button key={chip} onClick={() => handleChipClick(chip)} disabled={customCriteria.length >= 3}
                        style={{ padding: "6px 14px", borderRadius: 99, border: "1px dashed rgba(0,0,0,0.15)", background: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, color: customCriteria.length >= 3 ? "#D1D5DB" : "#6B7280", cursor: customCriteria.length >= 3 ? "default" : "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.2s" }}>
                        + {chip}
                      </button>
                    ))}
                  </div>

                  {customCriteria.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {customCriteria.map((c, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 99, background: "rgba(52, 211, 153, 0.1)", border: `1px solid ${CUSTOM_COLOR}44`, fontSize: 13, fontWeight: 700, color: CUSTOM_COLOR, fontFamily: "'Inter', sans-serif" }}>
                          {c}
                          <span onClick={() => handleRemoveCriteria(i)} style={{ cursor: "pointer", fontSize: 16, lineHeight: 1, color: `${CUSTOM_COLOR}88` }}>×</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {errorText && (
                <div style={{ padding: "16px 32px", borderTop: showCriteriaPanel ? "1px solid rgba(0,0,0,0.03)" : "none", background: "rgba(254, 242, 242, 0.5)" }}>
                  <p style={{ color: "#DC2626", margin: 0, fontSize: 14, fontWeight: 600 }}>{errorText}</p>
                </div>
              )}

              <div style={{ padding: "24px 32px", borderTop: showCriteriaPanel && !errorText ? "1px solid rgba(0,0,0,0.03)" : "none" }}>
                <button className="primary-btn" onClick={handleGrade} disabled={!essay.trim() || loading}
                style={{ 
                  width: "100%", padding: "16px", borderRadius: 16, border: "none", 
                  background: !essay.trim() || loading ? "#E5E7EB" : MAIN_GRADIENT, 
                  color: !essay.trim() || loading ? "#9CA3AF" : "#fff", fontSize: 15, fontWeight: 700, 
                  cursor: !essay.trim() || loading ? "default" : "pointer", fontFamily: "'Outfit', sans-serif"
                }}>
                {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ width: 18, height: 18, border: "3px solid rgba(255,255,255,0.4)", borderTop: "3px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  {t.analyzing}
                </span> : t.gradeBtn}
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Right Card */}
        <div ref={rightPanelRef} style={{ flex: 1, overflow: "auto", paddingRight: 8 }}>
          {!results && !loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", opacity: 0.7 }}>
              <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 24 }}>✨</div>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#374151", margin: "0 0 10px", fontFamily: "'Outfit', sans-serif" }}>{t.noEssayTitle}</p>
              <p style={{ fontSize: 14, color: "#6B7280", maxWidth: 300, lineHeight: 1.7 }}>{t.noEssayDesc}</p>
            </div>
          ) : loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
              <div style={{ width: 60, height: 60, border: "4px solid rgba(255,107,107,0.1)", borderTop: "4px solid #FF6B6B", borderRadius: "50%", animation: "spin 1s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite" }} />
              <p style={{ fontSize: 15, color: "#4B5563", fontWeight: 600, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.02em" }}>{t.analyzingMsg}</p>
            </div>
          ) : (
            <div className="fade-in-up" style={{ paddingBottom: 40, display: "flex", flexDirection: "column", gap: 24 }}>
              
              <div className="glass-card result-card" style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)", borderRadius: 28, padding: "32px", border: "1px solid rgba(255, 255, 255, 0.9)", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Outfit', sans-serif" }}>{t.overallScore}</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 60, fontWeight: 400, color: "#1F2937", lineHeight: 0.8 }}>{totalScore}</span>
                    <span style={{ fontSize: 20, color: "#9CA3AF", fontWeight: 600 }}>/{totalMax}</span>
                  </div>
                </div>
                {activeScores.map((s, i) => <ScoreBar key={i} {...s} />)}
              </div>

              {getCustomResults().length > 0 && (
                <div className="glass-card result-card" style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)", borderRadius: 28, padding: "32px", border: `1px solid ${CUSTOM_COLOR}66`, boxShadow: `0 20px 60px -15px ${CUSTOM_COLOR}22` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 8, background: "rgba(52, 211, 153, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: CUSTOM_COLOR, border: `1px solid ${CUSTOM_COLOR}44` }}>◎</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: CUSTOM_COLOR, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Outfit', sans-serif" }}>{t.customResult}</span>
                  </div>
                  {getCustomResults().map((cr, i) => (
                    <div key={i} style={{ marginBottom: i < getCustomResults().length - 1 ? 24 : 0 }}>
                      <ScoreBar label={cr.criteria} score={cr.score} max={cr.max} color={CUSTOM_COLOR} />
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: "#374151", margin: "8px 0 0", padding: "14px 18px", background: "rgba(52, 211, 153, 0.05)", borderRadius: 12, border: `1px dashed ${CUSTOM_COLOR}44`, fontFamily: "'Inter', sans-serif" }}>
                        {cr.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="glass-card result-card" style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)", borderRadius: 28, padding: "32px", border: "1px solid rgba(255, 255, 255, 0.9)", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.06)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Outfit', sans-serif", display: "block", marginBottom: 16 }}>{t.teacherSummary}</span>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "#374151", margin: 0 }}>{results.summary}</p>
              </div>

              {results.corrections && results.corrections.length > 0 && (
                <div className="glass-card result-card" style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)", borderRadius: 28, padding: "32px", border: "1px solid rgba(255, 255, 255, 0.9)", boxShadow: "0 20px 60px -15px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Outfit', sans-serif" }}>{t.inlineCorrections}</span>
                    <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>{results.corrections.length} {t.issuesFound}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {results.corrections.map((c, i) => {
                      const isActive = activeCorrection === i;
                      const tc = typeColors[c.type] || typeColors.Grammar;
                      return (
                        <div key={i} ref={(el) => (correctionRefs.current[i] = el)} onClick={() => setActiveCorrection(isActive ? null : i)}
                          style={{ 
                            borderRadius: 16, border: `1px solid ${isActive ? tc.border : "rgba(0,0,0,0.05)"}`, 
                            background: isActive ? tc.bg + "cc" : "rgba(255,255,255,0.5)", padding: "18px 20px", 
                            cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            boxShadow: isActive ? `0 10px 25px -5px ${tc.glow}` : "0 4px 10px rgba(0,0,0,0.02)"
                          }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                              <TypeBadge type={c.type} />
                              <span style={{ fontSize: 14, color: "#1F2937", fontWeight: 600, fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic", lineHeight: 1.5 }}>"{c.line}"</span>
                            </div>
                            <span style={{ fontSize: 20, color: "#9CA3AF", transform: isActive ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}>▾</span>
                          </div>
                          {isActive && (
                            <div style={{ animation: "fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards", marginTop: 16 }}>
                              <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.7, margin: "0 0 16px" }}>{c.fix}</p>
                              <div style={{ background: "rgba(255,255,255,0.7)", border: `1px dashed ${tc.border}66`, borderRadius: 12, padding: "14px 18px" }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: tc.text, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>{t.suggestedRevision}</span>
                                <p style={{ fontSize: 15, color: "#1F2937", margin: 0, lineHeight: 1.7, fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 500 }}>{c.suggestion}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shine { 100% { left: 200%; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.6); }

        textarea::placeholder { color: #A1A1AA; font-weight: 400; }
        
        .glass-btn { transition: all 0.3s; }
        .glass-btn:hover { background: rgba(255,255,255,0.9) !important; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.06) !important; }
        
        .primary-btn { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); background-size: 200% auto; }
        .primary-btn:hover:not(:disabled) { background-position: right center; transform: translateY(-2px); box-shadow: 0 12px 24px -6px rgba(255, 107, 107, 0.4) !important; }
        .primary-btn:active:not(:disabled) { transform: translateY(0px); }

        .fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        
        .result-card { transition: transform 0.3s; }
        .result-card:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
