export default function Sidebar({ demos, activeDemo, onSelect }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>⚛️</span>
        <div>
          <div style={styles.title}>React 19</div>
          <div style={styles.subtitle}>新功能 Demo</div>
        </div>
      </div>
      <div style={styles.list}>
        {demos.map((demo) => (
          <button
            key={demo.id}
            onClick={() => onSelect(demo.id)}
            style={{
              ...styles.item,
              ...(activeDemo === demo.id ? styles.itemActive : {}),
            }}
          >
            {demo.label}
          </button>
        ))}
      </div>
      <div style={styles.footer}>
        <span style={styles.badge}>v19.2.4</span>
        <span style={styles.footerText}>Vite + React</span>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    width: 260,
    minWidth: 260,
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 16px",
    gap: 8,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 8px 20px",
    borderBottom: "1px solid var(--border)",
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text)",
  },
  subtitle: {
    fontSize: 12,
    color: "var(--text-dim)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  item: {
    background: "transparent",
    border: "none",
    color: "var(--text-dim)",
    padding: "10px 12px",
    borderRadius: "var(--radius-sm)",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.15s",
  },
  itemActive: {
    background: "var(--accent)",
    color: "#fff",
  },
  footer: {
    borderTop: "1px solid var(--border)",
    paddingTop: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingLeft: 8,
  },
  badge: {
    background: "var(--accent)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 99,
  },
  footerText: {
    fontSize: 12,
    color: "var(--text-dim)",
  },
};
