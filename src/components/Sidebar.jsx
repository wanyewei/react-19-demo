export default function Sidebar({ groups, activeDemo, onSelect }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>⚛️</span>
        <div>
          <div style={styles.title}>React 19</div>
          <div style={styles.subtitle}>新功能完整介紹</div>
        </div>
      </div>
      <div style={styles.list}>
        {groups.map((group) => (
          <div key={group.label} style={styles.group}>
            <div style={styles.groupLabel}>
              <span>{group.icon}</span>
              <span>{group.label}</span>
            </div>
            {group.items.map((demo) => (
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
    width: 272,
    minWidth: 272,
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    padding: "24px 14px",
    gap: 4,
    overflowY: "auto",
    maxHeight: "100vh",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 8px 20px",
    borderBottom: "1px solid var(--border)",
    marginBottom: 4,
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
    gap: 2,
    flex: 1,
  },
  group: {
    marginBottom: 4,
  },
  groupLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "10px 10px 4px",
    userSelect: "none",
  },
  item: {
    display: "block",
    width: "100%",
    background: "transparent",
    border: "none",
    color: "var(--text-dim)",
    padding: "8px 12px 8px 28px",
    borderRadius: "var(--radius-sm)",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.15s",
    lineHeight: 1.4,
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
