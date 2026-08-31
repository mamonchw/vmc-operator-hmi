import React, { ReactNode } from 'react';
import { Settings, PowerOff } from 'lucide-react';
import type { WorkflowState } from '../services/api';

interface LayoutProps {
  children: ReactNode;
  workflowState: WorkflowState | null;
  machineName?: string;
  onReset?: () => void;
}

const STAGES = [
  "POWER_ON",
  "MACHINE_CHECKS",
  "TOOLS",
  "WORKPIECE",
  "READY",
  "OPERATION_READY",
  "RUNNING",
  "STOPPED"
];

const getStageIndex = (stage: string) => STAGES.indexOf(stage);

export const Layout: React.FC<LayoutProps> = ({ children, workflowState, machineName = "VMC-01", onReset }) => {
  const currentStage = workflowState?.current_stage || 'POWER_ON';
  const stageIndex = getStageIndex(currentStage);
  
  // Calculate display step (1 to 5) ignoring power_on and stopped
  let displayStep = 0;
  if (stageIndex >= 1) {
    if (currentStage === "MACHINE_CHECKS") displayStep = 1;
    else if (currentStage === "TOOLS") displayStep = 2;
    else if (currentStage === "WORKPIECE") displayStep = 3;
    else if (currentStage === "READY") displayStep = 4;
    else displayStep = 5; // RUNNING or STOPPED
  }

  const stageTitles: Record<string, string> = {
    "POWER_ON": "SYSTEM STARTUP",
    "MACHINE_CHECKS": "MACHINE CHECKS",
    "TOOLS": "REQUIRED TOOLS",
    "WORKPIECE": "WORKPIECE SETUP",
    "READY": "READY REVIEW",
    "OPERATION_READY": "OPERATION READY",
    "RUNNING": "OPERATION RUNNING",
    "STOPPED": "OPERATION STOPPED"
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans">
      {/* Top Bar */}
      <header className="bg-black border-b border-neutral-800 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Settings className="text-white" size={32} />
          <h1 className="text-2xl font-bold tracking-wider text-neutral-200">Primeform VMC OPERATOR HMI</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-neutral-900 px-4 py-2 rounded-lg border border-neutral-700">
            <span className="text-neutral-400 font-semibold mr-2">MACHINE:</span>
            <span className="text-white font-bold text-xl">{machineName}</span>
          </div>
          {onReset && (
            <button onClick={onReset} className="text-neutral-400 hover:text-red-400 border border-neutral-600 px-4 py-1 rounded transition-colors font-bold tracking-widest text-sm" title="Reset System">
              RESET
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-8 max-w-6xl mx-auto w-full">
        {displayStep > 0 && (
          <div className="mb-8 border-b border-neutral-700 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-bold tracking-widest text-sm mb-1">
                  STEP {displayStep} OF 5
                </div>
                <h2 className="text-4xl font-extrabold text-white tracking-tight">
                  {stageTitles[currentStage] || currentStage}
                </h2>
              </div>
              
              {/* Progress Indicator */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(step => (
                  <div 
                    key={step} 
                    className={`h-3 w-16 rounded-full ${
                      step < displayStep ? 'bg-emerald-500' :
                      step === displayStep ? 'bg-white animate-pulse' :
                      'bg-neutral-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
