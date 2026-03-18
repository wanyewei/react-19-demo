import { useState, useTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  DemoLayout,
  ComparePanel,
  CodeBlock,
  LiveArea,
} from "../components/DemoLayout";
import { fakeUpdateName } from "../utils/fakeApi";

// ========================================
// React 18 做法：手動管理所有狀態
// ========================================
function UpdateNameOld() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setIsPending(true);
    setError(null);
    setSuccess(false);
    const err = await fakeUpdateName(name);
    setIsPending(false);
    if (err) {
      setError(err);
      return;
    }
    setSuccess(true);
    setName("");
  };

  return (
    <div>
      <div style={styles.inputRow}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="輸入新名稱..."
          style={styles.input}
        />
        <button onClick={handleSubmit} disabled={isPending} style={styles.btn}>
          {isPending ? "更新中..." : "更新"}
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>更新成功！</p>}
    </div>
  );
}

// ========================================
// React 19 做法 (1)：useTransition 支援 async
// ========================================
function UpdateNameWithTransition() {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    startTransition(async () => {
      setError(null);
      setSuccess(false);
      const err = await fakeUpdateName(name);
      if (err) {
        setError(err);
        return;
      }
      setSuccess(true);
      setName("");
    });
  };

  return (
    <div>
      <div style={styles.inputRow}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="輸入新名稱..."
          style={styles.input}
        />
        <button onClick={handleSubmit} disabled={isPending} style={styles.btn}>
          {isPending ? "更新中..." : "更新"}
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>更新成功！</p>}
    </div>
  );
}

// ========================================
// React 19 做法 (2)：useActionState + <form action>
// ========================================
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={styles.btn}>
      {pending ? "更新中..." : "更新"}
    </button>
  );
}

function UpdateNameWithAction() {
  const [state, submitAction, isPending] = useActionState(
    async (_previousState, formData) => {
      const name = formData.get("name");
      const err = await fakeUpdateName(name);
      if (err) return { error: err, success: false };
      return { error: null, success: true };
    },
    { error: null, success: false }
  );

  return (
    <form action={submitAction}>
      <div style={styles.inputRow}>
        <input
          name="name"
          placeholder="輸入新名稱..."
          style={styles.input}
        />
        <SubmitButton />
      </div>
      {state.error && <p style={styles.error}>{state.error}</p>}
      {state.success && <p style={styles.success}>更新成功！（表單已自動 reset）</p>}
    </form>
  );
}

export default function DemoActions() {
  return (
    <DemoLayout
      title="Actions & useActionState"
      description="React 19 讓 useTransition 支援 async function，並新增 useActionState 搭配 <form action> 大幅簡化表單處理。不用再手動管理 isPending / error / reset。"
    >
      <ComparePanel
        before={
          <>
            <CodeBlock
              title="程式碼"
              code={`const [isPending, setIsPending] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async () => {
  setIsPending(true);  // 手動開始
  setError(null);
  const err = await updateName(name);
  setIsPending(false); // 手動結束
  if (err) setError(err);
};

// 需要 3 個 useState 來管理狀態`}
            />
            <LiveArea label="Live Demo — 試著送出空白或單字">
              <UpdateNameOld />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="React 19 — useActionState"
              code={`const [state, submitAction, isPending] = useActionState(
  async (prevState, formData) => {
    const err = await updateName(formData.get("name"));
    if (err) return { error: err, success: false };
    return { error: null, success: true };
    // ✅ isPending、error、success 全部自動管理
    // ✅ 表單送出後自動 reset
  },
  { error: null, success: false }
);

// useTransition 可以讓 isPending 自動管理，
// 但 error / success 仍需自己處理。
// useActionState 把三者全部包在一起。`}
            />
            <LiveArea label="Live Demo — useActionState">
              <UpdateNameWithAction />
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <h2 style={styles.h2}>進階：useActionState + {"<form action>"}</h2>
      <p style={styles.subDesc}>
        更進一步，用 <code>useActionState</code> 搭配 <code>{"<form action={fn}>"}</code>，
        連 <code>useState</code> 都不需要了。表單送出後還會自動 reset。
        子元件可以用 <code>useFormStatus</code> 讀取父層 form 的 pending 狀態。
      </p>
      <div style={styles.singlePanel}>
        <div style={{ ...styles.tag, background: "var(--green)" }}>
          React 19 — useActionState
        </div>
        <CodeBlock
          title="程式碼"
          code={`// 一個 hook 搞定 state + pending + action
const [state, submitAction, isPending] = useActionState(
  async (prevState, formData) => {
    const err = await updateName(formData.get("name"));
    if (err) return { error: err };
    return { error: null, success: true };
  },
  { error: null, success: false }
);

// 搭配 <form action={submitAction}>
// 表單成功後自動 reset！

// 子元件用 useFormStatus 讀取 pending
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>...</button>;
}`}
        />
        <LiveArea label="Live Demo — useActionState + form action">
          <UpdateNameWithAction />
        </LiveArea>
      </div>
    </DemoLayout>
  );
}

const styles = {
  inputRow: {
    display: "flex",
    gap: 8,
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    color: "var(--text)",
    fontSize: 14,
    outline: "none",
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
    whiteSpace: "nowrap",
  },
  error: {
    color: "var(--red)",
    fontSize: 13,
    marginTop: 8,
  },
  success: {
    color: "var(--green)",
    fontSize: 13,
    marginTop: 8,
  },
  divider: {
    borderTop: "1px solid var(--border)",
    margin: "8px 0",
  },
  h2: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 8,
  },
  subDesc: {
    color: "var(--text-dim)",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 1.7,
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
    padding: "3px 12px",
    borderRadius: 99,
    letterSpacing: "0.5px",
  },
};
