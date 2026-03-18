import { useState, useEffect, Suspense, createContext, use } from "react";
import {
  DemoLayout,
  ComparePanel,
  CodeBlock,
  LiveArea,
} from "../components/DemoLayout";
import { fakeLoadComments } from "../utils/fakeApi";

// ========================================
// React 18：useEffect + useState 載入資料
// ========================================
function CommentsOld() {
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fakeLoadComments()
      .then((data) => {
        if (!cancelled) {
          setComments(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div style={styles.loading}>載入中...</div>;
  if (error) return <div style={styles.error}>錯誤: {error}</div>;

  return (
    <div style={styles.commentList}>
      {comments.map((c) => (
        <div key={c.id} style={styles.comment}>
          <strong>{c.author}</strong>
          <span style={styles.time}>{c.time}</span>
          <p style={styles.commentText}>{c.text}</p>
        </div>
      ))}
    </div>
  );
}

// ========================================
// React 19：use() + Suspense
// ========================================
function CommentsNew({ commentsPromise }) {
  const comments = use(commentsPromise);

  return (
    <div style={styles.commentList}>
      {comments.map((c) => (
        <div key={c.id} style={styles.comment}>
          <strong>{c.author}</strong>
          <span style={styles.time}>{c.time}</span>
          <p style={styles.commentText}>{c.text}</p>
        </div>
      ))}
    </div>
  );
}

function CommentsNewWrapper() {
  const [commentsPromise] = useState(() => fakeLoadComments());

  return (
    <Suspense fallback={<div style={styles.loading}>載入中...</div>}>
      <CommentsNew commentsPromise={commentsPromise} />
    </Suspense>
  );
}

// ========================================
// use() 讀取 Context — 可在條件判斷後使用
// ========================================
const ThemeContext = createContext("light");

function HeadingOld({ children }) {
  // React 18: useContext 必須在最頂層，不能放在 if 後面
  // 即使 children 為空也得呼叫
  return (
    <ThemeContext.Consumer>
      {(theme) => {
        if (!children) return null;
        return (
          <h3
            style={{
              color: theme === "dark" ? "#60a5fa" : "#1e40af",
              background: theme === "dark" ? "#1e293b" : "#eff6ff",
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            {children}
          </h3>
        );
      }}
    </ThemeContext.Consumer>
  );
}

function HeadingNew({ children }) {
  if (!children) return null;

  // React 19: use() 可以在條件判斷之後！
  const theme = use(ThemeContext);
  return (
    <h3
      style={{
        color: theme === "dark" ? "#60a5fa" : "#1e40af",
        background: theme === "dark" ? "#1e293b" : "#eff6ff",
        padding: "8px 16px",
        borderRadius: "var(--radius-sm)",
      }}
    >
      {children}
    </h3>
  );
}

function ContextDemo() {
  const [theme, setTheme] = useState("dark");
  const [showTitle, setShowTitle] = useState(true);

  return (
    <ThemeContext value={theme}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={styles.btn}
        >
          切換主題: {theme}
        </button>
        <button
          onClick={() => setShowTitle(!showTitle)}
          style={styles.btn}
        >
          {showTitle ? "隱藏標題" : "顯示標題"}
        </button>
      </div>
      <HeadingNew>{showTitle ? "我可以在 early return 之後使用 use(Context)！" : null}</HeadingNew>
    </ThemeContext>
  );
}

export default function DemoUseApi() {
  return (
    <DemoLayout
      title="use() API"
      description="use() 是 React 19 新的 API，可以在 render 中讀取 Promise（搭配 Suspense）和 Context。最大特點：它不受 hook 規則限制，可以在條件判斷後呼叫。"
    >
      <h2 style={styles.h2}>用途 1：讀取 Promise（取代 useEffect fetch 模式）</h2>
      <ComparePanel
        before={
          <>
            <CodeBlock
              title="程式碼"
              code={`function Comments() {
  const [comments, setComments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchComments()
      .then(data => {
        if (!cancelled) {
          setComments(data);
          setLoading(false);
        }
      })
      .catch(err => { ... });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤</div>;
  return comments.map(c => ...);
}

// 需要 3 個 useState + useEffect
// 還要處理 race condition (cancelled)`}
            />
            <LiveArea label="Live Demo（重新整理頁面可看載入效果）">
              <CommentsOld />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼"
              code={`function Comments({ commentsPromise }) {
  // 就這麼簡單！
  const comments = use(commentsPromise);
  return comments.map(c => ...);
}

// 父層用 Suspense 包起來
<Suspense fallback={<div>載入中...</div>}>
  <Comments commentsPromise={promise} />
</Suspense>

// 零 useState、零 useEffect
// Suspense 自動處理 loading 狀態
// 注意：promise 要在 render 外建立`}
            />
            <LiveArea label="Live Demo（重新整理頁面可看載入效果）">
              <CommentsNewWrapper />
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <h2 style={styles.h2}>用途 2：條件式讀取 Context</h2>
      <p style={styles.subDesc}>
        <code>useContext</code> 是 hook，必須放在元件最頂層。
        但 <code>use(Context)</code> 可以在 <code>if</code> 後面呼叫，
        讓你在 early return 之後才讀取 context。
      </p>
      <ComparePanel
        before={
          <>
            <CodeBlock
              title="程式碼"
              code={`function Heading({ children }) {
  // useContext 必須在最頂層
  // 不能放在 if (children == null) return null 後面
  // 只好用 Consumer render prop 模式
  return (
    <ThemeContext.Consumer>
      {(theme) => {
        if (!children) return null;
        return <h3 style={{
          color: theme === 'dark' ? '...' : '...'
        }}>{children}</h3>;
      }}
    </ThemeContext.Consumer>
  );
}`}
            />
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼"
              code={`function Heading({ children }) {
  if (!children) return null; // early return

  // use() 可以放在條件判斷之後！
  const theme = use(ThemeContext);
  return <h3 style={{
    color: theme === 'dark' ? '...' : '...'
  }}>{children}</h3>;
}

// 比 useContext 更彈性
// 比 Consumer 更簡潔`}
            />
          </>
        }
      />
      <div style={styles.singlePanel}>
        <div style={styles.tag}>Live Demo</div>
        <p style={styles.demoHint}>點「隱藏標題」會觸發 early return，use(Context) 不會被呼叫</p>
        <ContextDemo />
      </div>
    </DemoLayout>
  );
}

const styles = {
  h2: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  subDesc: { color: "var(--text-dim)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 },
  divider: { borderTop: "1px solid var(--border)", margin: "8px 0" },
  loading: {
    color: "var(--text-dim)",
    padding: 16,
    textAlign: "center",
    fontSize: 14,
  },
  error: {
    color: "var(--red)",
    padding: 16,
    textAlign: "center",
    fontSize: 14,
  },
  commentList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  comment: {
    padding: "10px 14px",
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
    fontSize: 14,
  },
  time: {
    fontSize: 11,
    color: "var(--text-dim)",
    marginLeft: 8,
  },
  commentText: {
    marginTop: 4,
    color: "var(--text-dim)",
  },
  btn: {
    padding: "6px 14px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: 13,
    cursor: "pointer",
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
    background: "var(--accent)",
    padding: "3px 12px",
    borderRadius: 99,
  },
  demoHint: {
    fontSize: 13,
    color: "var(--text-dim)",
    marginBottom: 12,
  },
};
