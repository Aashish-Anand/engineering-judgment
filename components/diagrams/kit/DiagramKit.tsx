import type { CSSProperties, ReactNode } from "react";
import { DiagramMotion } from "./DiagramMotion";
import styles from "./DiagramKit.module.css";

/* Shared, server-rendered diagram primitives for the article frame. Colors come from the
   neo and category tokens, so every diagram follows the article's theme and category. */

export type Tone = "neutral" | "accent" | "info" | "ok" | "warn" | "bad";

const order = (i: number) => ({ "--i": i }) as CSSProperties;

export function DiagramFigure({ id, title, caption, scroll = false, animate = true, controls, children }: { id?: string; title: string; caption?: ReactNode; scroll?: boolean; animate?: boolean; controls?: ReactNode; children: ReactNode }) {
  return (
    <figure id={id} className={styles.figure} aria-label={title}>
      <DiagramMotion title={title} enabled={animate}>
        {controls && <div className={styles.controls}>{controls}</div>}
        {scroll && <p className={styles.scrollHint}>Scroll sideways to see every column →</p>}
        <div className={scroll ? styles.scroll : styles.body}>{children}</div>
      </DiagramMotion>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}

/* ── Sequence: actors as columns, messages as rows ─────────────────── */

export type SequenceStep = { from: number; to: number; label: string; detail?: string; tone?: Tone };

export function Sequence({ actors, steps, window }: { actors: string[]; steps: SequenceStep[]; window?: { from: number; to: number; label: string } }) {
  const columns = { "--cols": actors.length } as CSSProperties;
  return (
    <div className={styles.sequence} style={columns}>
      <div className={styles.lifelines} aria-hidden="true">{actors.map(a => <span key={a} />)}</div>
      <div className={styles.actors}>{actors.map(a => <strong key={a}>{a}</strong>)}</div>
      <ol className={styles.steps}>
        {steps.map((step, i) => {
          const start = Math.min(step.from, step.to);
          const span = Math.abs(step.to - step.from) + 1;
          const inWindow = window && i >= window.from && i <= window.to;
          const place = { gridColumn: `${start + 1} / span ${span}`, "--span": span, ...order(i) } as CSSProperties;
          return (
            <li key={i} className={`${styles.stepRow} ${inWindow ? styles.inWindow : ""}`}>
              {window && i === window.from && <span className={styles.windowLabel}>{window.label}</span>}
              <div className={`${styles.message} ${styles[step.tone ?? "neutral"]} ${step.from === step.to ? styles.self : step.to < step.from ? styles.leftward : ""}`} style={place}>
                <span className={styles.messageLabel}>{step.label}</span>
                {step.from !== step.to && <span className={styles.arrow} aria-hidden="true" />}
                {step.detail && <span className={styles.messageDetail}>{step.detail}</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ── Branch flow: a shared path that forks into outcomes ───────────── */

export type BranchStep = { text: string; marker?: string };
export type Branch = { label: string; tone: Tone; steps: BranchStep[]; end: string };

export function BranchFlow({ trunk, branches }: { trunk: string[]; branches: Branch[] }) {
  return (
    <div className={styles.branchFlow}>
      <ol className={styles.trunk}>
        {trunk.map((node, i) => <li key={node} style={order(i)}><span>{node}</span></li>)}
      </ol>
      <div className={styles.fork} aria-hidden="true" />
      <div className={styles.branches}>
        {branches.map((branch, b) => (
          <section key={branch.label} className={`${styles.branch} ${styles[branch.tone]}`} style={order(trunk.length + b)}>
            <h4>{branch.label}</h4>
            <ol>
              {branch.steps.map(step => (
                <li key={step.text}>{step.text}{step.marker && <em>{step.marker}</em>}</li>
              ))}
            </ol>
            <p>{branch.end}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ── Amplification: how many calls reach each layer ────────────────── */

const MAX_DOTS = 32;

export type AmplificationColumn = { title: string; tone: Tone; levels: { label: string; calls: number }[]; total: string };

export function Amplification({ columns }: { columns: AmplificationColumn[] }) {
  return (
    <div className={styles.amplification}>
      {columns.map(column => (
        <section key={column.title} className={`${styles.ampColumn} ${styles[column.tone]}`}>
          <h4>{column.title}</h4>
          <ol>
            {column.levels.map((level, i) => (
              <li key={level.label} style={order(i)}>
                <span className={styles.ampLabel}>{level.label}</span>
                <span className={styles.dots} aria-hidden="true">
                  {Array.from({ length: Math.min(level.calls, MAX_DOTS) }, (_, d) => <i key={d} style={{ "--d": d } as CSSProperties} />)}
                  {level.calls > MAX_DOTS && <small>+{level.calls - MAX_DOTS}</small>}
                </span>
                <b>{level.calls} {level.calls === 1 ? "call" : "calls"}</b>
              </li>
            ))}
          </ol>
          <p>{column.total}</p>
        </section>
      ))}
    </div>
  );
}

/* ── Budget bars: stacked demand against a hard limit ─────────────── */

export type BudgetRow = { label: string; segments: { label: string; value: number; tone: Tone }[]; note: string };

export function BudgetBars({ max, limit, limitLabel, unit, rows }: { max: number; limit: number; limitLabel: string; unit: string; rows: BudgetRow[] }) {
  const limitPosition = { "--at": `${(limit / max) * 100}%` } as CSSProperties;
  return (
    <div className={styles.budget}>
      {rows.map((row, i) => {
        const total = row.segments.reduce((sum, s) => sum + s.value, 0);
        const over = total > limit;
        return (
          <div key={row.label} className={styles.budgetRow} style={order(i)}>
            <div className={styles.budgetHead}><strong>{row.label}</strong><span className={over ? styles.overText : styles.okText}>{total} {unit}{over ? ` · ${total - limit} over` : ""}</span></div>
            <div className={styles.track} style={limitPosition}>
              {row.segments.map(segment => (
                <span key={segment.label} className={`${styles.segment} ${styles[segment.tone]}`} style={{ "--w": `${(segment.value / max) * 100}%` } as CSSProperties} title={`${segment.label}: ${segment.value}`}>
                  <span>{segment.label}</span>
                </span>
              ))}
              <span className={styles.limit} aria-hidden="true" />
            </div>
            <p>{row.note}</p>
          </div>
        );
      })}
      <div className={styles.limitLegend} style={limitPosition}><span>{limitLabel}</span></div>
    </div>
  );
}

/* ── Swimlane: who reads and writes what in each phase ─────────────── */

export type LaneCell = { text: string; tone: Tone } | null;

export function Swimlane({ columns, rows }: { columns: string[]; rows: { label: string; cells: LaneCell[] }[] }) {
  const columnsStyle = { "--cols": columns.length } as CSSProperties;
  return (
    <div className={styles.swimlane} style={columnsStyle} role="table" aria-label="Phase by component">
      <div className={styles.laneHead} role="row">
        <span role="columnheader" />
        {columns.map((c, i) => <span key={c} role="columnheader" style={order(i)}>{c}</span>)}
      </div>
      {rows.map(row => (
        <div key={row.label} className={styles.laneRow} role="row">
          <strong role="rowheader">{row.label}</strong>
          {row.cells.map((cell, i) => (
            <span key={i} role="cell" className={cell ? `${styles.cell} ${styles[cell.tone]}` : styles.empty} style={order(i)}>
              {cell ? cell.text : "—"}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
