import { DemoLayout, CodeBlock } from "../components/DemoLayout";

export default function DemoMigration() {
  return (
    <DemoLayout
      title=" 重點回顧"
      description="回顧 React 19 帶來的所有改變，以及如何在團隊中有效運用這些新功能。"
    >
      <h2 style={styles.h2}>功能對照總表</h2>
      <p style={styles.subDesc}>
        一張表看完 React 18 → React 19 的主要變化。
      </p>

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div style={{ ...styles.tableCol, flex: 1.5 }}>功能</div>
          <div style={{ ...styles.tableCol, flex: 2, color: "var(--red)" }}>以前的做法</div>
          <div style={{ ...styles.tableCol, flex: 2, color: "var(--green)" }}>React 19</div>
        </div>
        {[
          { feature: "表單處理", old: "useState + 手動 isPending", now: "useActionState 一個搞定" },
          { feature: "Memoization", old: "useMemo + useCallback + memo", now: "React Compiler 自動處理" },
          { feature: "Ref 傳遞", old: "forwardRef 包裝", now: "ref 直接當 prop" },
          { feature: "樂觀更新", old: "手動管理 + rollback 邏輯", now: "useOptimistic" },
          { feature: "Async 操作", old: "手動 loading state", now: "startTransition(async)" },
          { feature: "讀取 Promise", old: "useEffect + useState", now: "use(promise) + Suspense" },
          { feature: "Context Provider", old: "<Ctx.Provider value={}>", now: "<Ctx value={}>" },
          { feature: "Document <head>", old: "react-helmet 第三方套件", now: "原生 <title>/<meta>" },
          { feature: "錯誤處理", old: "componentDidCatch 而已", now: "3 種 root-level callbacks" },
        
        ].map((row, i) => (
          <div
            key={i}
            style={i % 2 === 0 ? styles.tableRow : { ...styles.tableRow, background: "var(--surface-2)" }}
          >
            <div style={{ ...styles.tableCol, flex: 1.5, fontWeight: 600, color: "var(--text)" }}>
              {row.feature}
            </div>
            <div style={{ ...styles.tableCol, flex: 2 }}>{row.old}</div>
            <div style={{ ...styles.tableCol, flex: 2 }}>{row.now}</div>
          </div>
        ))}
      </div>

      <div style={styles.divider} />

     
    </DemoLayout>
  );
}

const styles = {
  h2: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  subDesc: { color: "var(--text-dim)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 },
  divider: { borderTop: "1px solid var(--border)", margin: "8px 0" },
  table: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    padding: "12px 16px",
    background: "var(--surface-2)",
    fontWeight: 700,
    fontSize: 13,
  },
  tableRow: {
    display: "flex",
    padding: "10px 16px",
    fontSize: 13,
    color: "var(--text-dim)",
    lineHeight: 1.6,
    borderTop: "1px solid var(--border)",
  },
  tableCol: {
    flex: 1,
    paddingRight: 12,
  },
  phaseGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
  },
  phaseCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 20,
    fontSize: 14,
  },
  phaseBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    padding: "3px 12px",
    borderRadius: 99,
    marginBottom: 10,
  },
  phaseDesc: {
    fontSize: 12,
    color: "var(--text-dim)",
    marginTop: 2,
    marginBottom: 12,
  },
  phaseList: {
    fontSize: 13,
    color: "var(--text-dim)",
    lineHeight: 2,
    paddingLeft: 18,
    marginBottom: 12,
  },
  tipGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  tipCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 20,
    fontSize: 14,
  },
  tipIcon: { fontSize: 24, marginBottom: 8 },
  tipText: {
    fontSize: 13,
    color: "var(--text-dim)",
    marginTop: 8,
    lineHeight: 1.7,
  },
  conclusionPanel: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 28,
  },
  conclusionTitle: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 16,
  },
  conclusionText: {
    fontSize: 14,
    color: "var(--text-dim)",
    lineHeight: 1.8,
    marginBottom: 12,
  },
  conclusionHighlight: {
    marginTop: 16,
    padding: "16px 20px",
    background: "var(--surface-2)",
    borderLeft: "4px solid var(--accent)",
    borderRadius: "var(--radius-sm)",
    fontSize: 15,
    fontWeight: 500,
    fontStyle: "italic",
    color: "var(--text)",
    lineHeight: 1.7,
  },
};
