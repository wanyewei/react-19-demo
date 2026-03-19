import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  DemoLayout,
  ComparePanel,
  CodeBlock,
  LiveArea,
} from "../components/DemoLayout";
import { fakeUpdateName, fakeAddMember } from "../utils/fakeApi";

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
// React 19：useActionState + <form action>
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

// ========================================
// useFormStatus demo — prop drilling vs useFormStatus
// ========================================
function AddMemberOld() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setIsPending(true);
    setError(null);
    setSuccess(false);
    const err = await fakeAddMember(formData.get("name"), formData.get("role"));
    setIsPending(false);
    if (err) { setError(err); return; }
    setSuccess(true);
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.fieldGroup}>
        <input name="name" placeholder="名稱" disabled={isPending} style={{ ...styles.input, opacity: isPending ? 0.5 : 1 }} />
        <input name="role" placeholder="角色" disabled={isPending} style={{ ...styles.input, opacity: isPending ? 0.5 : 1 }} />
      </div>
      <div style={styles.formFooter}>
        <button type="submit" disabled={isPending} style={styles.btn}>
          {isPending ? "新增中..." : "新增成員"}
        </button>
        {isPending && <span style={styles.savingHint}>⏳ 儲存中...</span>}
      </div>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>新增成功！</p>}
    </form>
  );
}

function FormSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={styles.btn}>
      {pending ? "新增中..." : "新增成員"}
    </button>
  );
}

function FormSaveIndicator() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return <span style={styles.savingHint}>⏳ 儲存中...</span>;
}

function FormFieldGroup() {
  const { pending } = useFormStatus();
  return (
    <div style={styles.fieldGroup}>
      <input name="name" placeholder="名稱" disabled={pending} style={{ ...styles.input, opacity: pending ? 0.5 : 1 }} />
      <input name="role" placeholder="角色" disabled={pending} style={{ ...styles.input, opacity: pending ? 0.5 : 1 }} />
    </div>
  );
}

function AddMemberNew() {
  const [state, submitAction] = useActionState(
    async (_prev, formData) => {
      const err = await fakeAddMember(formData.get("name"), formData.get("role"));
      if (err) return { error: err, success: false };
      return { error: null, success: true };
    },
    { error: null, success: false }
  );

  return (
    <form action={submitAction}>
      <FormFieldGroup />
      <div style={styles.formFooter}>
        <FormSubmitButton />
        <FormSaveIndicator />
      </div>
      {state.error && <p style={styles.error}>{state.error}</p>}
      {state.success && <p style={styles.success}>新增成功！（表單已自動 reset）</p>}
    </form>
  );
}

export default function DemoActions() {
  return (
    <DemoLayout
      title="useActionState"
      description="建立在 Action 之上的進階 hook — 把 state、pending、action 三者整合成一個 hook，搭配 <form action> 和 useFormStatus 讓表單處理更簡潔。"
    >
      <div style={styles.insightBox}>
        <div style={styles.insightTitle}>前置知識</div>
        <p style={styles.insightText}>
          這頁的內容建立在 <strong>startTransition & Actions</strong> 的概念之上。
          <code>useActionState</code> 是把 Action pattern 再進一步封裝：
          一個 hook 取代 3-4 個 <code>useState</code>，搭配 <code>{"<form action>"}</code> 還能自動 reset 表單。
        </p>
      </div>

      <h2 style={styles.h2}>對比：手動管理 vs useActionState</h2>

      <ComparePanel
        before={
          <>
            <CodeBlock
              title="程式碼 — 手動管理 3 個 state"
              code={`const [name, setName] = useState('');
const [isPending, setIsPending] = useState(false);
const [error, setError] = useState(null);
const [success, setSuccess] = useState(false);

const handleSubmit = async () => {
  setIsPending(true);  // 手動開始
  setError(null);
  setSuccess(false);
  const err = await updateName(name);
  setIsPending(false); // 手動結束
  if (err) { setError(err); return; }
  setSuccess(true);
  setName('');
};

// 😫 4 個 useState
// 😫 手動 setIsPending(true/false)
// 😫 手動 setError / setSuccess
// 😫 手動 reset`}
            />
            <LiveArea label="Live Demo — 試著送出空白或單字">
              <UpdateNameOld />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼 — useActionState 一行搞定"
              code={`const [state, submitAction, isPending] =
  useActionState(async (prev, formData) => {
    const name = formData.get('name');
    const err = await updateName(name);
    if (err) return { error: err };
    return { error: null, success: true };
  }, { error: null, success: false });

// ✅ 0 個 useState
// ✅ isPending 自動管理
// ✅ error / success 在 return 值裡
// ✅ 搭配 <form action> 自動 reset`}
            />
            <LiveArea label="Live Demo — 行為一樣，code 少 60%">
              <UpdateNameWithAction />
            </LiveArea>
          </>
        }
      />

      <div style={styles.divider} />

      <h2 style={styles.h2}>進階：useFormStatus — 消除 prop drilling</h2>
      <p style={styles.subDesc}>
        當表單有多個子元件都需要知道 pending 狀態時，傳統做法要把 <code>isPending</code> 一路傳下去。
        <code>useFormStatus</code> 讓任何 <code>{"<form>"}</code> 底下的子元件<strong>直接讀取 pending</strong>，不用接收 prop。
      </p>

      <ComparePanel
        beforeLabel="Prop Drilling"
        afterLabel="useFormStatus"
        before={
          <>
            <CodeBlock
              title="程式碼 — 手動傳 isPending 給每個子元件"
              code={`function AddMemberForm() {
  const [isPending, setIsPending] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      {/* 😫 每個子元件都要傳 isPending */}
      <FieldGroup isPending={isPending} />
      <SubmitBtn isPending={isPending} />
      <SaveIndicator isPending={isPending} />
    </form>
  );
}

// 3 個子元件 × isPending prop = prop drilling`}
            />
            <LiveArea label="Live Demo — isPending 手動傳遞">
              <AddMemberOld />
            </LiveArea>
          </>
        }
        after={
          <>
            <CodeBlock
              title="程式碼 — 子元件自己讀取 form 狀態"
              code={`function FieldGroup() {
  const { pending } = useFormStatus();
  return <input disabled={pending} />;
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>...</button>;
}

function SaveIndicator() {
  const { pending } = useFormStatus();
  return pending ? <span>儲存中...</span> : null;
}

function AddMemberForm() {
  const [state, action] = useActionState(fn, init);
  return (
    <form action={action}>
      {/* ✅ 不用傳任何 prop！ */}
      <FieldGroup />
      <SubmitBtn />
      <SaveIndicator />
    </form>
  );
}`}
            />
            <LiveArea label="Live Demo — useFormStatus 自動讀取">
              <AddMemberNew />
            </LiveArea>
          </>
        }
      />
    </DemoLayout>
  );
}

const styles = {
  insightBox: {
    padding: "20px 24px",
    background: "var(--surface)",
    border: "1px solid var(--accent)",
    borderLeft: "4px solid var(--accent)",
    borderRadius: "var(--radius)",
    marginBottom: 20,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--accent)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "var(--text)",
  },
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
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 12,
  },
  formFooter: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  savingHint: {
    fontSize: 13,
    color: "var(--orange, #f59e0b)",
    fontWeight: 500,
  },
};
