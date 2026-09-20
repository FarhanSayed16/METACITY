interface CalibrationBadgeProps {
  status: string;
  onClick?: () => void;
}

/** Trust badge — click opens Claims & Assumptions when `onClick` is provided. */
export function CalibrationBadge({ status, onClick }: CalibrationBadgeProps) {
  let colorClass = 'bg-red-50 text-red-800 border-red-200';
  let label = 'Synthetic / Uncalibrated';

  if (status === 'calibrated') {
    colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    label = 'Calibrated';
  } else if (status === 'partially_calibrated') {
    colorClass = 'bg-amber-50 text-amber-900 border-amber-200';
    label = 'Partially Calibrated';
  } else if (status === 'synthetic_uncalibrated') {
    colorClass = 'bg-red-50 text-red-800 border-red-200';
    label = 'Synthetic / Uncalibrated';
  } else {
    label = status.replace(/_/g, ' ');
  }

  const interactive = Boolean(onClick);
  const Tag = interactive ? 'button' : 'span';

  return (
    <Tag
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${
        interactive
          ? 'cursor-pointer hover:ring-2 hover:ring-[var(--accent)]/30 transition-shadow'
          : 'cursor-help'
      }`}
      title={
        interactive
          ? 'Open claims & assumptions'
          : 'Indicates the level of real-world data validation in this baseline.'
      }
    >
      {label}
      {interactive && <span className="ml-1.5 opacity-70">· Assumptions</span>}
    </Tag>
  );
}
