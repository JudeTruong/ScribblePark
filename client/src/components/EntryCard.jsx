const TYPE_EMOJI = {
  flower: "🌸",
  tree: "🌳",
  bush: "🌿",
  mushroom: "🍄",
  rabbit: "🐇",
  toad: "🐸",
  bug: "🐛",
  snail: "🐌",
  butterfly: "🦋",
  bird: "🐦",
  fish: "🐟",
  duck: "🦆",
  fruit: "🍎",
  landfill: "🗑️",
};

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function EntryCard({ creations, lastCreation, onContinue }) {
  const { classification, name, imageUrl } = lastCreation;

  const sameType = creations.filter(
    (c) => (c.classification || c.category) === classification
  );
  const typeCount = sameType.length;

  const hasName = name && name !== "Unnamed";
  const sameName = hasName
    ? creations.filter(
        (c) =>
          (c.name || c.creatorName || "")
            .trim()
            .toLowerCase() === name.trim().toLowerCase()
      ).length
    : 0;

  const totalCount = creations.length;
  const emoji = TYPE_EMOJI[classification] ?? "✏️";
  const label = classification.charAt(0).toUpperCase() + classification.slice(1);

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.card,
          ...(imageUrl ? {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "120px 120px",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center top",
            paddingTop: "140px",
          } : {}),
        }}
      >
        <div style={styles.emoji}>{emoji}</div>

        <h2 style={styles.heading}>
          {hasName ? `"${name}" is in the park!` : `Your ${label} is in the park!`}
        </h2>

        <div style={styles.statsGrid}>
          <div style={styles.stat}>
            <span style={styles.statNumber}>{ordinal(typeCount)}</span>
            <span style={styles.statLabel}>{label} in the meadow</span>
          </div>

          {hasName && (
            <div style={styles.stat}>
              <span style={styles.statNumber}>{sameName}</span>
              <span style={styles.statLabel}>
                {sameName === 1 ? "creation" : "creations"} named "{name}"
              </span>
            </div>
          )}

          <div style={styles.stat}>
            <span style={styles.statNumber}>{totalCount}</span>
            <span style={styles.statLabel}>
              {totalCount === 1 ? "creation" : "creations"} total
            </span>
          </div>
        </div>

        <button type="button" onClick={onContinue} style={styles.button}>
          See it in the meadow →
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(30, 48, 28, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "24px",
    backdropFilter: "blur(4px)",
  },
  card: {
    background: "#fff9e8",
    border: "3px solid #4d6b3b",
    borderRadius: "20px",
    padding: "32px 28px 28px",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
    fontFamily: "'Fredoka', system-ui, sans-serif",
    boxShadow: "0 12px 40px rgba(30, 48, 28, 0.25)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  imageWrap: {
    display: "none",
  },
  emoji: {
    fontSize: "32px",
    lineHeight: 1,
    marginTop: "-8px",
  },
  heading: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#2f472f",
    lineHeight: 1.2,
  },
  statsGrid: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
    width: "100%",
  },
  stat: {
    background: "#f0f7e4",
    border: "2px solid #c8ddb0",
    borderRadius: "12px",
    padding: "10px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    minWidth: "90px",
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#3d6b38",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "#5c6650",
    lineHeight: 1.3,
  },
  button: {
    marginTop: "4px",
    padding: "12px 28px",
    borderRadius: "10px",
    border: "2px solid #4d6b3b",
    background: "#5d8f4a",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 600,
    fontFamily: "'Fredoka', system-ui, sans-serif",
    cursor: "pointer",
    width: "100%",
  },
};
