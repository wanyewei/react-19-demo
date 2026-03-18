export function DemoLayout({ title, description, children }) {
  return (
    <div>
      <h1 style={styles.title}>{title}</h1>
      {description && <p style={styles.desc}>{description}</p>}
      <div style={styles.content}>{children}</div>
    </div>
  );
}

export function ComparePanel({ before, after, beforeLabel, afterLabel }) {
  return (
    <div style={styles.grid}>
      <div style={styles.panel}>
        <div style={{ ...styles.tag, background: "var(--red)" }}>
          {beforeLabel || "React 18"}
        </div>
        {before}
      </div>
      <div style={styles.panel}>
        <div style={{ ...styles.tag, background: "var(--green)" }}>
          {afterLabel || "React 19"}
        </div>
        {after}
      </div>
    </div>
  );
}

export function CodeBlock({ title, code }) {
  return (
    <div style={styles.codeWrap}>
      {title && <div style={styles.codeTitle}>{title}</div>}
      <pre style={styles.pre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function LiveArea({ children, label }) {
  return (
    <div style={styles.liveWrap}>
      {label && <div style={styles.liveLabel}>{label}</div>}
      <div style={styles.liveContent}>{children}</div>
    </div>
  );
}

const styles = {
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
  },
  desc: {
    color: "var(--text-dim)",
    fontSize: 15,
    marginBottom: 32,
    maxWidth: 700,
    lineHeight: 1.7,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },
  panel: {
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
  codeWrap: {
    marginTop: 12,
  },
  codeTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-dim)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  pre: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: 16,
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: "auto",
    color: "var(--text)",
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  liveWrap: {
    marginTop: 16,
  },
  liveLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--accent)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  liveContent: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: 20,
  },
};
