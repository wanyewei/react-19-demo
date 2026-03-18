import { useState, useCallback } from "react";
import {
  DemoLayout,
  ComparePanel,
  CodeBlock,
} from "../components/DemoLayout";

// ========================================
// Ref cleanup function
// ========================================
function RefCleanupDemo() {
  const [show, setShow] = useState(true);
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((msg) =>
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`])
  , []);

  const refCallback = useCallback(() => {
    addLog("ref callback: 元素已掛載");
    return () => {
      addLog("ref cleanup: 元素已移除");
    };
  }, [addLog]);

  return (
    <div>
      <button onClick={() => setShow(!show)} style={styles.btn}>
        {show ? "移除元素" : "加回元素"}
      </button>
      {show && (
        <div
          ref={refCallback}
          style={styles.refBox}
        >
          我有 ref cleanup function
        </div>
      )}
      <div style={styles.logArea}>
        <div style={styles.logTitle}>Console log:</div>
        {logs.map((log, i) => (
          <div key={i} style={styles.logLine}>{log}</div>
        ))}
      </div>
    </div>
  );
}

export default function DemoRefAsProp() {
  return (
    <DemoLayout
      title="ref as prop & Ref Cleanup"
      description="React 19 讓 ref 直接變成一般的 prop，不再需要 forwardRef 包裝。同時 ref callback 新增 cleanup function 支援。"
    >
      <h2 style={styles.h2}>改進 1：ref 直接當 prop</h2>
      <ComparePanel
        before={
          <CodeBlock
            title="程式碼"
            code={`// React 18: 必須用 forwardRef 包裝
const FancyInput = forwardRef(
  function FancyInput({ placeholder }, ref) {
    return <input ref={ref}
      placeholder={placeholder} />;
  }
);

// 每個要轉發 ref 的元件都要包一層
// ref 是「特殊的」，不在 props 裡面`}
          />
        }
        after={
          <CodeBlock
            title="程式碼"
            code={`// React 19: ref 就是普通 prop！
function FancyInput({ placeholder, ref }) {
  return <input ref={ref}
    placeholder={placeholder} />;
}

// ref 直接在 props 中解構
// 不需要 forwardRef 包裝
// 未來 forwardRef 會被 deprecate`}
          />
        }
      />

      <div style={styles.divider} />

      <h2 style={styles.h2}>改進 2：Ref Cleanup Function</h2>
      <p style={styles.subDesc}>
        Ref callback 現在可以回傳一個 cleanup function，類似 <code>useEffect</code> 的 return。
        當元素從 DOM 移除時，cleanup 會自動執行。以前 React 是用 <code>ref(null)</code> 來通知卸載。
      </p>
      <ComparePanel
        before={
          <>
            <CodeBlock
              title="程式碼"
              code={`// React 18: 用 null 來判斷卸載
<div ref={(node) => {
  if (node) {
    console.log('掛載');
  } else {
    console.log('卸載 — ref 收到 null');
  }
}} />

// 問題：邏輯混在一起
// 不像 useEffect 有明確的 cleanup`}
            />
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼"
              code={`// React 19: return cleanup function
<div ref={(node) => {
  console.log('掛載');

  return () => {
    console.log('卸載 — cleanup!');
  };
}} />

// 跟 useEffect 一樣直覺
// 掛載和卸載邏輯分開`}
            />
          </>
        }
      />
      <div style={styles.singlePanel}>
        <div style={styles.tag}>Live Demo</div>
        <p style={styles.demoHint}>點「移除元素」和「加回元素」觀察 console log</p>
        <RefCleanupDemo />
      </div>

      <div style={styles.warningPanel}>
        <div style={styles.warningTitle}>⚠️ React 19 陷阱：inline ref callback 會造成無限迴圈</div>
        <p style={styles.warningDesc}>
          React 19 改變了 ref callback 的行為：當 ref function 的 reference 改變時，React 會先呼叫舊的 cleanup，再呼叫新的 callback。
          如果 cleanup 內呼叫 <code>setState</code>，就會觸發 re-render → 產生新 function → 再次呼叫 cleanup → 無限迴圈。
        </p>
        <CodeBlock
          title="❌ 有問題：每次 render 產生新的 function reference"
          code={`// inline 寫法每次 render 都是新的 function
<div ref={(node) => {
  setState("掛載");      // cleanup 觸發 → setState → re-render
  return () => {
    setState("移除");    // → 產生新 function → 再次觸發 cleanup → 無限迴圈
  };
}} />`}
        />
        <CodeBlock
          title="✅ 正確：useCallback 固定 reference，React 不會重複觸發"
          code={`const refCallback = useCallback((node) => {
  setState("掛載");
  return () => {
    setState("移除");
  };
}, []); // reference 固定 → React 不觸發多餘的 cleanup

<div ref={refCallback} />`}
        />
      </div>
    </DemoLayout>
  );
}

const styles = {
  h2: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  subDesc: { color: "var(--text-dim)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 },
  divider: { borderTop: "1px solid var(--border)", margin: "8px 0" },
  btn: {
    padding: "8px 20px",
    borderRadius: "var(--radius-sm)",
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 4,
  },
  refBox: {
    margin: "12px 0",
    padding: "12px 16px",
    background: "var(--accent)",
    color: "#fff",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    fontWeight: 500,
  },
  logArea: {
    marginTop: 12,
    padding: 12,
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
    maxHeight: 150,
    overflowY: "auto",
  },
  logTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-dim)",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  logLine: {
    fontSize: 12,
    color: "var(--text-dim)",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    lineHeight: 1.8,
  },
  singlePanel: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 24,
    position: "relative",
  },
  tag: {
    position: "absolute",
    top: -10,
    left: 16,
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    background: "var(--green)",
    padding: "3px 12px",
    borderRadius: 99,
  },
  demoHint: {
    fontSize: 13,
    color: "var(--text-dim)",
    marginBottom: 12,
  },
  warningPanel: {
    background: "var(--surface)",
    border: "1px solid var(--yellow, #f59e0b)",
    borderRadius: "var(--radius)",
    padding: 24,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--yellow, #f59e0b)",
    marginBottom: 12,
  },
  warningDesc: {
    fontSize: 14,
    color: "var(--text-dim)",
    lineHeight: 1.7,
    marginBottom: 16,
  },
};
