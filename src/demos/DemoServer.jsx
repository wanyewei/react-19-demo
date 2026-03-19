import { DemoLayout, CodeBlock } from "../components/DemoLayout";

export default function DemoServer() {
  return (
    <DemoLayout
      title='Server Components & Actions'
      description='Server Components（RSC）的概念早在 2020 年提出，Next.js 13+ 透過 React canary 已使用多年。React 19 將 RSC 正式納入 stable API — 包含 "use client"、"use server" directives 等。這些功能需搭配 framework（如 Next.js 15+）才能使用，純 SPA 不適用。'
    >
      <div style={styles.notice}>
        <span style={styles.noticeIcon}>ℹ️</span>
        <div>
          <strong>注意：</strong>本頁為概念介紹。Server Components / Server Actions 需要搭配
          支援 RSC 的 framework（如 Next.js）才能運行，無法在純 Vite SPA 中 live demo。
        </div>
      </div>

      <h2 style={styles.h2}>Server Components (RSC)</h2>
      <p style={styles.subDesc}>
        Server Components 是預設在 <strong>server 端執行</strong> 的 React 元件。
        它們可以直接存取資料庫、讀取檔案系統、呼叫內部 API —
        而且產出的 HTML 直接送到 client，<strong>不會增加任何 JS bundle size</strong>。
      </p>

      <div style={styles.compareGrid}>
        <div style={styles.conceptCard}>
          <div style={{ ...styles.conceptTag, background: "var(--accent)" }}>Server Component</div>
          <CodeBlock
            code={`// 預設就是 Server Component
// 不需要加任何 directive

async function ProductPage({ id }) {
  // 直接查資料庫 — 不會暴露給 client
  const product = await db.products.findById(id);
  const reviews = await db.reviews.findByProduct(id);

  return (
    <main>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {/* 需要互動的部分用 Client Component */}
      <AddToCartButton productId={id} />
      <ReviewList reviews={reviews} />
    </main>
  );
}

// 結果：
// ✅ product 資料的 fetch 邏輯不會進 JS bundle
// ✅ 資料庫連線資訊完全在 server 端
// ✅ 更快的首屏載入（HTML 直接送達）`}
          />
        </div>

        <div style={styles.conceptCard}>
          <div style={{ ...styles.conceptTag, background: "var(--green)" }}>Client Component</div>
          <CodeBlock
            code={`"use client";
// 加上 "use client" 才是 Client Component
// 只有需要互動的部分才標記

import { useState } from "react";

function AddToCartButton({ productId }) {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      加入購物車 ({count})
    </button>
  );
}

// 結果：
// ✅ 只有這個按鈕的 JS 會送到 client
// ✅ 可以使用 useState、useEffect 等 hooks
// ✅ 可以綁定 event handlers`}
          />
        </div>
      </div>

      <div style={styles.keyPoint}>
        <h3 style={styles.keyPointTitle}>核心概念：從 "opt-in server" 變成 "opt-in client"</h3>
        <div style={styles.keyPointGrid}>
          <div style={styles.kpItem}>
            <div style={{ ...styles.kpBadge, background: "var(--red)" }}>以前 (React 18)</div>
            <p>所有元件都是 Client Component，要用 server 功能需要額外設定 SSR / API routes</p>
          </div>
          <div style={styles.kpItem}>
            <div style={{ ...styles.kpBadge, background: "var(--green)" }}>現在 (React 19)</div>
            <p>預設是 Server Component，只有需要互動的才標記 <code>"use client"</code></p>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      <h2 style={styles.h2}>Server Actions</h2>
      <p style={styles.subDesc}>
        Server Actions 讓你在 client 端 <strong>直接呼叫 server 端函式</strong>，
        不用手動建立 API endpoint。React 會自動處理序列化、網路請求、錯誤處理。
      </p>

      <div style={styles.singlePanel}>
        <CodeBlock
          title='Server Action 定義與使用'
          code={`// actions.js
"use server";

// 這個函式只在 server 端執行
// React 會自動生成一個 API endpoint
export async function createPost(formData) {
  const title = formData.get("title");
  const content = formData.get("content");

  // 直接存取資料庫
  await db.posts.create({ title, content });

  // 自動 revalidate 頁面
  revalidatePath("/posts");
}

// ─────────────────────────────────────────

// PostForm.jsx
"use client";

import { createPost } from "./actions";

function PostForm() {
  // 搭配 useActionState 使用
  const [state, formAction, isPending] = useActionState(
    createPost,
    { error: null }
  );

  return (
    <form action={formAction}>
      <input name="title" required />
      <textarea name="content" required />
      <button disabled={isPending}>
        {isPending ? "發布中..." : "發布文章"}
      </button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}

// 結果：
// ✅ 不用建立 API route — React 自動處理
// ✅ 表單用 action={fn} — 支援 Progressive Enhancement
// ✅ isPending 自動管理 — 不用手動 setState
// ✅ TypeScript end-to-end type safety`}
        />
      </div>

      <div style={styles.divider} />

      <h2 style={styles.h2}>Streaming SSR + Suspense</h2>
      <p style={styles.subDesc}>
        React 19 搭配 Server Components，可以實現真正的 <strong>漸進式頁面載入</strong>。
        Server 會先送出已經準備好的 HTML，慢的部分用 Suspense fallback 佔位，
        等資料準備好再 streaming 送到 client。
      </p>

      <div style={styles.singlePanel}>
        <CodeBlock
          title="Streaming 範例"
          code={`// 整個頁面的資料不需要同時準備好
async function DashboardPage() {
  return (
    <div>
      {/* 這部分很快，立刻送出 */}
      <Header />
      <Sidebar />

      {/* 這部分需要查詢，用 Suspense 包起來 */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />  {/* async: 需要 2s 取得資料 */}
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />  {/* async: 需要 3s 取得資料 */}
      </Suspense>
    </div>
  );
}

// 載入流程：
// 0ms  → Header + Sidebar 立刻顯示
//      → ChartSkeleton + TableSkeleton 顯示
// 2s   → RevenueChart streaming 送達，替換 skeleton
// 3s   → RecentOrders streaming 送達，替換 skeleton
//
// 使用者不用等 3s 才看到整個頁面！`}
        />
      </div>

      <div style={styles.divider} />

      <h2 style={styles.h2}>什麼時候需要 Server Components？</h2>
      <div style={styles.useCaseGrid}>
        <div style={styles.useCaseCard}>
          <div style={{ ...styles.useCaseIcon, color: "var(--green)" }}>✅</div>
          <strong>適合的場景</strong>
          <ul style={styles.list}>
            <li>資料密集的頁面（Dashboard、CMS）</li>
            <li>SEO 重要的頁面（行銷網站、部落格）</li>
            <li>需要存取 server 資源（DB、檔案系統）</li>
            <li>大量靜態內容（文件站、產品頁）</li>
          </ul>
        </div>
        <div style={styles.useCaseCard}>
          <div style={{ ...styles.useCaseIcon, color: "var(--orange)" }}>⏸️</div>
          <strong>可以暫緩的場景</strong>
          <ul style={styles.list}>
            <li>純 SPA 應用（如內部工具、管理後台）</li>
            <li>已有穩定的 API 層（REST / GraphQL）</li>
            <li>團隊還在熟悉 React 19 其他功能</li>
            <li>目前 framework 還不支援 RSC</li>
          </ul>
        </div>
      </div>

      <div style={styles.frameworkNote}>
        <h3 style={styles.frameworkTitle}>支援 RSC 的 Framework</h3>
        <div style={styles.fwGrid}>
          <div style={styles.fwItem}>
            <strong>Next.js 15+</strong>
            <span style={styles.fwStatus}>✅ 完整支援</span>
          </div>
          <div style={styles.fwItem}>
            <strong>Remix / React Router v7</strong>
            <span style={styles.fwStatus}>🔄 部分支援</span>
          </div>
          <div style={styles.fwItem}>
            <strong>Waku</strong>
            <span style={styles.fwStatus}>🔄 實驗性</span>
          </div>
          <div style={styles.fwItem}>
            <strong>Vite (純 SPA)</strong>
            <span style={styles.fwStatus}>❌ 不支援 RSC</span>
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
  notice: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "14px 18px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "var(--radius)",
    fontSize: 13,
    lineHeight: 1.7,
    color: "var(--text-dim)",
    marginBottom: 24,
  },
  noticeIcon: { fontSize: 18, flexShrink: 0, marginTop: 1 },
  compareGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  conceptCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 20,
    position: "relative",
  },
  conceptTag: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    padding: "3px 12px",
    borderRadius: 99,
    marginBottom: 12,
  },
  keyPoint: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 24,
  },
  keyPointTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  keyPointGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  kpItem: {
    fontSize: 13,
    color: "var(--text-dim)",
    lineHeight: 1.7,
  },
  kpBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    padding: "3px 12px",
    borderRadius: 99,
    marginBottom: 8,
  },
  singlePanel: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 24,
  },
  useCaseGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 16,
  },
  useCaseCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 20,
    fontSize: 14,
  },
  useCaseIcon: { fontSize: 24, marginBottom: 8 },
  list: {
    fontSize: 13,
    color: "var(--text-dim)",
    lineHeight: 2,
    paddingLeft: 20,
    marginTop: 8,
  },
  frameworkNote: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 24,
  },
  frameworkTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16 },
  fwGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  fwItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    background: "var(--surface-2)",
    borderRadius: "var(--radius-sm)",
    fontSize: 13,
  },
  fwStatus: { fontSize: 12 },
};
