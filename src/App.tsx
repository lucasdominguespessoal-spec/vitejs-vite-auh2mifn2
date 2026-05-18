import React, { useState, useEffect } from "react";

// Estruturas de dados estritas para o TypeScript com o campo de séries
interface ExerciseData {
  carga: string;
  reps: string;
  series: string;
  obs: string;
}

interface LogEntry {
  id: number;
  date: string;
  treino: string;
  exercises: Record<string, ExerciseData>;
}

const TREINOS: Record<string, string[]> = {
  "UPPER 1": [
    "Puxada Pronada",
    "Supino Inclinado c/ Halteres",
    "Desenvolvimento c/ Halteres",
    "Remada Barra T (pegada aberta)",
    "Crucifixo Articulado",
    "Elevação Lateral c/ Halteres",
    "Rosca Alternada 45°",
    "Tríceps Francês na Polia (corda)",
    "Abdominal na Polia",
  ],
  "LOWER 1": [
    "Cadeira Abdutora",
    "Agachamento Búlgaro no Smith",
    "Agachamento no Smith (Max Amplitude)",
    "Extensão de Panturrilha no Smith",
    "Mesa Flexora",
    "Cadeira Flexora",
    "Leg Press",
    "Prancha Frontal",
  ],
  "UPPER 2": [
    "Puxada Neutra (Triângulo)",
    "Supino Reto na Barra",
    "Remada Baixa",
    "Cross Polia Alta",
    "Barra Fixa",
    "Desenvolvimento Articulado",
    "Elevação Lateral na Polia",
    "Rosca Direta na Barra",
    "Tríceps Corda",
    "Abdominal na Polia",
  ],
  "LOWER 2": [
    "Cadeira Abdutora",
    "Elevação Pélvica",
    "Agachamento Sumô",
    "Stiff na Barra",
    "Flexor de Pé",
    "Panturrilha Sentado",
    "Cadeira Extensora",
    "Prancha Frontal",
  ],
};

const TREINO_KEYS = Object.keys(TREINOS);
const STORAGE_KEY = "jmr_logs_v3";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateLong(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase();
}

function storagGet(): LogEntry[] {
  try {
    const res = localStorage.getItem(STORAGE_KEY);
    return res ? JSON.parse(res) : [];
  } catch {
    return [];
  }
}

function storagSet(logs: LogEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

export default function App() {
  const [screen, setScreen] = useState<string>("home");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTreino, setSelectedTreino] = useState<string>(TREINO_KEYS[0]);
  const [entries, setEntries] = useState<Record<string, ExerciseData>>({});
  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [filterTreino, setFilterTreino] = useState<string>("Todos");
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  useEffect(() => {
    setLogs(storagGet());
    setLoading(false);
  }, []);

  useEffect(() => {
    const blank: Record<string, ExerciseData> = {};
    TREINOS[selectedTreino].forEach((ex) => {
      blank[ex] = { carga: "", reps: "", series: "", obs: "" };
    });
    setEntries(blank);
    setSaved(false);
  }, [selectedTreino]);

  function handleEntry(exercise: string, field: keyof ExerciseData, value: string) {
    setEntries((prev) => ({
      ...prev,
      [exercise]: { ...prev[exercise], [field]: value },
    }));
  }

  function handleSave() {
    setSaving(true);
    const newLog: LogEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      treino: selectedTreino,
      exercises: { ...entries },
    };
    const updated = [newLog, ...logs];
    storagSet(updated);
    setLogs(updated);
    setSaving(false);
    setSaved(true);
  }

  function handleDeleteLog(id: number) {
    const updated = logs.filter((l) => l.id !== id);
    storagSet(updated);
    setLogs(updated);
    if (expandedLog === id) setExpandedLog(null);
  }

  function getLastLog(treino: string) {
    return logs.find((l) => l.treino === treino);
  }

  const filteredLogs =
    filterTreino === "Todos" ? logs : logs.filter((l) => l.treino === filterTreino);

  function goToTreino(treino: string) {
    setSelectedTreino(treino);
    setScreen("register");
  }

  if (loading) {
    return (
      <div style={s.root}>
        <style>{fonts}</style>
        <div style={s.loadingWrap}>
          <span style={s.loadingLogo}>JMR</span>
          <span style={s.loadingText}>CARREGANDO...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      <style>{fonts}</style>

      {/* CABEÇALHO TRAVADO COM SEGURANÇA MÁXIMA DE LARGURA */}
      <div style={s.stickyHeader}>
        <div style={s.header}>
          <div style={s.headerInner}>
            <span style={s.logo}>JMR</span>
            <span style={s.logoSub}>TEAM</span>
          </div>
          <p style={s.headerCaption}>PROTOCOLO LD · TRACKER DE PROGRESSÃO</p>
        </div>

        <nav style={s.nav}>
          {[
            { key: "home", label: "INÍCIO" },
            { key: "register", label: "REGISTRAR" },
            { key: "history", label: "HISTÓRICO" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setScreen(tab.key); setSaved(false); }}
              style={{ ...s.navBtn, ...(screen === tab.key ? s.navBtnActive : {}) }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ÁREA INTERNA RESPONSIVA E SIMÉTRICA */}
      <div style={s.contentScroll}>
        {screen === "home" && (
          <HomeScreen logs={logs} goToTreino={goToTreino} getLastLog={getLastLog} />
        )}
        {screen === "register" && (
          <RegisterScreen
            selectedTreino={selectedTreino}
            setSelectedTreino={setSelectedTreino}
            entries={entries}
            handleEntry={handleEntry}
            handleSave={handleSave}
            saved={saved}
            saving={saving}
            logs={logs}
          />
        )}
        {screen === "history" && (
          <HistoryScreen
            logs={filteredLogs}
            filterTreino={filterTreino}
            setFilterTreino={setFilterTreino}
            expandedLog={expandedLog}
            setExpandedLog={setExpandedLog}
            handleDeleteLog={handleDeleteLog}
          />
        )}
      </div>
    </div>
  );
}

// ─── Sub-Interfaces das Telas ───────────────────────────────────────

interface ScreenProps {
  logs: LogEntry[];
}

interface HomeProps extends ScreenProps {
  goToTreino: (treino: string) => void;
  getLastLog: (treino: string) => LogEntry | undefined;
}

function HomeScreen({ logs, goToTreino, getLastLog }: HomeProps) {
  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>TREINO DE HOJE</p>
      <div style={s.cardGrid}>
        {TREINO_KEYS.map((t) => {
          const last = getLastLog(t);
          return (
            <button key={t} style={s.treinoCard} onClick={() => goToTreino(t)}>
              <span style={s.treinoCardName}>{t}</span>
              <span style={s.treinoCardSub}>{TREINOS[t].length} exercícios</span>
              {last ? (
                <span style={s.treinoCardLast}>Último: {formatDate(last.date)}</span>
              ) : (
                <span style={s.treinoCardNew}>Nunca registrado</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={s.statRow}>
        <div style={s.statBox}>
          <span style={s.statNum}>{logs.length}</span>
          <span style={s.statLabel}>Treinos salvos</span>
        </div>
        <div style={s.statBox}>
          <span style={s.statNum}>{[...new Set(logs.map((l) => l.treino))].length}</span>
          <span style={s.statLabel}>Tipos treinados</span>
        </div>
        <div style={s.statBox}>
          <span style={s.statNum}>{logs.length > 0 ? formatDate(logs[0].date).slice(0, 5) : "—"}</span>
          <span style={s.statLabel}>Último treino</span>
        </div>
      </div>

      <div style={s.motivBox}>
        <p style={s.motivText}>"O SACRIFÍCIO É O INTERVALO ENTRE O OBJETIVO E A GLÓRIA"</p>
      </div>
    </div>
  );
}

interface RegisterProps extends ScreenProps {
  selectedTreino: string;
  setSelectedTreino: (treino: string) => void;
  entries: Record<string, ExerciseData>;
  handleEntry: (exercise: string, field: keyof ExerciseData, value: string) => void;
  handleSave: () => void;
  saved: boolean;
  saving: boolean;
}

function RegisterScreen({ selectedTreino, setSelectedTreino, entries, handleEntry, handleSave, saved, saving, logs }: RegisterProps) {
  const prevLog = logs.find((l) => l.treino === selectedTreino);

  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>REGISTRAR TREINO</p>

      <div style={s.tabRow}>
        {TREINO_KEYS.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTreino(t)}
            style={{ ...s.tabBtn, ...((selectedTreino === t) ? s.tabBtnActive : {}) }}
          >
            {t}
          </button>
        ))}
      </div>

      <p style={s.dateLabel}>{formatDateLong(new Date().toISOString())}</p>

      {prevLog && (
        <div style={s.prevBanner}>
          <span>📋 Última sessão: {formatDate(prevLog.date)} — supere essa!</span>
        </div>
      )}

      <div style={s.exerciseList}>
        {TREINOS[selectedTreino].map((ex, i) => {
          const prev = prevLog?.exercises?.[ex];
          return (
            <div key={ex} style={s.exerciseCard}>
              <div style={s.exHeader}>
                <span style={s.exNum}>{String(i + 1).padStart(2, "0")}</span>
                <span style={s.exName}>{ex.toUpperCase()}</span>
              </div>
              {prev && (
                <div style={s.prevRow}>
                  <span style={s.prevLabel}>Anterior →</span>
                  <span style={s.prevValue}>
                    {prev.carga ? `${prev.carga}kg` : "—"} × {prev.reps || "—"} RM 
                    {prev.series ? ` [${prev.series}s]` : ""}
                    {prev.obs ? ` · ${prev.obs}` : ""}
                  </span>
                </div>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={s.inputRowThreeCols}>
                  <div style={s.inputGroup}>
                    <label style={s.inputLabel}>CARGA (kg)</label>
                    <input
                      style={s.input}
                      type="number"
                      inputMode="decimal"
                      placeholder={prev?.carga || "0"}
                      value={entries[ex]?.carga || ""}
                      onChange={(e) => handleEntry(ex, "carga", e.target.value)}
                    />
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.inputLabel}>REPETIÇÕES</label>
                    <input
                      style={s.input}
                      type="number"
                      inputMode="numeric"
                      placeholder={prev?.reps || "0"}
                      value={entries[ex]?.reps || ""}
                      onChange={(e) => handleEntry(ex, "reps", e.target.value)}
                    />
                  </div>
                  <div style={s.inputGroup}>
                    <label style={s.inputLabel}>SÉRIES</label>
                    <input
                      style={s.input}
                      type="number"
                      inputMode="numeric"
                      placeholder={prev?.series || "0"}
                      value={entries[ex]?.series || ""}
                      onChange={(e) => handleEntry(ex, "series", e.target.value)}
                    />
                  </div>
                </div>
                
                <div style={s.inputGroup}>
                  <label style={s.inputLabel}>OBSERVAÇÃO PERTINENTE</label>
                  <input
                    style={s.input}
                    type="text"
                    placeholder="ex: boa execução, drop set no final..."
                    value={entries[ex]?.obs || ""}
                    onChange={(e) => handleEntry(ex, "obs", e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {saved ? (
        <div style={s.savedBanner}>✅ SESSÃO TÉCNICA SALVA COM SUCESSO!</div>
      ) : (
        <button style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
          {saving ? "PROCESSANDO..." : "CONCLUIR TREINO"}
        </button>
      )}
    </div>
  );
}

interface HistoryProps extends ScreenProps {
  filterTreino: string;
  setFilterTreino: (treino: string) => void;
  expandedLog: number | null;
  setExpandedLog: (id: number | null) => void;
  handleDeleteLog: (id: number) => void;
}

function HistoryScreen({ logs, filterTreino, setFilterTreino, expandedLog, setExpandedLog, handleDeleteLog }: HistoryProps) {
  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>MÉTRICAS HISTÓRICAS</p>

      <div style={s.tabRow}>
        {["Todos", ...TREINO_KEYS].map((t) => (
          <button
            key={t}
            onClick={() => setFilterTreino(t)}
            style={{ ...s.tabBtn, ...((filterTreino === t) ? s.tabBtnActive : {}) }}
          >
            {t === "Todos" ? "TODOS" : t}
          </button>
        ))}
      </div>

      {logs.length === 0 && (
        <div style={s.emptyState}>
          <p style={s.emptyText}>Sem registros técnicos até o momento.</p>
          <p style={s.emptyHype}>VAI LÁ E BOTA CARGA! 💪</p>
        </div>
      )}

      <div style={s.logList}>
        {logs.map((log) => (
          <div key={log.id} style={s.logCard}>
            <div
              style={s.logHeader}
              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
            >
              <div>
                <span style={s.logTreino}>{log.treino}</span>
                <span style={s.logDate}>{formatDate(log.date)}</span>
              </div>
              <span style={s.logChevron}>{expandedLog === log.id ? "▲" : "▼"}</span>
            </div>

            {expandedLog === log.id && (
              <div style={s.logDetail}>
                {Object.entries(log.exercises).map(([ex, data]) => (
                  <div key={ex} style={s.logExRow}>
                    <span style={s.logExName}>{ex.toUpperCase()}</span>
                    <span style={s.logExData}>
                      {data.carga ? `${data.carga}kg` : "—"} × {data.reps || "—"} reps 
                      {data.series ? ` [${data.series}s]` : ""}
                      {data.obs ? <span style={s.logExObs}> · {data.obs}</span> : null}
                    </span>
                  </div>
                ))}
                <button style={s.deleteBtn} onClick={() => {
                  if(window.confirm("Excluir permanentemente este registro técnico?")) handleDeleteLog(log.id);
                }}>
                  DELETAR REGISTRO
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Estilos Corrigidos para Cortar o Zoom do iOS ──────────────────
const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
  
  html { overflow-y: scroll; }
  
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #c0392b; border-radius: 2px; }
  body { background: #0a0a0a; overflow-x: hidden; width: 100%; }
  
  input { outline: none; border: 1px solid #1e1e1e; }
  input:focus { border-color: #c0392b !important; }
  input::placeholder { color: #333; }
`;

const RED = "#c0392b";
const BG = "#0a0a0a";
const CARD = "#111";
const BORDER = "#1e1e1e";
const TEXT = "#e8e8e8";
const MUTED = "#555";

const s: Record<string, React.CSSProperties> = {
  root: { background: BG, minHeight: "100vh", width: "100%", maxWidth: "520px", margin: "0 auto", display: "flex", flexDirection: "column", color: TEXT, fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12 },
  loadingLogo: { fontFamily: "'Bebas Neue', cursive", fontSize: 64, color: RED, letterSpacing: 6 },
  loadingText: { fontSize: 11, letterSpacing: 4, color: MUTED, fontWeight: 600 },

  stickyHeader: { position: "sticky", top: 0, zIndex: 100, background: BG, borderBottom: `1px solid ${BORDER}`, width: "100%" },
  header: { background: "linear-gradient(135deg, #0a0a0a 0%, #1a0505 100%)", padding: "20px 20px 14px", textAlign: "center", width: "100%" },
  headerInner: { display: "flex", alignItems: "baseline", justifyContent: "center", gap: 6 },
  logo: { fontFamily: "'Bebas Neue', cursive", fontSize: 48, color: RED, letterSpacing: 4, lineHeight: 0.9 },
  logoSub: { fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: TEXT, letterSpacing: 6 },
  headerCaption: { fontSize: 10, letterSpacing: 3, color: MUTED, marginTop: 6, fontWeight: 700 },

  nav: { display: "flex", background: "#0d0d0d", width: "100%" },
  navBtn: { flex: 1, background: "none", border: "none", color: MUTED, padding: "14px 0", fontSize: 12, fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, cursor: "pointer", borderBottom: "3px solid transparent", fontWeight: 700 },
  navBtnActive: { color: TEXT, borderBottom: `3px solid ${RED}`, background: "linear-gradient(180deg, transparent 80%, rgba(192,57,43,0.1) 100%)" },

  contentScroll: { padding: "0 16px 40px 16px", width: "100%", flex: 1, display: "flex", flexDirection: "column" },
  section: { paddingTop: 20, width: "100%", flex: 1, display: "flex", flexDirection: "column" },
  sectionTitle: { fontFamily: "'Bebas Neue', cursive", fontSize: 24, letterSpacing: 3, color: TEXT, marginBottom: 18, borderLeft: `3px solid ${RED}`, paddingLeft: 12 },

  cardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 },
  treinoCard: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "16px 14px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: 4 },
  treinoCardName: { fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: TEXT, letterSpacing: 1 },
  treinoCardSub: { fontSize: 12, color: MUTED, fontWeight: 500 },
  treinoCardLast: { fontSize: 10, color: "#27ae60", marginTop: 6, fontWeight: 700, textTransform: "uppercase" },
  treinoCardNew: { fontSize: 10, color: RED, marginTop: 6, fontWeight: 700, textTransform: "uppercase" },

  statRow: { display: "flex", gap: 12, marginBottom: 20 },
  statBox: { flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  statNum: { fontFamily: "'Bebas Neue', cursive", fontSize: 36, color: RED, letterSpacing: 1 },
  statLabel: { fontSize: 10, color: MUTED, textAlign: "center", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 },

  motivBox: { border: `1px solid #1f0808`, borderRadius: 6, padding: "18px 16px", textAlign: "center", background: "#0d0505", marginTop: 12, marginBottom: 20 },
  motivText: { fontFamily: "'Bebas Neue', cursive", fontSize: 16, letterSpacing: 2, color: RED, lineHeight: 1.5 },

  tabRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  tabBtn: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 4, color: MUTED, padding: "6px 12px", fontSize: 12, fontFamily: "'Bebas Neue', cursive", letterSpacing: 1, cursor: "pointer", fontWeight: 700 },
  tabBtnActive: { background: RED, borderColor: RED, color: "#fff" },

  dateLabel: { fontSize: 12, color: RED, marginBottom: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" },
  prevBanner: { background: "rgba(39, 174, 96, 0.05)", border: "1px solid #27ae60", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "#4fa34f", marginBottom: 16, fontWeight: 500 },

  exerciseList: { display: "flex", flexDirection: "column", gap: 12, width: "100%" },
  exerciseCard: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "14px 16px", width: "100%" },
  exHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  exNum: { fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: RED, minWidth: 28 },
  exName: { fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: TEXT, letterSpacing: 1 },
  prevRow: { display: "flex", gap: 6, alignItems: "center", marginBottom: 10, fontSize: 11 },
  prevLabel: { color: MUTED, fontWeight: 600 },
  prevValue: { color: "#999", fontWeight: 600 },
  
  inputRowThreeCols: { display: "flex", gap: 8, width: "100%" },
  inputGroup: { flex: 1, display: "flex", flexDirection: "column", gap: 5 },
  inputLabel: { fontSize: 9, letterSpacing: 1.2, color: MUTED, fontWeight: 800, textTransform: "uppercase" },
  
  // SOLUÇÃO: Fonte em 16px para travar o zoom do Safari + padding compacto para manter a simetria visual de 14px
  input: { background: BG, border: `1px solid ${BORDER}`, borderRadius: 5, color: TEXT, padding: "8px 10px", fontSize: 16, fontFamily: "'DM Sans', sans-serif", width: "100%", fontWeight: 600 },

  saveBtn: { width: "100%", background: RED, border: "none", borderRadius: 6, color: "#fff", padding: "18px", fontFamily: "'Bebas Neue', cursive", fontSize: 20, letterSpacing: 3, cursor: "pointer", marginTop: 10, marginBottom: 20, boxShadow: "0 4px 15px rgba(192,57,43,0.3)" },
  savedBanner: { background: "rgba(39, 174, 96, 0.1)", border: "1px solid #27ae60", borderRadius: 6, padding: "18px", textAlign: "center", color: "#4fa34f", fontFamily: "'Bebas Neue', cursive", fontSize: 18, letterSpacing: 2, marginBottom: 20 },

  emptyState: { textAlign: "center", padding: "80px 0", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  emptyText: { color: MUTED, fontSize: 14, marginBottom: 8 },
  emptyHype: { fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: RED, letterSpacing: 2 },

  logList: { display: "flex", flexDirection: "column", gap: 10, width: "100%" },
  logCard: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden" },
  logHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", cursor: "pointer" },
  logTreino: { fontFamily: "'Bebas Neue', cursive", fontSize: 20, color: TEXT, letterSpacing: 1, display: "block" },
  logDate: { fontSize: 12, color: MUTED, display: "block", marginTop: 2, fontWeight: 500 },
  logChevron: { color: MUTED, fontSize: 12 },
  logDetail: { borderTop: `1px solid ${BORDER}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, background: "#0a0a0a" },
  logExRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, paddingBottom: 10, borderBottom: "1px solid #141414" },
  logExName: { fontSize: 12, color: "#999", flex: 1, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 },
  logExData: { fontSize: 12, color: TEXT, fontWeight: 700, textAlign: "right" },
  logExObs: { color: MUTED, fontWeight: 400 },
  deleteBtn: { background: "rgba(192,57,43,0.05)", border: `1px solid rgba(192,57,43,0.2)`, borderRadius: 4, color: RED, padding: "8px 14px", fontSize: 10, letterSpacing: 1.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, cursor: "pointer", marginTop: 6, alignSelf: "flex-start" },
};