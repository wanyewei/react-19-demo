import { useState, Component } from "react";
import { DemoLayout, ComparePanel, CodeBlock, LiveArea } from "../components/DemoLayout";

// Error Boundary with new React 19 style callbacks
class NewErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={demoStyles.errorDisplay}>
          <div style={demoStyles.errorIcon}>💥</div>
          <strong>Error Boundary 攔截到錯誤</strong>
          <p style={demoStyles.errorMsg}>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={demoStyles.retryBtn}
          >
            重試
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function BuggyCounter() {
  const [count, setCount] = useState(0);

  if (count === 3) {
    throw new Error("計數器到 3 就壞掉了！這是刻意觸發的錯誤。");
  }

  return (
    <div>
      <div style={demoStyles.counterRow}>
        <button onClick={() => setCount((c) => c + 1)} style={demoStyles.btn}>
          點擊計數: {count}
        </button>
        <span style={demoStyles.hint}>（到 3 會爆炸）</span>
      </div>
    </div>
  );
}

export default function DemoErrorHandling() {
  return (
    <DemoLayout
      title="Error Handling 改進"
      description="React 19 大幅改善了錯誤處理機制。新增 createRoot 層級的 error callback，讓你精確控制不同類型錯誤的處理方式，不再只能依賴 Error Boundary 的 componentDidCatch。"
    >
      <h2 style={styles.h2}>新增 Root 層級 Error Callbacks</h2>
      <p style={styles.subDesc}>
        <code>createRoot</code> 現在支援三個新的 callback，
        讓你根據錯誤的類型分別處理：
      </p>

      <div style={styles.callbackGrid}>
        <div style={styles.callbackCard}>
          <div style={{ ...styles.callbackBadge, background: "var(--orange)" }}>
            onCaughtError
          </div>
          <p style={styles.callbackDesc}>
            當 Error Boundary <strong>成功攔截</strong>錯誤時觸發。
            適合用來記錄已知、已處理的錯誤到 monitoring service。
          </p>
          <CodeBlock
            code={`const root = createRoot(container, {
  onCaughtError: (error, errorInfo) => {
    // Error Boundary 攔截到的錯誤
    // 這些是「已處理」的錯誤
    logToService("caught", error, errorInfo);
  }
});`}
          />
        </div>

        <div style={styles.callbackCard}>
          <div style={{ ...styles.callbackBadge, background: "var(--red)" }}>
            onUncaughtError
          </div>
          <p style={styles.callbackDesc}>
            當錯誤<strong>沒有被任何 Error Boundary 攔截</strong>時觸發。
            這些是會導致整個 app crash 的嚴重錯誤。
          </p>
          <CodeBlock
            code={`const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) => {
    // 沒有 Error Boundary 攔截的錯誤
    // 通常是嚴重的 bug
    alertOncall("uncaught", error, errorInfo);
    showGlobalErrorUI();
  }
});`}
          />
        </div>

        <div style={styles.callbackCard}>
          <div style={{ ...styles.callbackBadge, background: "var(--purple)" }}>
            onRecoverableError
          </div>
          <p style={styles.callbackDesc}>
            當 React <strong>自動恢復</strong>的錯誤發生時觸發（例如 hydration mismatch）。
            React 會嘗試用 client render 修復，但你應該記錄下來事後修正。
          </p>
          <CodeBlock
            code={`const root = hydrateRoot(container, <App />, {
  onRecoverableError: (error, errorInfo) => {
    // Hydration mismatch 等可恢復錯誤
    // React 已自動修復，但應該記錄
    logToService("recoverable", error, errorInfo);
  }
});`}
          />
        </div>
      </div>

      <div style={styles.divider} />

      <h2 style={styles.h2}>Error Boundary — Live Demo</h2>
      <p style={styles.subDesc}>
        下方的計數器到 3 會刻意拋出錯誤。Error Boundary 會攔截它並顯示 fallback UI。
        在 React 19 中，這個被攔截的錯誤會同時觸發 <code>onCaughtError</code> callback。
      </p>

      <ComparePanel
        beforeLabel="沒有 Error Boundary"
        afterLabel="有 Error Boundary"
        before={
          <>
            <CodeBlock
              title="問題"
              code={`// 沒有 Error Boundary 的話
// 任何元件拋出錯誤 → 整個 app 白屏
// React 19 會觸發 onUncaughtError

function App() {
  return <BuggyCounter />;
  // 如果 BuggyCounter 爆炸
  // → 整個 App 消失
  // → 使用者看到空白頁面
}`}
            />
            <LiveArea label="（這邊不敢真的炸，會影響整個頁面）">
              <div style={demoStyles.placeholder}>
                沒有 Error Boundary → 元件錯誤會導致整個 app 白屏
              </div>
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="解法"
              code={`// 用 Error Boundary 包起來
// 錯誤只影響局部，不會白屏

function App() {
  return (
    <ErrorBoundary fallback={<p>出錯了</p>}>
      <BuggyCounter />
    </ErrorBoundary>
  );
  // 如果 BuggyCounter 爆炸
  // → 只有這個區塊顯示 fallback
  // → 其他部分正常運作
  // → onCaughtError 被觸發
}`}
            />
            <LiveArea label="Live Demo — 點到 3 觀察 Error Boundary">
              <NewErrorBoundary>
                <BuggyCounter />
              </NewErrorBoundary>
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <h2 style={styles.h2}>React 18 vs 19：錯誤處理對比</h2>
      <div style={styles.comparisonTable}>
        <div style={styles.tableHeader}>
          <div style={styles.tableCol} />
          <div style={{ ...styles.tableCol, color: "var(--red)" }}>React 18</div>
          <div style={{ ...styles.tableCol, color: "var(--green)" }}>React 19</div>
        </div>
        {[
          {
            feature: "Error Boundary 攔截的錯誤",
            old: "componentDidCatch 處理",
            new: "componentDidCatch + onCaughtError callback",
          },
          {
            feature: "未被攔截的錯誤",
            old: "整個 app crash，console.error",
            new: "onUncaughtError callback 精確處理",
          },
          {
            feature: "Hydration mismatch",
            old: "自動 client render，難以偵測",
            new: "onRecoverableError 明確通知",
          },
          {
            feature: "錯誤分類",
            old: "無法區分錯誤類型",
            new: "三種 callback 分別處理不同類型",
          },
          {
            feature: "錯誤上報",
            old: "需要在每個 Error Boundary 手動加",
            new: "Root 層級統一設定",
          },
        ].map((row, i) => (
          <div key={i} style={i % 2 === 0 ? styles.tableRow : { ...styles.tableRow, background: "var(--surface-2)" }}>
            <div style={{ ...styles.tableCol, fontWeight: 600, color: "var(--text)" }}>
              {row.feature}
            </div>
            <div style={styles.tableCol}>{row.old}</div>
            <div style={styles.tableCol}>{row.new}</div>
          </div>
        ))}
      </div>

      <div style={styles.divider} />

      <div style={styles.summaryPanel}>
        <h3 style={styles.summaryTitle}>最佳實踐建議</h3>
        <div style={styles.tipGrid}>
          <div style={styles.tipCard}>
            <strong>1. 一定要設定 Root callbacks</strong>
            <p style={styles.tipText}>
              在 <code>createRoot</code> 加上三個 error callback，
              統一處理錯誤上報到 Sentry / DataDog 等 monitoring 服務。
            </p>
          </div>
          <div style={styles.tipCard}>
            <strong>2. 關鍵區塊加 Error Boundary</strong>
            <p style={styles.tipText}>
              至少在頁面層級加 Error Boundary，避免單一元件錯誤導致整頁白屏。
              重要功能區塊也建議包起來。
            </p>
          </div>
          <div style={styles.tipCard}>
            <strong>3. 監控 Recoverable Errors</strong>
            <p style={styles.tipText}>
              Hydration mismatch 雖然 React 會自動修復，但代表你的 server / client 
              render 結果不一致，應該記錄並修正。
            </p>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}

const demoStyles = {
  errorDisplay: {
    padding: 20,
    background: "#1c1017",
    border: "1px solid var(--red)",
    borderRadius: "var(--radius-sm)",
    textAlign: "center",
  },
  errorIcon: { fontSize: 32, marginBottom: 8 },
  errorMsg: {
    fontSize: 13,
    color: "var(--red)",
    marginTop: 8,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
  retryBtn: {
    marginTop: 12,
    padding: "6px 16px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: 13,
    cursor: "pointer",
  },
  counterRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  btn: {
    padding: "8px 20px",
    borderRadius: "var(--radius-sm)",
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  hint: {
    fontSize: 12,
    color: "var(--text-dim)",
  },
  placeholder: {
    padding: 20,
    textAlign: "center",
    fontSize: 13,
    color: "var(--text-dim)",
    fontStyle: "italic",
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
  },
};

const styles = {
  h2: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  subDesc: { color: "var(--text-dim)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 },
  divider: { borderTop: "1px solid var(--border)", margin: "8px 0" },
  callbackGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  callbackCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 20,
  },
  callbackBadge: {
    display: "inline-block",
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
    padding: "3px 12px",
    borderRadius: 99,
    marginBottom: 10,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
  callbackDesc: {
    fontSize: 13,
    color: "var(--text-dim)",
    lineHeight: 1.7,
    marginBottom: 12,
  },
  comparisonTable: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1fr",
    padding: "12px 16px",
    background: "var(--surface-2)",
    fontWeight: 700,
    fontSize: 13,
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1fr",
    padding: "10px 16px",
    fontSize: 13,
    color: "var(--text-dim)",
    lineHeight: 1.6,
    borderTop: "1px solid var(--border)",
  },
  tableCol: {},
  summaryPanel: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
  },
  tipGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
  },
  tipCard: {
    background: "var(--surface-2)",
    borderRadius: "var(--radius-sm)",
    padding: 16,
    fontSize: 14,
  },
  tipText: {
    fontSize: 12,
    color: "var(--text-dim)",
    marginTop: 8,
    lineHeight: 1.7,
  },
};
