import { Info, X } from 'lucide-react';

interface AssumptionsDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function AssumptionsDrawer({ opened, onClose }: AssumptionsDrawerProps) {
  if (!opened) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-xl z-50 transform transition-transform duration-300 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Simulation Claims & Assumptions</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-6">
            METACITY relies on a series of modeling assumptions. These should be considered when interpreting comparison results.
          </p>
          
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm text-gray-700">
              <div className="flex-shrink-0 mt-0.5"><Info className="text-[var(--accent)]" size={18} /></div>
              <div><b>Static Departure Times:</b> Agents do not dynamically adjust their departure times to avoid congestion.</div>
            </li>
            <li className="flex gap-3 text-sm text-gray-700">
              <div className="flex-shrink-0 mt-0.5"><Info className="text-[var(--accent)]" size={18} /></div>
              <div><b>BPR Volume-Delay:</b> Link travel times are estimated using the standard Bureau of Public Roads (BPR) function, which may overestimate delays at extreme V/C ratios.</div>
            </li>
            <li className="flex gap-3 text-sm text-gray-700">
              <div className="flex-shrink-0 mt-0.5"><Info className="text-[var(--accent)]" size={18} /></div>
              <div><b>Synthetic Demand:</b> If marked as synthetic, the agent population is mathematically generated rather than derived from empirical census data.</div>
            </li>
            <li className="flex gap-3 text-sm text-gray-700">
              <div className="flex-shrink-0 mt-0.5"><Info className="text-[var(--accent)]" size={18} /></div>
              <div><b>Multinomial Logit Choice:</b> Mode choices (Car, Walk, Transit) rely on simple fixed utilities, without modeling complex household vehicle constraints.</div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
