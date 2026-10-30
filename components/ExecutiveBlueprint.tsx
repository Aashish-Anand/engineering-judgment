import neo from "@/components/Neo.module.css";

type ExecutiveBlueprintProps = {
  bottleneck: string;
  solution: string;
  goldenRule: string;
  keyMetrics?: { label: string; value: string }[];
};

/** The article brief's "The fix" tab: the problem, the fix, the rule, and key thresholds. */
export function ExecutiveBlueprint({ bottleneck, solution, goldenRule, keyMetrics }: ExecutiveBlueprintProps) {
  return (
    <>
      <dl className={neo.briefQuick}>
        <div><dt>Bottleneck</dt><dd>{bottleneck}</dd></div>
        <div><dt>Fix</dt><dd>{solution}</dd></div>
        <div><dt>Rule</dt><dd><strong>{goldenRule}</strong></dd></div>
      </dl>
      {keyMetrics && keyMetrics.length > 0 && (
        <dl className={neo.briefFacts}>
          {keyMetrics.map(m => <div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>)}
        </dl>
      )}
    </>
  );
}
