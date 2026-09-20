

interface CalibrationBadgeProps {
  status: string;
}

export function CalibrationBadge({ status }: CalibrationBadgeProps) {
  let colorClass = 'bg-red-100 text-red-800 border-red-200';
  let label = 'Synthetic / Uncalibrated';

  if (status === 'calibrated') {
    colorClass = 'bg-green-100 text-green-800 border-green-200';
    label = 'Calibrated';
  } else if (status === 'partially_calibrated') {
    colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    label = 'Partially Calibrated';
  } else if (status === 'synthetic_uncalibrated') {
    colorClass = 'bg-red-100 text-red-800 border-red-200';
    label = 'Synthetic / Uncalibrated';
  } else {
    label = status.replace('_', ' ').toUpperCase();
  }

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} cursor-help`}
      title="Indicates the level of real-world data validation in this baseline."
    >
      {label}
    </span>
  );
}
