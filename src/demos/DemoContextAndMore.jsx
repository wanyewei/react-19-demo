import { useState, createContext, useContext, useDeferredValue } from "react";
import {
  DemoLayout,
  ComparePanel,
  CodeBlock,
  LiveArea,
} from "../components/DemoLayout";

// ========================================
// Context as Provider
// ========================================
const ThemeCtxOld = createContext("light");
const ThemeCtxNew = createContext("light");

function ContextProviderOld() {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeCtxOld.Provider value={theme}>
      <div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={styles.btn}
        >
          切換: {theme}
        </button>
        <ThemeDisplayOld />
      </div>
    </ThemeCtxOld.Provider>
  );
}

function ThemeDisplayOld() {
  const theme = useContext(ThemeCtxOld);
  return (
    <div
      style={{
        ...styles.themeBox,
        background: theme === "dark" ? "#1e293b" : "#eff6ff",
        color: theme === "dark" ? "#93c5fd" : "#1e40af",
      }}
    >
      目前主題: {theme}
    </div>
  );
}

function ContextProviderNew() {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeCtxNew value={theme}>
      <div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={styles.btn}
        >
          切換: {theme}
        </button>
        <ThemeDisplayNew />
      </div>
    </ThemeCtxNew>
  );
}

function ThemeDisplayNew() {
  const theme = useContext(ThemeCtxNew);
  return (
    <div
      style={{
        ...styles.themeBox,
        background: theme === "dark" ? "#1e293b" : "#eff6ff",
        color: theme === "dark" ? "#93c5fd" : "#1e40af",
      }}
    >
      目前主題: {theme}
    </div>
  );
}

// ========================================
// useDeferredValue with initialValue
// ========================================
const allItems = Array.from({ length: 3000 }, (_, i) => `Item ${i + 1}`);

function Remountable({ children }) {
  const [key, setKey] = useState(0);
  return (
    <div>
      <button
        onClick={() => setKey((k) => k + 1)}
        style={styles.remountBtn}
      >
        🔄 重新掛載元件（觀察首次 render）
      </button>
      <div key={key}>{children}</div>
    </div>
  );
}

function SlowItem({ text }) {
  let hash = 0;
  for (let i = 0; i < 9000000; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i % text.length)) | 0;
  }
  return <div style={styles.resultItem} data-h={hash}>{text}</div>;
}

function SearchOld() {
  const [query, setQuery] = useState("Item 1");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  const filtered = allItems.filter((item) =>
    item.toLowerCase().includes(deferredQuery.toLowerCase())
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜尋 3000 筆資料..."
        style={styles.input}
      />
      <div style={styles.deferredBadge}>
        deferredQuery = &quot;<strong>{deferredQuery}</strong>&quot;
      </div>
      <div style={{ ...styles.resultArea, opacity: isStale ? 0.5 : 1 }}>
        <span style={styles.count}>找到 {filtered.length} 筆</span>
        {filtered.slice(0, 50).map((item) => (
          <SlowItem key={item} text={item} />
        ))}
        {filtered.length > 50 && (
          <div style={styles.more}>...還有 {filtered.length - 50} 筆</div>
        )}
      </div>
    </div>
  );
}

function SearchNew() {
  const [query, setQuery] = useState("Item 1");
  const deferredQuery = useDeferredValue(query, "");
  const isStale = query !== deferredQuery;

  const filtered = deferredQuery
    ? allItems.filter((item) =>
        item.toLowerCase().includes(deferredQuery.toLowerCase())
      )
    : [];

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜尋 3000 筆資料..."
        style={styles.input}
      />
      <div style={styles.deferredBadge}>
        deferredQuery = &quot;<strong>{deferredQuery || "(空字串)"}</strong>&quot;
      </div>
      <div style={{ ...styles.resultArea, opacity: isStale ? 0.5 : 1 }}>
        {!deferredQuery ? (
          <div style={styles.placeholder}>
            ⏳ initialValue = &quot;&quot;，首次渲染不處理任何列表 → 超快！
          </div>
        ) : (
          <>
            <span style={styles.count}>找到 {filtered.length} 筆</span>
            {filtered.slice(0, 50).map((item) => (
              <SlowItem key={item} text={item} />
            ))}
            {filtered.length > 50 && (
              <div style={styles.more}>
                ...還有 {filtered.length - 50} 筆
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ========================================
// Document Metadata
// ========================================
function MetadataDemo() {
  const [page, setPage] = useState("首頁");

  return (
    <div>
      <title>React 19 Demo — {page}</title>
      <meta name="description" content={`目前在 ${page}`} />
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["首頁", "關於", "設定"].map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              ...styles.btn,
              background: page === p ? "var(--accent)" : "var(--surface-2)",
            }}
          >
            {p}
          </button>
        ))}
      </div>
      <div style={styles.metaInfo}>
        目前頁面: <strong>{page}</strong>
        <br />
        <span style={styles.hint}>
          打開瀏覽器 DevTools 查看 {"<head>"} 裡面的 {"<title>"} 和 {"<meta>"} 會隨著切換而改變
        </span>
      </div>
    </div>
  );
}

export default function DemoContextAndMore() {
  return (
    <DemoLayout
      title="Context & 其他改進"
      description="React 19 還有許多 DX 改進：Context 可以直接當 Provider、useDeferredValue 支援初始值、原生 Document Metadata 等。"
    >
      <h2 style={styles.h2}>改進 1：{"<Context>"} 直接當 Provider</h2>
      <p style={styles.subDesc}>
        行為完全一樣，但少寫 <code>.Provider</code>。看起來是小事，但乘以整個 codebase 就是可觀的簡化。
        未來 <code>.Provider</code> 會被 deprecate。
      </p>
      <ComparePanel
        before={
          <>
            <CodeBlock
              title="程式碼"
              code={`const ThemeCtx = createContext('light');

// React 18: 要加 .Provider
<ThemeCtx.Provider value={theme}>
  {children}
</ThemeCtx.Provider>

// 多了 .Provider 這個贅字
// 未來 .Provider 會被 deprecate`}
            />
            <LiveArea label="Live Demo">
              <ContextProviderOld />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼"
              code={`const ThemeCtx = createContext('light');

// React 19: 直接用 Context 當 Provider
<ThemeCtx value={theme}>
  {children}
</ThemeCtx>

// 更簡潔！更直覺！
// value 直接傳就好`}
            />
            <LiveArea label="Live Demo">
              <ContextProviderNew />
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <h2 style={styles.h2}>改進 2：useDeferredValue 初始值</h2>
      <p style={styles.subDesc}>
        <code>useDeferredValue</code> 現在支援第二個參數 <code>initialValue</code>。
        第一次 render 使用 initialValue，然後背景 re-render 帶入真正的值。
        下方範例初始 query 為 &quot;Item 1&quot;，每個列表項目刻意阻塞 1ms 模擬昂貴渲染。
        注意觀察 <code>deferredQuery</code> 的值變化。
      </p>
      <ComparePanel
        before={
          <>
            <CodeBlock
              title="程式碼"
              code={`// React 18: 沒有 initialValue
const [query, setQuery] = useState("Item 1");
const deferredQuery = useDeferredValue(query);
// 初次 render → deferredQuery = "Item 1"
// 立刻過濾 + 渲染 50 個 SlowItem → 阻塞！`}
            />
            <LiveArea label="Live Demo — 按重新掛載觀察卡頓">
              <Remountable>
                <SearchOld />
              </Remountable>
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼"
              code={`// React 19: 可以指定初始值
const [query, setQuery] = useState("Item 1");
const deferredQuery = useDeferredValue(query, '');
// 初次 render → deferredQuery = "" → 不渲染列表
// 背景 re-render → deferredQuery = "Item 1"
// 首次渲染幾乎零成本！`}
            />
            <LiveArea label="Live Demo — 按重新掛載觀察差異">
              <Remountable>
                <SearchNew />
              </Remountable>
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <h2 style={styles.h2}>改進 3：原生 Document Metadata</h2>
      <p style={styles.subDesc}>
        在任何元件中直接寫 <code>{"<title>"}</code>、<code>{"<meta>"}</code>、
        <code>{"<link>"}</code>，React 會自動 hoist 到 <code>{"<head>"}</code>。
        簡單場景下不再需要{" "}
        <a href="https://github.com/nfl/react-helmet" target="_blank" rel="noopener noreferrer" style={styles.link}>
          react-helmet
        </a>。
      </p>
      <div style={styles.singlePanel}>
        <div style={styles.tag}>React 19 — Live Demo</div>
        <CodeBlock
          title="程式碼"
          code={`function BlogPost({ post }) {
  return (
    <article>
      {/* 這些會自動被放到 <head> 裡 */}
      <title>{post.title}</title>
      <meta name="author" content="Josh" />
      <link rel="author" href="https://..." />

      <h1>{post.title}</h1>
      <p>...</p>
    </article>
  );
}`}
        />
        <LiveArea label="Live Demo — 切換頁面，觀察瀏覽器分頁標題變化">
          <MetadataDemo />
        </LiveArea>
      </div>
    </DemoLayout>
  );
}

const styles = {
  h2: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  subDesc: { color: "var(--text-dim)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 },
  divider: { borderTop: "1px solid var(--border)", margin: "8px 0" },
  btn: {
    padding: "6px 14px",
    borderRadius: "var(--radius-sm)",
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
    marginBottom: 8,
  },
  themeBox: {
    marginTop: 12,
    padding: "12px 16px",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
    fontWeight: 500,
  },
  resultArea: {
    transition: "opacity 0.15s",
    maxHeight: 360,
    overflowY: "auto",
  },
  deferredBadge: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "var(--accent)",
    background: "var(--surface-2)",
    padding: "4px 10px",
    borderRadius: "var(--radius-sm)",
    marginBottom: 8,
  },
  placeholder: {
    padding: "16px 0",
    fontSize: 13,
    color: "var(--text-dim)",
    fontStyle: "italic",
  },
  remountBtn: {
    padding: "5px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px dashed var(--border)",
    background: "transparent",
    color: "var(--text-dim)",
    fontSize: 12,
    cursor: "pointer",
    marginBottom: 10,
    width: "100%",
  },
  count: {
    fontSize: 12,
    color: "var(--text-dim)",
    display: "block",
    marginBottom: 8,
  },
  resultItem: {
    padding: "4px 0",
    fontSize: 13,
    color: "var(--text-dim)",
    borderBottom: "1px solid var(--border)",
  },
  more: {
    fontSize: 12,
    color: "var(--text-dim)",
    marginTop: 8,
    fontStyle: "italic",
  },
  metaInfo: {
    padding: "12px 16px",
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    color: "var(--text-dim)",
  },
  link: {
    color: "var(--accent)",
    textDecoration: "underline",
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
};
