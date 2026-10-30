import { DiagramFigure, Sequence, Swimlane } from "./kit/DiagramKit";

/* Migration diagrams. They mirror the five-phase walkthrough in DatabaseMigrationArticle; change both together. */

export function MigrationOwnershipLanes() {
  return (
    <DiagramFigure scroll title="Who owns writes, reads, and replication · phase by phase" caption="DB A owns every write until the final phase. Reads move first because rolling them back is only a routing change; writes move once, behind a short fence, with a reverse stream ready.">
      <Swimlane
        columns={["1 · Seed", "2 · Stream", "3 · Validate", "4 · Move reads", "5 · Move writes"]}
        rows={[
          { label: "Writes", cells: [{ text: "DB A", tone: "neutral" }, { text: "DB A", tone: "neutral" }, { text: "DB A", tone: "neutral" }, { text: "DB A", tone: "neutral" }, { text: "Fenced switch → DB B", tone: "warn" }] },
          { label: "Reads", cells: [{ text: "DB A", tone: "neutral" }, { text: "DB A", tone: "neutral" }, { text: "DB A · shadow reads on B", tone: "info" }, { text: "Ramp to B: 1% → 100%", tone: "info" }, { text: "DB B", tone: "ok" }] },
          { label: "Replication", cells: [{ text: "Slot created, then snapshot at its position", tone: "info" }, { text: "CDC A → B", tone: "info" }, { text: "CDC A → B", tone: "info" }, { text: "CDC A → B", tone: "info" }, { text: "Reverse CDC B → A", tone: "info" }] },
          { label: "Exit check", cells: [{ text: "Copy complete", tone: "neutral" }, { text: "Lag steady, WAL retention safe", tone: "neutral" }, { text: "Zero divergence for a full cycle", tone: "ok" }, { text: "Latency and errors match A", tone: "ok" }, { text: "Reverse lag low", tone: "ok" }] },
          { label: "Rollback", cells: [{ text: "Drop B", tone: "ok" }, { text: "Drop B", tone: "ok" }, { text: "Drop B", tone: "ok" }, { text: "Route reads back to A", tone: "ok" }, { text: "Same fence, opposite way", tone: "warn" }] },
        ]}
      />
    </DiagramFigure>
  );
}

export function FencedCutoverSequence() {
  return (
    <DiagramFigure scroll title="The fenced write cutover · seconds, not hours" caption="The shaded rows are the only time writes wait. The proxy holds new writes, DB B applies A's final log position, and only then does B accept writes, with the reverse stream already running so rollback loses nothing.">
      <Sequence
        actors={["Write proxy", "DB A", "CDC stream", "DB B"]}
        window={{ from: 3, to: 6, label: "WRITE HOLD" }}
        steps={[
          { from: 0, to: 1, label: "writes go to A" },
          { from: 1, to: 2, label: "WAL changes" },
          { from: 2, to: 3, label: "apply · lag under 1 s", tone: "ok" },
          { from: 0, to: 0, label: "fence: hold new writes", tone: "warn" },
          { from: 2, to: 3, label: "apply A's final WAL position", tone: "info" },
          { from: 3, to: 0, label: "caught up to final position", tone: "ok" },
          { from: 0, to: 3, label: "route writes to B · release held requests", tone: "ok" },
          { from: 3, to: 1, label: "reverse stream B → A starts", tone: "info" },
        ]}
      />
    </DiagramFigure>
  );
}
