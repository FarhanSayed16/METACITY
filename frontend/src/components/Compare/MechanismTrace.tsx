import { AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

interface MechanismTraceProps {
  mechanisms: string[];
}

export function MechanismTrace({ mechanisms }: MechanismTraceProps) {
  if (!mechanisms || mechanisms.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <h3 className="text-md font-semibold text-gray-900 flex items-center gap-2 mb-1">
        <TrendingUp size={20} className="text-gray-700" />
        Mechanism Trace
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Top drivers explaining the KPI changes between baseline and scenario.
      </p>
      
      <ul className="space-y-3">
        {mechanisms.map((mech, idx) => (
          <li key={idx} className="flex gap-3 text-sm text-gray-700 items-start">
            <div className="flex-shrink-0 mt-0.5">
              <div className="bg-purple-100 p-1 rounded-full text-purple-600">
                <ArrowRight size={14} />
              </div>
            </div>
            <span>{mech}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-5 flex items-center gap-1.5 text-xs text-gray-400 border-t border-gray-100 pt-3">
        <AlertTriangle size={14} />
        <span>Trace is generated from a single representative paired seed.</span>
      </div>
    </div>
  );
}
