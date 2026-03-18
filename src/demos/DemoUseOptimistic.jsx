import { useState, useOptimistic, useTransition } from "react";
import {
  DemoLayout,
  ComparePanel,
  CodeBlock,
  LiveArea,
} from "../components/DemoLayout";
import { fakeToggleLike, fakeDeleteTodo } from "../utils/fakeApi";

// ========================================
// React 18：手動做 optimistic update
// ========================================
function LikeButtonOld() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(42);
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    const previousLiked = liked;
    const previousCount = count;

    // 先樂觀更新
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setIsPending(true);

    try {
      await fakeToggleLike(liked);
      // API 成功 → 保持樂觀值
    } catch {
      // API 失敗 → 手動 rollback
      setLiked(previousLiked);
      setCount(previousCount);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={isPending} style={styles.likeBtn}>
      <span style={{ fontSize: 20 }}>{liked ? "❤️" : "🤍"}</span>
      <span>{count}</span>
      {isPending && <span style={styles.spinner}>⏳</span>}
    </button>
  );
}

// ========================================
// React 19：useOptimistic，自動 rollback
// ========================================
function LikeButtonNew() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(42);
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);
  const [optimisticCount, setOptimisticCount] = useOptimistic(count);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      setOptimisticLiked(!liked);
      setOptimisticCount(liked ? count - 1 : count + 1);

      const result = await fakeToggleLike(liked);
      setLiked(result);
      setCount(result ? count + 1 : count - 1);
      // 如果 API 失敗，optimistic 值會自動 rollback 到真實的 state
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending} style={styles.likeBtn}>
      <span style={{ fontSize: 20 }}>{optimisticLiked ? "❤️" : "🤍"}</span>
      <span>{optimisticCount}</span>
      {isPending && <span style={styles.spinner}>⏳</span>}
    </button>
  );
}

// ========================================
// 共用初始資料
// ========================================
const INITIAL_TODOS = [
  { id: 1, text: "項目 A：Review PR" },
  { id: 2, text: "項目 B：修 Bug #42" },
  { id: 3, text: "項目 C：寫文件" },
  { id: 4, text: "項目 D：開週會" },
  { id: 5, text: "項目 E：部署測試環境" },
];

// ========================================
// React 18：非樂觀，等 API 回應才更新 UI
// ========================================
function TodoListOld({ shouldFail }) {
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const [isDeleting, setIsDeleting] = useState(null);
  const [error, setError] = useState(null);

  const handleDelete = async (id) => {
    setIsDeleting(id);
    setError(null);
    try {
      await fakeDeleteTodo(shouldFail);
      setTodos((prev) => prev.filter((t) => t.id !== id)); // 成功才移除
    } catch {
      setError("刪除失敗"); // 項目沒動，只顯示錯誤
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div style={styles.todoList}>
      {todos.map((t) => (
        <div key={t.id} style={styles.todoItem}>
          <span style={styles.todoText}>{t.text}</span>
          <button
            onClick={() => handleDelete(t.id)}
            disabled={isDeleting === t.id}
            style={styles.deleteBtn}
          >
            {isDeleting === t.id ? "⏳" : "🗑️"}
          </button>
        </div>
      ))}
      {todos.length === 0 && <p style={styles.emptyMsg}>全部刪完了！請重新整理頁面。</p>}
      {error && <p style={styles.errorMsg}>{error}</p>}
    </div>
  );
}

// ========================================
// React 19：useOptimistic，自動 rollback
// ========================================
function TodoListNew({ shouldFail }) {
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const [optimisticTodos, removeOptimistic] = useOptimistic(
    todos,
    (state, idToRemove) => state.filter((t) => t.id !== idToRemove)
  );
  const [isPending, startTransition] = useTransition();

  const [error, setError] = useState(null);

  const handleDelete = (id) => {
    setError(null);
    startTransition(async () => {
      removeOptimistic(id); // 立刻樂觀移除
      try {
        await fakeDeleteTodo(shouldFail);
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } catch {
        setError("刪除失敗，已自動還原"); // rollback 是自動的，catch 只負責顯示
      }
    });
  };

  return (
    <div style={styles.todoList}>
      {optimisticTodos.map((t) => (
        <div key={t.id} style={styles.todoItem}>
          <span style={styles.todoText}>{t.text}</span>
          <button
            onClick={() => handleDelete(t.id)}
            disabled={isPending}
            style={styles.deleteBtn}
          >
            🗑️
          </button>
        </div>
      ))}
      {optimisticTodos.length === 0 && <p style={styles.emptyMsg}>全部刪完了！請重新整理頁面。</p>}
      {error && <p style={styles.errorMsg}>{error}</p>}
    </div>
  );
}



export default function DemoUseOptimistic() {
  const [shouldFail, setShouldFail] = useState(false);

  return (
    <DemoLayout
      title="useOptimistic"
      description="React 19 內建 useOptimistic hook，讓你不用手動管理樂觀更新 + rollback 的邏輯。搭配 useTransition 使用，失敗時自動回滾。"
    >
      <h2 style={styles.h2}>範例 1：Like 按鈕</h2>
      <ComparePanel
        before={
          <>
            <CodeBlock
              title="程式碼"
              code={`const handleClick = async () => {
  const prevLiked = liked;
  const prevCount = count;

  // 手動樂觀更新
  setLiked(!liked);
  setCount(liked ? count - 1 : count + 1);

  try {
    await toggleLike(liked);
  } catch {
    // 手動 rollback！
    setLiked(prevLiked);
    setCount(prevCount);
  }
};`}
            />
            <LiveArea label="Live Demo">
              <LikeButtonOld />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼"
              code={`const [optimisticLiked, setOptimisticLiked]
  = useOptimistic(liked);

const handleClick = () => {
  startTransition(async () => {
    setOptimisticLiked(!liked); // 立即樂觀更新
    const result = await toggleLike(liked);
    setLiked(result);
    // 失敗時自動 rollback！不用 try/catch
  });
};`}
            />
            <LiveArea label="Live Demo">
              <LikeButtonNew />
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <h2 style={styles.h2}>範例 2：Todo 清單（樂觀刪除）</h2>
      <p style={styles.subDesc}>
        左邊（Old）：按刪除後項目還在，等 API 回應才消失或顯示錯誤。右邊（New）：項目立刻消失，API 失敗時自動跳回來——這就是 rollback 最有衝擊感的地方。
      </p>

      <label style={styles.failToggle}>
        <input
          type="checkbox"
          checked={shouldFail}
          onChange={(e) => setShouldFail(e.target.checked)}
          style={{ marginRight: 8 }}
        />
        模擬 API 失敗（左邊：等待後顯示錯誤 / 右邊：跳回來 + 顯示錯誤）
      </label>

      <ComparePanel
        before={
          <>
            <CodeBlock
              title="程式碼"
              code={`const handleDelete = async (id) => {
  setIsDeleting(id);
  setError(null);
  try {
    await fakeDeleteTodo(shouldFail);
    setTodos(prev => prev.filter(t => t.id !== id));
    // 成功才移除，失敗時項目不動
  } catch {
    setError("刪除失敗");
  } finally {
    setIsDeleting(null);
  }
};`}
            />
            <LiveArea label="React 18 — 手動 rollback">
              <TodoListOld shouldFail={shouldFail} />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼"
              code={`const [optimisticTodos, removeOptimistic]
  = useOptimistic(
    todos,
    (state, id) => state.filter(t => t.id !== id)
  );

const handleDelete = (id) => {
  setError(null); // 在 startTransition 外面
  startTransition(async () => {
    removeOptimistic(id); // 立刻樂觀移除
    try {
      await fakeDeleteTodo(shouldFail);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch {
      setError("刪除失敗，已自動還原");
      // rollback 是自動的，catch 只負責顯示錯誤
    }
  });
};`}
            />
            <LiveArea label="React 19 — 自動 rollback">
              <TodoListNew shouldFail={shouldFail} />
            </LiveArea>
          </>
        }
      />

      <div style={styles.warningPanel}>
        <div style={styles.warningTitle}>⚠️ 陷阱：base state 改變時，哪種寫法才是正確的？</div>
        <p style={styles.warningDesc}>
          action 還在 pending 期間，如果 server 推送新資料更新了 base state，三種寫法的行為各不相同。
        </p>
        <CodeBlock
          title="❌ snapshot：讀到過期快照，結果錯誤"
          code={`// base state 從 0 變成 10（server 推送）
// 再次點擊：讀到舊的 optimisticCount = 1，算出 2
// 正確答案應該是 11！
setOptimisticCount(optimisticCount + 1);`}
        />
        <CodeBlock
          title="⚠️ updater function：可以疊加，但看不到新的 base state"
          code={`// prev 是上一次的 optimistic 計算結果，不是最新的 base state
// base state 變成 10，但 prev 還是 1，算出 2
// 多次點擊可以正確疊加，但追不上 base state 的外部變化
setOptimisticCount(prev => prev + 1);`}
        />
        <CodeBlock
          title="✅ reducer 形式：base state 改變時，React 重新執行 reducer"
          code={`// base state 改變時，React 用新的 state 重跑 reducer
// state 永遠是最新的 base state
const [optimisticCount, dispatch] = useOptimistic(
  count,
  (state, amount) => state + amount
);
dispatch(1); // state 會是最新的 count`}
        />
      </div>
    </DemoLayout>
  );
}

const styles = {
  h2: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  subDesc: { color: "var(--text-dim)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 },
  divider: { borderTop: "1px solid var(--border)", margin: "8px 0" },
  likeBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 16,
    cursor: "pointer",
  },
  spinner: { fontSize: 14 },
  failToggle: {
    display: "flex",
    alignItems: "center",
    fontSize: 14,
    color: "var(--text-dim)",
    marginBottom: 16,
    cursor: "pointer",
  },
  todoList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  todoItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    fontSize: 14,
  },
  todoText: { flex: 1 },
  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: "0 4px",
    lineHeight: 1,
  },
  emptyMsg: {
    color: "var(--text-dim)",
    fontSize: 13,
    textAlign: "center",
    padding: "16px 0",
  },
  errorMsg: {
    color: "#e53e3e",
    fontSize: 12,
    marginTop: 8,
  },
  counterGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },
  counterBox: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  counterLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--accent)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  counterValue: {
    fontSize: 48,
    fontWeight: 700,
    color: "var(--text)",
    lineHeight: 1,
  },
  counterHint: {
    fontSize: 12,
    color: "var(--text-dim)",
    marginBottom: 8,
  },
  counterBtn: {
    padding: "8px 24px",
    borderRadius: "var(--radius-sm)",
    border: "none",
    background: "var(--accent)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },
  resetBtn: {
    padding: "6px 24px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-dim)",
    fontSize: 13,
    cursor: "pointer",
    width: "100%",
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
