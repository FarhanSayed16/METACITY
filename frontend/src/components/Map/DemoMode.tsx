import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, X, Play } from 'lucide-react';

const DEMO_STEPS = [
  {
    title: 'Welcome to METACITY',
    text: 'METACITY is a high-performance urban mobility simulator. You are looking at the baseline road network.',
    action: (setParams: any) => setParams({ mode: '3d', theme: 'dark' })
  },
  {
    title: 'The Road Network',
    text: 'Every link in this 3D graph represents a real-world road segment. Red links indicate severe congestion where demand exceeds capacity.',
    action: (setParams: any) => setParams({ mode: '3d', theme: 'light' })
  },
  {
    title: 'Running a Simulation',
    text: 'Our macroscopic BPR assignment model distributes traffic to reach User Equilibrium, simulating thousands of agents instantly.',
    action: (_setParams: any) => {} // Could trigger a WebSocket connect here if we had a fixed run ID
  },
  {
    title: 'Compare Scenarios',
    text: 'By adding new transit lines or bypass highways, you can instantly compare the scenario against the baseline to measure the exact shift in commute times.',
    action: (_setParams: any) => {}
  }
];

export const DemoMode: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Check URL if we should auto-start demo
  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setIsOpen(true);
    }
  }, [searchParams]);

  const startDemo = () => {
    setIsOpen(true);
    setCurrentStep(0);
    setSearchParams(prev => { prev.set('demo', 'true'); return prev; }, { replace: true });
    DEMO_STEPS[0].action(setSearchParams);
  };

  const closeDemo = () => {
    setIsOpen(false);
    setSearchParams(prev => { prev.delete('demo'); return prev; }, { replace: true });
  };

  const nextStep = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      DEMO_STEPS[next].action(setSearchParams);
    } else {
      closeDemo();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      DEMO_STEPS[prev].action(setSearchParams);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={startDemo}
        className="absolute top-20 right-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg text-sm font-medium flex items-center gap-2 z-40 transition-transform hover:scale-105"
      >
        <Play size={16} /> Play Demo
      </button>
    );
  }

  const step = DEMO_STEPS[currentStep];

  return (
    <div className="absolute inset-x-0 bottom-12 mx-auto w-[600px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 flex flex-col pointer-events-auto">
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
        <button onClick={closeDemo} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <p className="text-gray-600 leading-relaxed mb-8">
        {step.text}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex space-x-1.5">
          {DEMO_STEPS.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:pointer-events-none flex items-center"
          >
            <ChevronLeft size={16} className="mr-1" /> Back
          </button>
          
          <button 
            onClick={nextStep}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center shadow-md transition-transform active:scale-95"
          >
            {currentStep === DEMO_STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>

    </div>
  );
};
