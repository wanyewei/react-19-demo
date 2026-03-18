import { useState, useMemo, useCallback, memo } from "react";
import {
  DemoLayout,
  ComparePanel,
  CodeBlock,
  LiveArea,
} from "../components/DemoLayout";

// ========================================
// React 18：手動 memo 地獄
// ========================================
const ExpensiveListOld = memo(function ExpensiveListOld({ items, onSelect }) {
  const [renderCount, setRenderCount] = useState(0);

  return (
    <div>
      <div style={styles.renderBadge}>
        Render 次數: <strong>{renderCount}</strong>
        <button
          onClick={() => setRenderCount((c) => c + 1)}
          style={styles.smallBtn}
        >
          強制 re-render
        </button>
      </div>
      <div style={styles.list}>
        {items.map((item, i) => (
          <div key={i} style={styles.listItem} onClick={() => onSelect(item)}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
});

function ParentOld() {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);

  const items = useMemo(
    () => ["Apple", "Banana", "Cherry", "Durian", "Elderberry"],
    []
  );

  const handleSelect = useCallback((item) => {
    setSelected(item);
  }, []);

  return (
    <div>
      <div style={styles.counterRow}>
        <button onClick={() => setCount((c) => c + 1)} style={styles.btn}>
          Parent count: {count}
        </button>
        {selected && <span style={styles.selected}>已選: {selected}</span>}
      </div>
      <ExpensiveListOld items={items} onSelect={handleSelect} />
    </div>
  );
}

// ========================================
// React 19 + Compiler：什麼都不用加
// ========================================
function ExpensiveListNew({ items, onSelect }) {
  "use memo";
  const [renderCount, setRenderCount] = useState(0);

  return (
    <div>
      <div style={styles.renderBadge}>
        Render 次數: <strong>{renderCount}</strong>
        <button
          onClick={() => setRenderCount((c) => c + 1)}
          style={styles.smallBtn}
        >
          強制 re-render
        </button>
      </div>
      <div style={styles.list}>
        {items.map((item, i) => (
          <div key={i} style={styles.listItem} onClick={() => onSelect(item)}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ParentNew() {
  "use memo";
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);

  const items = ["Apple", "Banana", "Cherry", "Durian", "Elderberry"];

  const handleSelect = (item) => {
    setSelected(item);
  };

  return (
    <div>
      <div style={styles.counterRow}>
        <button onClick={() => setCount((c) => c + 1)} style={styles.btn}>
          Parent count: {count}
        </button>
        {selected && <span style={styles.selected}>已選: {selected}</span>}
      </div>
      <ExpensiveListNew items={items} onSelect={handleSelect} />
    </div>
  );
}

export default function DemoCompiler() {
  return (
    <DemoLayout
      title="React Compiler"
      description="React Compiler（原 React Forget）在 build time 自動分析元件，插入等同 useMemo / useCallback / React.memo 的最佳化程式碼。你只需要寫最自然的 React code。"
    >
      <ComparePanel
        before={
          <>
            <CodeBlock
              title="程式碼 — 手動優化"
              code={`// React 18: 手動 memo 三件套
const ExpensiveList = memo(({ items, onSelect }) => {
  // 用 memo 包元件防止不必要 re-render
  return items.map(item => ...);
});

function Parent() {
  const [count, setCount] = useState(0);

  // useMemo 確保陣列參考不變
  const items = useMemo(
    () => ['Apple', 'Banana', 'Cherry'],
    []
  );

  // useCallback 確保 callback 參考不變
  const handleSelect = useCallback((item) => {
    setSelected(item);
  }, []);

  return <ExpensiveList
    items={items}
    onSelect={handleSelect}
  />;
}

// 問題：
// 1. 每個元件都要考慮要不要 memo
// 2. 每個 object/array/function 都要考慮
//    useMemo / useCallback
// 3. deps array 容易寫錯
// 4. 過度 memo 反而浪費記憶體`}
            />
            <LiveArea label="Live Demo — 點 count 不會觸發子元件 re-render（因為有 memo）">
              <ParentOld />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼 — Compiler 自動優化"
              code={`// React 19 + Compiler: 寫最自然的 code
function ExpensiveList({ items, onSelect }) {
  // 不需要 memo！
  return items.map(item => ...);
}

function Parent() {
  const [count, setCount] = useState(0);

  // 不需要 useMemo！
  const items = ['Apple', 'Banana', 'Cherry'];

  // 不需要 useCallback！
  const handleSelect = (item) => {
    setSelected(item);
  };

  return <ExpensiveList
    items={items}
    onSelect={handleSelect}
  />;
}

// Compiler 在 build time 自動：
// ✅ 分析哪些值需要 memoize
// ✅ 插入等同 useMemo 的快取
// ✅ 插入等同 useCallback 的快取
// ✅ 自動跳過不必要的 re-render
// ✅ 比手動 memo 更精準`}
            />
            <LiveArea label="Live Demo — 同樣效果，但 code 更乾淨">
              <ParentNew />
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <div style={styles.infoPanel}>
        <h3 style={styles.infoTitle}>如何啟用 React Compiler？</h3>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepNum}>1</div>
            <div>
              <strong>安裝</strong>
              <pre style={styles.cmd}>npm install -D babel-plugin-react-compiler</pre>
            </div>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNum}>2</div>
            <div>
              <strong>設定 Vite</strong>
              <pre style={styles.cmd}>{`// vite.config.js
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});`}</pre>
            </div>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNum}>3</div>
            <div>
              <strong>漸進式採用</strong>
              <p style={styles.stepText}>
                可以先在特定元件加 <code>"use memo"</code> directive 測試，
                確認沒問題再全域啟用。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.infoPanel}>
        <h3 style={styles.infoTitle}>注意事項</h3>
        <ul style={styles.noteList}>
          <li>Compiler 要求你的元件遵守 <strong>Rules of React</strong>（純函式、不可變更新）</li>
          <li>如果有違反規則的 code，Compiler 會跳過該元件（不會報錯）</li>
          <li>推薦先跑 <code>npx react-compiler-healthcheck</code> 檢查專案相容性</li>
          <li>可以搭配 ESLint plugin 確保 code 符合規則</li>
          <li>目前仍在積極演進中，建議先在小範圍試用</li>
        </ul>
      </div>
    </DemoLayout>
  );
}

const styles = {
  h2: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
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
  },
  smallBtn: {
    padding: "2px 8px",
    borderRadius: 4,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text-dim)",
    fontSize: 11,
    cursor: "pointer",
    marginLeft: 8,
  },
  counterRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  selected: {
    fontSize: 13,
    color: "var(--green)",
  },
  renderBadge: {
    fontSize: 12,
    color: "var(--text-dim)",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  listItem: {
    padding: "6px 12px",
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
    fontSize: 13,
    cursor: "pointer",
  },
  infoPanel: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
  },
  steps: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  step: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "var(--accent)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  cmd: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "8px 12px",
    fontSize: 12,
    color: "var(--text)",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    marginTop: 6,
    whiteSpace: "pre-wrap",
    overflowX: "auto",
  },
  stepText: {
    fontSize: 13,
    color: "var(--text-dim)",
    marginTop: 4,
    lineHeight: 1.6,
  },
  noteList: {
    fontSize: 14,
    color: "var(--text-dim)",
    lineHeight: 2,
    paddingLeft: 20,
  },
};
