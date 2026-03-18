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

// ========================================
// 模擬 API 請求（1.5 秒延遲）
// ========================================
function fakeUpdateQuantity(newQuantity) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(Number(newQuantity)), 1500);
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

  const handleChange = async (e) => {
    const value = e.target.value;
    setIsUpdating(true);
    const saved = await fakeUpdateQuantity(value);
    setQuantity(saved);
    setIsUpdating(false);
    // ❌ 快速連改 → 多個 async 同時跑
    // → isUpdating 閃爍、且先發的請求後到會覆蓋正確結果
  };

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

  const handleChange = (e) => {
    const value = e.target.value;
    startTransition(async () => {
      const saved = await fakeUpdateQuantity(value);
      startTransition(() => {
        setQuantity(saved);
      });
    });
    // ✅ isPending 持續為 true 直到所有 transition 完成
    // 快速連改 → 總金額保持「更新中...」不閃爍
  };

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
    </div>
  );
}

export default function DemoTransition() {
  return (
    <DemoLayout
      title="startTransition — 非阻塞渲染"
      description="startTransition 不只是拿來包 API 請求。當你有一個很重的 UI 更新（大量列表、複雜圖表），用 startTransition 包起來可以讓使用者的輸入、點擊等互動不被阻塞。React 會優先處理使用者操作，等閒下來再更新重渲染的部分。"
    >
      <h2 style={styles.h2}>範例 1：搜尋篩選 5000 筆商品</h2>
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

      <h2 style={styles.h2}>範例 2：Async Action — 數量更新（模擬 API）</h2>
      <p style={styles.subDesc}>
        快速連續修改數量（例如 1→5→10→3），觀察「總金額」的更新狀態。
        左邊手動管理 <code>isUpdating</code>：每個請求都有自己的 loading 週期，快速連改會閃爍，且有 race condition（先發的請求後到，會覆蓋正確結果）。
        右邊用 <code>startTransition(async)</code>：<code>isPending</code> 持續為 <code>true</code> 直到所有請求完成，不閃爍、結果正確。這是 React 19 新增的 async action 能力。
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
  // ✅ isPending 持續為 true 直到完成
  // → 不閃爍，結果一定是最新的
};`}
            />
            <LiveArea label="Live Demo — 快速連改數量">
              <QuantityWithTransition />
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <div style={styles.summaryPanel}>
        <h3 style={styles.summaryTitle}>什麼時候用 startTransition？</h3>
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
            <strong>Async Actions</strong>
            <p style={styles.cardText}>React 19 新增：startTransition 可以包 async function 處理 API 請求</p>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}

const styles = {
  h2: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  subDesc: { color: "var(--text-dim)", fontSize: 14, marginBottom: 16, lineHeight: 1.7 },
  divider: { borderTop: "1px solid var(--border)", margin: "8px 0" },
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
};
