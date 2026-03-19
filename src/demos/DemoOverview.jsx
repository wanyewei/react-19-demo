import { DemoLayout } from "../components/DemoLayout";

const features = [
  {
    category: "新 Hooks & API",
    color: "var(--accent)",
    demo: "startTransition / Actions / useOptimistic / use()",
    items: [
      { name: "startTransition async", desc: "非阻塞渲染 + 支援 async function，自動管理 isPending" },
      { name: "useActionState", desc: "一個 hook 搞定表單 state + pending + action" },
      { name: "useFormStatus", desc: "子元件直接讀取父層 form 的 pending 狀態" },
      { name: "useOptimistic", desc: "樂觀更新，失敗自動 rollback" },
      { name: "use()", desc: "在 render 中讀取 Promise 和 Context，可以放在條件式裡" },
    ],
  },
  {
    category: "DX 改善",
    color: "var(--purple)",
    demo: "ref as prop / Context & 其他改進 / Error Handling",
    items: [
      { name: "ref as prop", desc: "不再需要 forwardRef，ref 就是一般的 prop" },
      { name: "ref cleanup", desc: "ref callback 可以 return cleanup function" },
      { name: "<Context> as Provider", desc: "不用再寫 .Provider，直接當 JSX 用" },
      { name: "useDeferredValue 初始值", desc: "新增第二參數，首次 render 零成本" },
      { name: "Document Metadata", desc: "元件內直接寫 <title>/<meta>，自動 hoist 到 <head>" },
      { name: "Error Handling 改進", desc: "新增 onCaughtError / onUncaughtError / onRecoverableError" },
    ],
  },
  {
    category: "效能 & 編譯",
    color: "var(--green)",
    demo: "React Compiler",
    items: [
      { name: "React Compiler", desc: "Build time 自動 memoization，告別 useMemo / useCallback 地獄" },
    ],
  },
  {
    category: "Server 特性（概念介紹）",
    color: "var(--orange)",
    demo: "Server Components & Actions",
    items: [
      { name: "Server Components", desc: "React 19 正式穩定化；元件在 server 端 render（需 framework 支援）" },
      { name: "Server Actions", desc: '"use server" 讓 client 直接呼叫 server 端函式（需 framework 支援）' },
      { name: "Streaming SSR", desc: "搭配 Suspense 實現漸進式頁面載入（需 framework 支援）" },
    ],
  },
];


export default function DemoOverview() {
  return (
    <DemoLayout
      title="React 19 新功能總覽"
      description="React 19 是自 Hooks (v16.8) 以來最大的一次更新。它不只是加了新 API，更重新定義了 React 的開發模式 — 從手動優化走向自動優化、大幅簡化常見 pattern 的 boilerplate，同時為 Server Components 等新架構奠定基礎（需搭配 Next.js 等 framework）。"
    >

      <h2 style={styles.h2}>功能全景圖</h2>
      <p style={styles.subDesc}>
        點選左側選單的各個 Demo 頁面可以看到每個功能的詳細介紹和互動範例。
      </p>

      <div style={styles.featureGrid}>
        {features.map((group) => (
          <div key={group.category} style={styles.featureGroup}>
            <div style={{ ...styles.groupHeader, borderLeftColor: group.color }}>
              <span style={{ ...styles.groupDot, background: group.color }} />
              {group.category}
            </div>
            <div style={styles.featureList}>
              {group.items.map((item) => (
                <div key={item.name} style={styles.featureItem}>
                  <div style={styles.featureName}>{item.name}</div>
                  <div style={styles.featureDesc}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.divider} />

      <h2 style={styles.h2}>React 19 帶來什麼？</h2>
      <div style={styles.reasonGrid}>
        <div style={styles.reasonCard}>
          <div style={styles.reasonIcon}>🧹</div>
          <strong>更少的 Boilerplate</strong>
          <p style={styles.reasonText}>
            useActionState 取代手動管理 isPending / error / success。
            ref 不再需要 forwardRef。Context 不再需要 .Provider。
          </p>
        </div>
        <div style={styles.reasonCard}>
          <div style={styles.reasonIcon}>⚡</div>
          <strong>自動效能優化</strong>
          <p style={styles.reasonText}>
            React Compiler 在 build time 自動插入 memoization，
            開發者不用再操心 useMemo / useCallback / memo。
          </p>
        </div>
        <div style={styles.reasonCard}>
          <div style={styles.reasonIcon}>🌐</div>
          <strong>Server 架構就緒</strong>
          <p style={styles.reasonText}>
            React 19 定義了 Server Components 和 Server Actions 的底層規範。
            搭配 Next.js 等 framework 可實現 server-side rendering，純 SPA 專案也能享受其他所有新功能。
          </p>
        </div>
        <div style={styles.reasonCard}>
          <div style={styles.reasonIcon}>🛡️</div>
          <strong>更好的錯誤處理</strong>
          <p style={styles.reasonText}>
            新的 error callback API 讓你精確控制錯誤的回報與處理方式，
            不再只有 componentDidCatch。
          </p>
        </div>
      </div>
    </DemoLayout>
  );
}

const styles = {
  h2: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  subDesc: { color: "var(--text-dim)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 },
  divider: { borderTop: "1px solid var(--border)", margin: "8px 0" },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  featureGroup: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  groupHeader: {
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: 700,
    borderLeft: "4px solid",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--surface-2)",
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  featureList: {
    padding: "8px 16px 12px",
  },
  featureItem: {
    padding: "8px 0",
    borderBottom: "1px solid var(--border)",
  },
  featureName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text)",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
  featureDesc: {
    fontSize: 12,
    color: "var(--text-dim)",
    marginTop: 2,
    lineHeight: 1.5,
  },
  reasonGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  reasonCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 20,
    fontSize: 14,
  },
  reasonIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  reasonText: {
    fontSize: 13,
    color: "var(--text-dim)",
    marginTop: 8,
    lineHeight: 1.7,
  },
};
