import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const hasSeen = localStorage.getItem('metacity_onboarding_seen');
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('metacity_onboarding_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-[101] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Welcome to METACITY</h2>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 min-h-[200px]">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-semibold text-gray-800 mb-2">1. Decision Mode</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Start at <b>Decision</b>. Pick a city (Nexus City) and an infrastructure plan such as the <b>Highway Bypass</b> — no drawing required.
              </p>
            </div>
          )}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-semibold text-gray-800 mb-2">2. Before vs after</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                We automatically run the <b>baseline</b> and your <b>plan</b> with matching seeds, then open an Impact briefing with travel time and citizen stress.
              </p>
            </div>
          )}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-semibold text-gray-800 mb-2">3. Citizen impact</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Stress and Impatience scores are derived from trip delays (Level-1). They show how people&apos;s day may feel if the plan is built — not microsimulated emotions.
              </p>
            </div>
          )}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-semibold text-gray-800 mb-2">4. 3D Twin & Advanced lab</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Open the <b>City Twin</b> from the briefing to see the after run in 3D. Use TopBar <b>Advanced lab</b> only if you need the network editor, DSA, or hospital/evac modules.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-6 bg-[var(--accent)]' : 'w-1.5 bg-gray-300'}`} />
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>Skip</Button>
            {step < 4 ? (
              <Button onClick={() => setStep(s => s + 1)}>Next</Button>
            ) : (
              <Button onClick={handleClose}>Get Started</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
