import { useState, useTransition, useEffect, useRef, memo } from "react";
import {
  DemoLayout,
  ComparePanel,
  CodeBlock,
  LiveArea,
} from "../components/DemoLayout";

function slowFilter(items, query) {
  if (!query) return items;
  return items.filter((item) => {
    let _X = 0;
    for (let i = 0; i < 20000; i++) {
      _X += Math.sqrt(i);
    }
    return item.label.toLowerCase().includes(query.toLowerCase());
  });
}

const ITEMS = Array.from({ length: 5000 }, (_, i) => ({
  id: i,
  label: `Product ${i + 1} — ${["Apple", "Banana", "Cherry", "Durian", "Elderberry", "Fig", "Grape", "Honeydew"][i % 8]}`,
  price: Math.floor(Math.random() * 1000) + 10,
}));

// 量測從鍵盤按下到畫面實際更新的延遲
function InputLagMeter({ lagMs }) {
  const getColor = (ms) => {
    if (ms === null) return "var(--text-dim)";
    if (ms < 30) return "var(--green)";
    if (ms < 100) return "var(--orange)";
    return "var(--red)";
  };

  const getLabel = (ms) => {
    if (ms === null) return "等待輸入...";
    if (ms < 30) return "流暢";
    if (ms < 100) return "輕微延遲";
    return "明顯卡頓";
  };

  const barWidth = lagMs === null ? 0 : Math.min(lagMs / 500 * 100, 100);

  return (
    <div style={meterStyles.wrapper}>
      <div style={meterStyles.row}>
        <span style={meterStyles.label}>輸入延遲</span>
        <span style={{ ...meterStyles.value, color: getColor(lagMs) }}>
          {lagMs === null ? "—" : `${lagMs}ms`}
        </span>
        <span style={{ ...meterStyles.status, color: getColor(lagMs) }}>
          {getLabel(lagMs)}
        </span>
      </div>
      <div style={meterStyles.barTrack}>
        <div
          style={{
            ...meterStyles.barFill,
            width: `${barWidth}%`,
            background: getColor(lagMs),
          }}
        />
      </div>
      <div style={meterStyles.scale}>
        <span>0ms</span>
        <span>100ms</span>
        <span>300ms</span>
        <span>500ms+</span>
      </div>
    </div>
  );
}

const meterStyles = {
  wrapper: {
    padding: "10px 12px",
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    marginBottom: 12,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-dim)",
  },
  value: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
  status: {
    fontSize: 11,
    fontWeight: 600,
    marginLeft: "auto",
  },
  barTrack: {
    height: 6,
    background: "var(--surface-2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.15s, background 0.15s",
  },
  scale: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 9,
    color: "var(--text-dim)",
    marginTop: 3,
    opacity: 0.6,
  },
};

// 輸入延遲的 history 記錄
function LagHistory({ history }) {
  if (history.length === 0) return null;
  const avg = Math.round(history.reduce((a, b) => a + b, 0) / history.length);
  const max = Math.max(...history);

  return (
    <div style={histStyles.wrapper}>
      <div style={histStyles.bars}>
        {history.slice(-20).map((ms, i) => (
          <div
            key={i}
            style={{
              ...histStyles.bar,
              height: `${Math.min(ms / 500 * 100, 100)}%`,
              background: ms < 30 ? "var(--green)" : ms < 100 ? "var(--orange)" : "var(--red)",
            }}
          />
        ))}
      </div>
      <div style={histStyles.stats}>
        平均: <strong>{avg}ms</strong> ・ 最大: <strong>{max}ms</strong> ・ 最近 {Math.min(history.length, 20)} 次按鍵
      </div>
    </div>
  );
}

const histStyles = {
  wrapper: {
    marginTop: 8,
    padding: "8px 12px",
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
  },
  bars: {
    display: "flex",
    alignItems: "flex-end",
    gap: 2,
    height: 40,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 2,
    transition: "height 0.1s",
  },
  stats: {
    fontSize: 11,
    color: "var(--text-dim)",
    marginTop: 6,
  },
};

const SlowList = memo(function SlowList({ filterQuery, dim }) {
  const filtered = slowFilter(ITEMS, filterQuery);

  return (
    <>
      <div style={styles.statusBar}>
        <span>找到 {filtered.length} 筆</span>
      </div>
      <div style={{ ...styles.listArea, opacity: dim ? 0.6 : 1, transition: "opacity 0.15s" }}>
        {filtered.slice(0, 50).map((item) => (
          <div key={item.id} style={styles.row}>
            <span>{item.label}</span>
            <span style={styles.price}>${item.price}</span>
          </div>
        ))}
        {filtered.length > 50 && (
          <div style={styles.more}>...還有 {filtered.length - 50} 筆</div>
        )}
      </div>
    </>
  );
})

// ========================================
// 沒有 startTransition：每次打字直接觸發 SlowList 重算，輸入被阻塞
// ========================================
function HeavyListBlocking() {
  const [query, setQuery] = useState("");
  const [lagMs, setLagMs] = useState(null);
  const [lagHistory, setLagHistory] = useState([]);
  const keypressTimeRef = useRef(null);

  useEffect(() => {
    if (keypressTimeRef.current !== null) {
      const lag = Math.round(performance.now() - keypressTimeRef.current);
      setLagMs(lag);
      setLagHistory((prev) => [...prev, lag]);
      keypressTimeRef.current = null;
    }
  });

  const handleChange = (e) => {
    keypressTimeRef.current = performance.now();
    setQuery(e.target.value);
    // ❌ query 直接傳給 SlowList → 每次打字立刻重算 → 輸入卡頓
  };

  return (
    <div>
      <InputLagMeter lagMs={lagMs} />
      <input
        value={query}
        onChange={handleChange}
        placeholder="快速連打 apple 試試..."
        style={styles.input}
      />
      <SlowList filterQuery={query} />
      <LagHistory history={lagHistory} />
    </div>
  );
}

// ========================================
// 有 startTransition：input 立即更新，列表在背景延後更新
// isPending 期間可以繼續輸入
// ========================================
function HeavyListWithTransition() {
  const [query, setQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [lagMs, setLagMs] = useState(null);
  const [lagHistory, setLagHistory] = useState([]);
  const keypressTimeRef = useRef(null);

  useEffect(() => {
    if (keypressTimeRef.current !== null) {
      const lag = Math.round(performance.now() - keypressTimeRef.current);
      setLagMs(lag);
      setLagHistory((prev) => [...prev, lag]);
      keypressTimeRef.current = null;
    }
  });

  const handleChange = (e) => {
    keypressTimeRef.current = performance.now();
    const value = e.target.value;
    setQuery(value);             // ⚡ 立即更新 input 顯示
    startTransition(() => {
      setFilterQuery(value);     // 🐢 延後更新列表
    });
  };

  return (
    <div>
      <InputLagMeter lagMs={lagMs} />
      <input
        value={query}
        onChange={handleChange}
        placeholder="快速連打 apple 試試..."
        style={styles.input}
      />
      {isPending && <div style={styles.pendingHint}>搜尋中...</div>}
      <SlowList filterQuery={filterQuery} dim={isPending} />
      <LagHistory history={lagHistory} />
    </div>
  );
}

// 模擬不穩定的 API 延遲：第一個請求慢（2s），後續快（200ms）
// 這會讓快速連改時暴露 race condition
let isFirstQtyRequest = true;
function fakeUpdateQuantity(newQuantity) {
  return new Promise((resolve) => {
    if (isFirstQtyRequest) {
      isFirstQtyRequest = false;
      setTimeout(() => {
        isFirstQtyRequest = true;
        resolve(Number(newQuantity));
      }, 2000);
    } else {
      setTimeout(() => resolve(Number(newQuantity)), 200);
    }
  });
}

// ========================================
// 沒有 startTransition：手動管理 isUpdating
// 快速連改時，每次請求都有自己的 loading 週期 → 閃爍
// 且有 race condition：先發的請求後到，會覆蓋正確結果
// ========================================
function QuantityBlocking() {
  const [quantity, setQuantity] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [clientQuantity, setClientQuantity] = useState(1);

  const handleChange = async (e) => {
    const value = e.target.value;
    setClientQuantity(Number(value));
    setIsUpdating(true);
    const saved = await fakeUpdateQuantity(value);
    setQuantity(saved);
    setIsUpdating(false);
  };

  const isWrong = !isUpdating && quantity !== clientQuantity;

  return (
    <div style={styles.checkoutBox}>
      <div style={styles.itemRow}>
        <span>演唱會票券</span>
        <label>數量：
          <input
            type="number"
            defaultValue={1}
            min={1}
            onChange={handleChange}
            style={styles.qtyInput}
          />
        </label>
      </div>
      <hr style={styles.hr} />
      <div style={styles.totalRow}>
        <span>總金額：</span>
        <span style={isUpdating ? styles.totalPending : styles.totalValue}>
          {isUpdating ? "🌀 更新中..." : `NT$ ${(quantity * 2800).toLocaleString()}`}
        </span>
      </div>
      {isWrong && (
        <div style={styles.raceError}>
          Race condition! 期望 NT$ {(clientQuantity * 2800).toLocaleString()}
          ，但顯示 NT$ {(quantity * 2800).toLocaleString()}
        </div>
      )}
    </div>
  );
}

// ========================================
// 有 startTransition：async action 模式
// isPending 在所有請求完成前保持 true，不閃爍
// ========================================
function QuantityWithTransition() {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [clientQuantity, setClientQuantity] = useState(1);

  const handleChange = (e) => {
    const value = e.target.value;
    setClientQuantity(Number(value));
    startTransition(async () => {
      const saved = await fakeUpdateQuantity(value);
      startTransition(() => {
        setQuantity(saved);
      });
    });
  };

  const isWrong = !isPending && quantity !== clientQuantity;

  return (
    <div style={styles.checkoutBox}>
      <div style={styles.itemRow}>
        <span>演唱會票券</span>
        <label>數量：
          <input
            type="number"
            defaultValue={1}
            min={1}
            onChange={handleChange}
            style={styles.qtyInput}
          />
        </label>
      </div>
      <hr style={styles.hr} />
      <div style={styles.totalRow}>
        <span>總金額：</span>
        <span style={isPending ? styles.totalPending : styles.totalValue}>
          {isPending ? "🌀 更新中..." : `NT$ ${(quantity * 2800).toLocaleString()}`}
        </span>
      </div>
      {isWrong && (
        <div style={styles.raceError}>
          Race condition! 期望 NT$ {(clientQuantity * 2800).toLocaleString()}
          ，但顯示 NT$ {(quantity * 2800).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default function DemoTransition() {
  return (
    <DemoLayout
      title="startTransition & Actions"
      description="React 19 最核心的概念之一：把 async function 交給 startTransition，讓 React 自動管理 pending / 完成 / 錯誤 — 這就是「Action」。"
    >
      <div style={styles.actionConcept}>
        <h2 style={styles.h2}>什麼是 Action？</h2>
        <p style={styles.subDesc}>
          React 當年把 <strong>DOM 操作</strong>從命令式變成宣告式（jQuery → JSX）。
          React 19 做了同一件事，但對象換成了 <strong>資料變更（data mutation）</strong>。
        </p>

        <div style={styles.patternBox}>
          <div style={styles.patternLabel}>你寫過 100 次的 pattern：</div>
          <pre style={styles.patternCode}>{`setIsPending(true);
setError(null);
try {
  const result = await doSomething();
  setSuccess(true);
} catch (e) {
  setError(e.message);
} finally {
  setIsPending(false);
}`}</pre>
          <div style={styles.patternCaption}>
            每次都在管理同一件事：<strong>一個非同步操作的生命週期</strong>（pending → success / error）。
          </div>
        </div>

        <p style={styles.subDesc}>
          Action 就是在說：<strong>「你把 async function 給我，生命週期我來管。」</strong>
        </p>

        <div style={styles.actionCompare}>
          <div style={styles.actionCol}>
            <div style={{ ...styles.actionTag, background: "var(--red)" }}>以前</div>
            <pre style={styles.actionCode}>{`const [isPending, setIsPending] = useState(false);

const handleClick = async () => {
  setIsPending(true);
  await doSomething();
  setIsPending(false);
};`}</pre>
          </div>
          <div style={styles.actionArrow}>→</div>
          <div style={styles.actionCol}>
            <div style={{ ...styles.actionTag, background: "var(--green)" }}>Action</div>
            <pre style={styles.actionCode}>{`const [isPending, startTransition] = useTransition();

const handleClick = () => {
  startTransition(async () => {
    await doSomething();
  });
};`}</pre>
          </div>
        </div>

        <div style={styles.actionEcosystem}>
          <div style={styles.ecosystemTitle}>Action 生態系</div>
          <div style={styles.ecosystemGrid}>
            <div style={styles.ecosystemCard}>
              <strong>startTransition(async fn)</strong>
              <span style={styles.ecosystemBadge}>基礎</span>
              <p style={styles.ecosystemText}>傳入 async function = Action。isPending 自動管理。按慣例，接受 Action 的 prop 命名為 <code>action</code> 或帶 Action 後綴。</p>
            </div>
            <div style={styles.ecosystemCard}>
              <strong>useActionState</strong>
              <span style={styles.ecosystemBadge}>進階</span>
              <p style={styles.ecosystemText}>整合 state + pending + action。一個 hook 取代 3-4 個 useState。</p>
            </div>
            <div style={styles.ecosystemCard}>
              <strong>{"<form action={fn}>"}</strong>
              <span style={styles.ecosystemBadge}>表單</span>
              <p style={styles.ecosystemText}>form 的 action 接受函式，成功後自動 reset。</p>
            </div>
            <div style={styles.ecosystemCard}>
              <strong>useFormStatus</strong>
              <span style={styles.ecosystemBadge}>子元件</span>
              <p style={styles.ecosystemText}>子元件直接讀取父層 form 的 pending，不用 prop drilling。</p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      <h2 style={styles.h2}>範例 1：非阻塞渲染 — 搜尋篩選 5000 筆商品</h2>
      <p style={styles.subDesc}>
        快速連續打字（例如打 <code>apple</code>），觀察兩邊的「輸入延遲」。
        左邊每次打字直接觸發 SlowList 重算，畫面凍結、輸入卡頓。
        右邊用 <code>startTransition</code> 把列表更新延後，input 立即回應，<code>isPending</code> 期間顯示「搜尋中...」，列表在背景更新完再顯示。
      </p>
      <ComparePanel
        beforeLabel="沒有 startTransition"
        afterLabel="有 startTransition"
        before={
          <>
            <CodeBlock
              title="程式碼"
              code={`function Search() {
  const [query, setQuery] = useState('');

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        // ❌ 每次打字 → SlowList 立刻重算
        // → 畫面凍結 → 輸入卡頓
      />
      <SlowList filterQuery={query} />
    </>
  );
}`}
            />
            <LiveArea label="Live Demo — 快速打字 apple">
              <HeavyListBlocking />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼"
              code={`function Search() {
  const [query, setQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setQuery(e.target.value);  // ⚡ 立即更新 input
    startTransition(() => {
      setFilterQuery(e.target.value); // 🐢 延後更新列表
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <div>搜尋中...</div>}
      {/* ✅ isPending 期間可以繼續打字    */}
      {/* 列表在背景更新，不阻塞輸入      */}
      <SlowList filterQuery={filterQuery} />
    </>
  );
}`}
            />
            <LiveArea label="Live Demo — 快速打字 apple">
              <HeavyListWithTransition />
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <h2 style={styles.h2}>範例 2：Action 實戰 — 數量更新（模擬 API）</h2>
      <p style={styles.subDesc}>
        這就是上面說的 Action：把 async function 傳進 <code>startTransition</code>。
        快速連續修改數量（例如 1→2→3），左邊手動管理 <code>isUpdating</code>：快速連改會閃爍，且有 race condition。
        右邊用 Action：<code>isPending</code> 持續為 <code>true</code> 直到所有請求完成，<strong>解決了閃爍問題</strong>。
        但注意：<strong>race condition 仍然存在</strong> — 先發的慢請求後到，仍會覆蓋正確結果。要解決排序問題，請看下一頁的 <code>useActionState</code>。
      </p>
      <ComparePanel
        beforeLabel="手動 isUpdating"
        afterLabel="startTransition async"
        before={
          <>
            <CodeBlock
              title="程式碼"
              code={`const [isUpdating, setIsUpdating] = useState(false);

const handleChange = async (e) => {
  setIsUpdating(true);
  const saved = await fakeApi(e.target.value);
  setQuantity(saved);
  setIsUpdating(false);
  // ❌ 快速連改 → 多個 async 同時跑
  // → isUpdating 閃爍
  // → 先發的請求後到會覆蓋正確結果
};`}
            />
            <LiveArea label="Live Demo — 快速連改數量">
              <QuantityBlocking />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼"
              code={`const [isPending, startTransition] = useTransition();

const handleChange = (e) => {
  startTransition(async () => {
    const saved = await fakeApi(e.target.value);
    startTransition(() => {
      setQuantity(saved); // await 後要再包一層
    });
  });
  // ✅ isPending 持續為 true 直到完成 → 不閃爍
  // ⚠️ 但多個 async 請求仍可能亂序完成
  // → 需要 useActionState 才能保證順序
};`}
            />
            <LiveArea label="Live Demo — 快速連改數量">
              <QuantityWithTransition />
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <div style={styles.warningBox}>
        <div style={styles.warningTitle}>Race Condition 仍然存在</div>
        <p style={styles.warningText}>
          <code>startTransition</code> 解決了 <strong>isPending 閃爍</strong>的問題，
          但<strong>不保證請求順序</strong>。快速連改時，先發的慢請求後回來仍會覆蓋正確結果。
        </p>
        <p style={styles.warningText}>
          這是因為 <code>await</code> 之後的 state 更新是非同步排程的，React 無法追蹤跨 async boundary 的順序。
          官方建議使用 <strong>useActionState</strong> 來處理排序 — 它會依序執行每個 Action，確保最終狀態正確。
        </p>
        <div style={styles.warningCompare}>
          <div style={styles.warningCol}>
            <strong>startTransition</strong>
            <div style={styles.warningList}>
              <div style={styles.warningItem}>isPending 不閃爍</div>
              <div style={styles.warningItem}>await 後要再包 startTransition</div>
              <div style={{ ...styles.warningItem, color: "var(--red)" }}>不保證請求順序</div>
            </div>
          </div>
          <div style={styles.warningCol}>
            <strong>useActionState</strong>
            <div style={styles.warningList}>
              <div style={styles.warningItem}>isPending 不閃爍</div>
              <div style={styles.warningItem}>state + pending + action 一體</div>
              <div style={{ ...styles.warningItem, color: "var(--green)" }}>依序執行，保證順序</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.summaryPanel}>
        <h3 style={styles.summaryTitle}>什麼時候用 startTransition / Action？</h3>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>⚡</div>
            <strong>非阻塞 UI 更新</strong>
            <p style={styles.cardText}>大量列表、複雜圖表、重計算 — 包起來讓輸入不卡</p>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>🔄</div>
            <strong>Tab / 路由切換</strong>
            <p style={styles.cardText}>新頁面很重時，讓按鈕/連結立刻回饋，內容晚一點出</p>
          </div>
          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>🌐</div>
            <strong>Data Mutation</strong>
            <p style={styles.cardText}>表單送出、按讚、刪除 — 用 Action 自動管理 pending / error</p>
          </div>
        </div>
        <p style={styles.summaryGuide}>
          需要保證 async 請求順序？請看下一節：<strong>useActionState</strong> — 把 state + pending + action 三合一，自動處理排序。
        </p>
      </div>
    </DemoLayout>
  );
}

const styles = {
  h2: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  subDesc: { color: "var(--text-dim)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 },
  divider: { borderTop: "1px solid var(--border)", margin: "8px 0" },
  actionConcept: { marginBottom: 8 },
  patternBox: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 20,
    marginBottom: 20,
  },
  patternLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-dim)",
    marginBottom: 10,
  },
  patternCode: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: 16,
    fontSize: 13,
    lineHeight: 1.7,
    color: "var(--red)",
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    whiteSpace: "pre-wrap",
  },
  patternCaption: {
    fontSize: 13,
    color: "var(--text-dim)",
    marginTop: 12,
    lineHeight: 1.6,
  },
  actionCompare: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  actionCol: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 16,
    position: "relative",
  },
  actionTag: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    padding: "2px 10px",
    borderRadius: 99,
    marginBottom: 10,
  },
  actionCode: {
    fontSize: 12,
    lineHeight: 1.7,
    color: "var(--text)",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    whiteSpace: "pre-wrap",
    margin: 0,
  },
  actionArrow: {
    fontSize: 24,
    color: "var(--text-dim)",
    fontWeight: 700,
    textAlign: "center",
  },
  actionEcosystem: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 24,
  },
  ecosystemTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
  },
  ecosystemGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 12,
  },
  ecosystemCard: {
    background: "var(--surface-2)",
    borderRadius: "var(--radius-sm)",
    padding: 14,
    fontSize: 13,
  },
  ecosystemBadge: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 700,
    color: "var(--accent)",
    background: "var(--bg)",
    padding: "1px 8px",
    borderRadius: 99,
    marginLeft: 6,
  },
  ecosystemText: {
    fontSize: 12,
    color: "var(--text-dim)",
    marginTop: 6,
    lineHeight: 1.5,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
  },
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 12,
    color: "var(--text-dim)",
    padding: "8px 0",
  },
  pendingTag: {
    marginLeft: 8,
    color: "var(--orange)",
    fontWeight: 600,
  },
  listArea: {
    maxHeight: 220,
    overflowY: "auto",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 12px",
    fontSize: 13,
    borderBottom: "1px solid var(--border)",
  },
  price: {
    color: "var(--green)",
    fontWeight: 600,
    fontFamily: "monospace",
  },
  more: {
    padding: "8px 12px",
    fontSize: 12,
    color: "var(--text-dim)",
    fontStyle: "italic",
    textAlign: "center",
  },
  tabBar: {
    display: "flex",
    gap: 4,
    marginBottom: 12,
  },
  tabBtn: {
    padding: "8px 16px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text-dim)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.1s",
  },
  tabBtnActive: {
    background: "var(--accent)",
    color: "#fff",
    borderColor: "var(--accent)",
  },
  tabContent: {
    padding: 16,
    background: "var(--bg)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    minHeight: 150,
    fontSize: 14,
    color: "var(--text-dim)",
    transition: "opacity 0.15s",
  },
  transitionHint: {
    fontSize: 12,
    color: "var(--orange)",
    fontWeight: 600,
    marginBottom: 4,
  },
  pendingHint: {
    fontSize: 12,
    color: "var(--orange)",
    fontWeight: 600,
    padding: "4px 0",
  },
  hintArea: {
    height: 24,
    display: "flex",
    alignItems: "center",
    marginBottom: 4,
  },
  checkoutBox: {
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: 16,
    background: "var(--bg)",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  qtyInput: {
    width: 70,
    padding: "6px 10px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    fontSize: 14,
    marginLeft: 8,
  },
  hr: {
    border: "none",
    borderTop: "1px solid var(--border)",
    margin: "12px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 15,
    fontWeight: 600,
  },
  totalValue: {
    color: "var(--green)",
    fontFamily: "monospace",
    fontSize: 16,
  },
  totalPending: {
    color: "var(--orange)",
    fontSize: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
    gap: 4,
  },
  gridItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  gridColor: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  gridLabel: {
    fontSize: 9,
    color: "var(--text-dim)",
  },
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
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
  },
  summaryCard: {
    background: "var(--surface-2)",
    borderRadius: "var(--radius-sm)",
    padding: 16,
    textAlign: "center",
    fontSize: 14,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    color: "var(--text-dim)",
    marginTop: 6,
    lineHeight: 1.6,
  },
  summaryGuide: {
    fontSize: 13,
    color: "var(--text-dim)",
    marginTop: 16,
    textAlign: "center",
    lineHeight: 1.7,
  },
  raceError: {
    color: "var(--red)",
    fontSize: 13,
    marginTop: 8,
    fontWeight: 500,
  },
  warningBox: {
    padding: "20px 24px",
    background: "var(--surface)",
    border: "1px solid var(--orange, #f59e0b)",
    borderLeft: "4px solid var(--orange, #f59e0b)",
    borderRadius: "var(--radius)",
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--orange, #f59e0b)",
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 1.8,
    color: "var(--text)",
    marginBottom: 8,
  },
  warningCompare: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 12,
  },
  warningCol: {
    background: "var(--surface-2)",
    borderRadius: "var(--radius-sm)",
    padding: 14,
    fontSize: 13,
  },
  warningList: {
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  warningItem: {
    fontSize: 12,
    lineHeight: 1.6,
  },
};
