import { useState, useRef, useLayoutEffect, useMemo, useCallback, memo } from "react";
import {
  DemoLayout,
  ComparePanel,
  CodeBlock,
  LiveArea,
} from "../components/DemoLayout";

function RenderFlash({ count }) {
  const flashRef = useRef(null);

  useLayoutEffect(() => {
    if (count > 0 && flashRef.current) {
      flashRef.current.style.transition = "none";
      flashRef.current.style.background = "var(--red)";
      flashRef.current.style.color = "#fff";
      requestAnimationFrame(() => {
        if (flashRef.current) {
          flashRef.current.style.transition = "background 1s, color 1s";
          flashRef.current.style.background = "var(--surface-2)";
          flashRef.current.style.color = "var(--text-dim)";
        }
      });
    }
  }, [count]);

  return (
    <div ref={flashRef} style={styles.renderCounter}>
      子元件 render: <strong style={{ color: count > 0 ? "var(--red)" : "var(--green)" }}>{count}</strong> 次
    </div>
  );
}

// ========================================
// 沒有優化：每次 parent re-render，child 都會跟著 re-render
// ========================================
let _naiveRenders = 0;
function ExpensiveListNaive({ items, onSelect }) {
  _naiveRenders++;

  return (
    <div>
      <RenderFlash count={_naiveRenders - 1} />
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

function ParentNaive() {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);

  const items = ["Apple", "Banana", "Cherry", "Durian", "Elderberry"];
  const handleSelect = (item) => setSelected(item);

  return (
    <div>
      <div style={styles.counterRow}>
        <button onClick={() => setCount((c) => c + 1)} style={styles.btn}>
          Parent count: {count}
        </button>
        {selected && <span style={styles.selected}>已選: {selected}</span>}
      </div>
      <ExpensiveListNaive items={items} onSelect={handleSelect} />
    </div>
  );
}

// ========================================
// React 18：手動 memo 三件套才能防止不必要 re-render
// ========================================
let _manualRenders = 0;
const ExpensiveListManual = memo(function ExpensiveListManual({ items, onSelect }) {
  _manualRenders++;

  return (
    <div>
      <RenderFlash count={_manualRenders - 1} />
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

function ParentManual() {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);

  const items = useMemo(
    () => ["Apple", "Banana", "Cherry", "Durian", "Elderberry"],
    []
  );
  const handleSelect = useCallback((item) => setSelected(item), []);

  return (
    <div>
      <div style={styles.counterRow}>
        <button onClick={() => setCount((c) => c + 1)} style={styles.btn}>
          Parent count: {count}
        </button>
        {selected && <span style={styles.selected}>已選: {selected}</span>}
      </div>
      <ExpensiveListManual items={items} onSelect={handleSelect} />
    </div>
  );
}

// ========================================
// React 19 + Compiler：跟 naive 一樣的 code，但不會多餘 re-render
// ========================================
let _compiledRenders = 0;
function ExpensiveListCompiled({ items, onSelect }) {
  "use memo";
  _compiledRenders++;

  return (
    <div>
      <RenderFlash count={_compiledRenders - 1} />
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

function ParentCompiled() {
  "use memo";
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);

  const items = ["Apple", "Banana", "Cherry", "Durian", "Elderberry"];
  const handleSelect = (item) => setSelected(item);

  return (
    <div>
      <div style={styles.counterRow}>
        <button onClick={() => setCount((c) => c + 1)} style={styles.btn}>
          Parent count: {count}
        </button>
        {selected && <span style={styles.selected}>已選: {selected}</span>}
      </div>
      <ExpensiveListCompiled items={items} onSelect={handleSelect} />
    </div>
  );
}

export default function DemoCompiler() {
  return (
    <DemoLayout
      title="React Compiler"
      description="React Compiler（原 React Forget）在 build time 自動分析元件，插入等同 useMemo / useCallback / React.memo 的最佳化程式碼。你只需要寫最自然的 React code。"
    >
      <h2 style={styles.h2}>問題：沒有手動 memo 會怎樣？</h2>
      <p style={styles.subDesc}>
        連續點「Parent count」按鈕，觀察子元件的 render 次數。
        沒有任何優化時，<strong>每次 parent re-render 都會連帶子元件 re-render</strong>，
        即使子元件的 props 完全沒變。紅色閃爍 = 不必要的 re-render。
      </p>

      <ComparePanel
        beforeLabel="沒有優化"
        afterLabel="手動 memo（React 18 做法）"
        before={
          <>
            <CodeBlock
              title="程式碼 — 沒有任何優化"
              code={`function Parent() {
  const [count, setCount] = useState(0);

  // 每次 render 都產生新的 array
  const items = ['Apple', 'Banana', 'Cherry'];

  // 每次 render 都產生新的 function
  const handleSelect = (item) => {
    setSelected(item);
  };

  // ❌ items 和 handleSelect 的 reference
  // 每次都不同 → 子元件每次都 re-render
  return <ExpensiveList
    items={items}
    onSelect={handleSelect}
  />;
}`}
            />
            <LiveArea label="連點 Parent count — 觀察紅色閃爍">
              <ParentNaive />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼 — 手動 memo 三件套"
              code={`// memo + useMemo + useCallback
const ExpensiveList = memo(({ items }) => {
  return items.map(item => ...);
});

function Parent() {
  const [count, setCount] = useState(0);

  const items = useMemo(
    () => ['Apple', 'Banana', 'Cherry'],
    [] // deps 手動維護
  );

  const handleSelect = useCallback(
    (item) => setSelected(item),
    [] // deps 手動維護
  );

  // ✅ 手動確保 reference 不變
  // 但要寫很多額外 code...
  return <ExpensiveList
    items={items}
    onSelect={handleSelect}
  />;
}`}
            />
            <LiveArea label="連點 Parent count — 子元件不 re-render">
              <ParentManual />
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <h2 style={styles.h2}>解法：React Compiler 自動優化</h2>
      <p style={styles.subDesc}>
        同樣是最自然的寫法（跟左上角「沒有優化」的 code 一模一樣），但 Compiler 在 build time 自動插入 memoization。
        連點「Parent count」，子元件 <strong>不會 re-render</strong>。
      </p>

      <ComparePanel
        beforeLabel="沒有優化（對照組）"
        afterLabel="React Compiler（同樣的 code）"
        before={
          <>
            <div style={styles.codeBadge}>
              <span style={{ color: "var(--red)" }}>同樣的 code，不同的效能</span>
            </div>
            <CodeBlock
              title="沒有 Compiler"
              code={`function ExpensiveList({ items, onSelect }) {
  return items.map(item => ...);
}

function Parent() {
  const [count, setCount] = useState(0);
  const items = ['Apple', 'Banana', 'Cherry'];
  const handleSelect = (item) => { ... };
  return <ExpensiveList
    items={items}
    onSelect={handleSelect}
  />;
}
// ❌ 沒有 memo → 每次都 re-render`}
            />
            <LiveArea label="子元件每次都 re-render">
              <ParentNaive />
            </LiveArea>
          </>
        }
        after={
          <>
            <div style={styles.codeBadge}>
              <span style={{ color: "var(--green)" }}>一模一樣的 code + Compiler</span>
            </div>
            <CodeBlock
              title="有 Compiler"
              code={`function ExpensiveList({ items, onSelect }) {
  "use memo"; // 或全域啟用就不需要
  return items.map(item => ...);
}

function Parent() {
  "use memo";
  const [count, setCount] = useState(0);
  const items = ['Apple', 'Banana', 'Cherry'];
  const handleSelect = (item) => { ... };
  return <ExpensiveList
    items={items}
    onSelect={handleSelect}
  />;
}
// ✅ Compiler 自動優化 → 不 re-render`}
            />
            <LiveArea label="子元件不 re-render！">
              <ParentCompiled />
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
  renderCounter: {
    fontSize: 12,
    color: "var(--text-dim)",
    marginBottom: 8,
    padding: "6px 10px",
    borderRadius: "var(--radius-sm)",
    background: "var(--surface-2)",
    transition: "background 1s, color 1s",
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
  codeBadge: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
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
