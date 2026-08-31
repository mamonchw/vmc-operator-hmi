import React, { useEffect, useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { ChecklistItem } from './components/ChecklistItem';
import api, { 
  fetchState, advanceWorkflow, startOperation, stopOperation,
  confirmMachineCheck, confirmTool, confirmWorkpieceSetup, resetWorkflow
} from './services/api';
import type { FullState } from './services/api';
import { Loader2, AlertTriangle, Play, Square, CheckCircle, CheckCircle2 } from 'lucide-react';

function App() {
  const [state, setState] = useState<FullState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const loadState = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchState();
      setState(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to connect to HMI backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const handleAdvance = async () => {
    try {
      setProcessing(true);
      await advanceWorkflow();
      await loadState();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to advance workflow.');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmCheck = async (id: number) => {
    try {
      setProcessing(true);
      await confirmMachineCheck(id);
      await loadState();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmTool = async (id: number) => {
    try {
      setProcessing(true);
      await confirmTool(id);
      await loadState();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmWorkpiece = async (id: number) => {
    try {
      setProcessing(true);
      await confirmWorkpieceSetup(id);
      await loadState();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleStart = async () => {
    try {
      setProcessing(true);
      await startOperation();
      await loadState();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleStop = async () => {
    try {
      setProcessing(true);
      await stopOperation();
      await loadState();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset the machine state?')) {
      try {
        setProcessing(true);
        await resetWorkflow();
        await loadState();
      } catch (err) {
        console.error(err);
      } finally {
        setProcessing(false);
      }
    }
  };

  if (loading && !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={64} className="animate-spin text-white" />
          <h2 className="text-2xl font-bold text-neutral-400 tracking-widest">INITIALIZING VMC...</h2>
        </div>
      </div>
    );
  }

  if (error && !state) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-8">
        <div className="card max-w-2xl w-full text-center py-12">
          <AlertTriangle size={64} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">CONNECTION ERROR</h2>
          <p className="text-neutral-400 text-lg mb-8">{error}</p>
          <button onClick={loadState} className="btn-primary">RETRY CONNECTION</button>
        </div>
      </div>
    );
  }

  if (!state) return null;

  const { workflow, scenario, machine_checks, tools, workpiece_setup } = state;
  const stage = workflow.current_stage;

  // Determine if next is allowed
  let nextAllowed = false;
  if (stage === 'MACHINE_CHECKS') {
    nextAllowed = machine_checks.every(c => c.is_confirmed);
  } else if (stage === 'TOOLS') {
    nextAllowed = tools.every(t => t.is_confirmed);
  } else if (stage === 'WORKPIECE') {
    nextAllowed = workpiece_setup.every(w => w.is_confirmed);
  }

  return (
    <Layout workflowState={workflow} onReset={handleReset}>
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6 flex items-center gap-3">
          <AlertTriangle size={24} />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* POWER ON STAGE */}
      {stage === 'POWER_ON' && (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center max-w-lg">
            <h2 className="text-4xl font-bold text-white mb-6">SYSTEM READY</h2>
            <p className="text-xl text-neutral-400 mb-12">
              Power is on and control system is active. Please proceed with machine startup checks.
            </p>
            <button 
              onClick={handleAdvance} 
              disabled={processing}
              className="btn-primary w-full py-6 text-2xl"
            >
              BEGIN STARTUP CHECKS
            </button>
          </div>
        </div>
      )}

      {/* MACHINE CHECKS STAGE */}
      {stage === 'MACHINE_CHECKS' && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto pr-4 mb-6">
            {machine_checks.map(check => (
              <ChecklistItem
                key={check.id}
                title={check.check_name}
                description={check.description}
                isConfirmed={check.is_confirmed}
                onConfirm={() => handleConfirmCheck(check.id)}
                disabled={processing}
              />
            ))}
          </div>
          <div className="pt-6 border-t border-neutral-700 flex justify-end">
            <button
              onClick={handleAdvance}
              disabled={!nextAllowed || processing}
              className={nextAllowed ? "btn-primary w-64" : "btn-disabled w-64"}
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* TOOLS STAGE */}
      {stage === 'TOOLS' && (
        <div className="flex flex-col h-full">
          <div className="card mb-6 bg-neutral-900 border-neutral-700">
            <h3 className="text-xl font-bold text-neutral-300 mb-2">SCENARIO INFORMATION</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-neutral-400 block text-sm uppercase tracking-wider font-semibold">CNC Program</span>
                <span className="text-white font-bold text-xl">{scenario.cnc_program}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-sm uppercase tracking-wider font-semibold">Program Revision</span>
                <span className="text-white font-bold text-xl">{scenario.program_rev}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-4 mb-6">
            {tools.map(tool => (
              <ChecklistItem
                key={tool.id}
                title={`${tool.tool_number} - ${tool.tool_type}`}
                description={tool.description}
                isConfirmed={tool.is_confirmed}
                onConfirm={() => handleConfirmTool(tool.id)}
                disabled={processing}
              />
            ))}
          </div>
          <div className="pt-6 border-t border-neutral-700 flex justify-end">
            <button
              onClick={handleAdvance}
              disabled={!nextAllowed || processing}
              className={nextAllowed ? "btn-primary w-64" : "btn-disabled w-64"}
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* WORKPIECE STAGE */}
      {stage === 'WORKPIECE' && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto pr-4 mb-6">
            {workpiece_setup.map(item => (
              <ChecklistItem
                key={item.id}
                title={item.item_name}
                description={item.description}
                isConfirmed={item.is_confirmed}
                onConfirm={() => handleConfirmWorkpiece(item.id)}
                disabled={processing}
              />
            ))}
          </div>
          <div className="pt-6 border-t border-neutral-700 flex justify-end">
            <button
              onClick={handleAdvance}
              disabled={!nextAllowed || processing}
              className={nextAllowed ? "btn-primary w-64" : "btn-disabled w-64"}
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* READY REVIEW STAGE */}
      {stage === 'READY' && (
        <div className="flex flex-col h-full">
          <div className="card bg-emerald-900/20 border-emerald-800 mb-8 p-8 text-center flex flex-col items-center">
            <CheckCircle size={80} className="text-emerald-500 mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">MACHINE READY</h2>
            <p className="text-xl text-emerald-200">All checks, tooling, and setup are complete.</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-8 flex-1">
            <div className="card">
              <h3 className="text-xl font-bold text-neutral-300 mb-4 border-b border-neutral-700 pb-2">CHECKS</h3>
              <ul className="space-y-3">
                {machine_checks.map(c => (
                  <li key={c.id} className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 size={20} />
                    <span className="text-neutral-200 font-medium">{c.check_name}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold text-neutral-300 mb-4 border-b border-neutral-700 pb-2">TOOLS</h3>
              <ul className="space-y-3">
                {tools.map(t => (
                  <li key={t.id} className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 size={20} />
                    <span className="text-neutral-200 font-medium">{t.tool_number}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold text-neutral-300 mb-4 border-b border-neutral-700 pb-2">SETUP</h3>
              <ul className="space-y-3">
                {workpiece_setup.map(w => (
                  <li key={w.id} className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle2 size={20} />
                    <span className="text-neutral-200 font-medium">{w.item_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t border-neutral-700 flex justify-end">
            <button
              onClick={handleAdvance}
              disabled={processing}
              className="btn-success w-full py-6 text-2xl"
            >
              PROCEED TO OPERATION
            </button>
          </div>
        </div>
      )}

      {/* OPERATION STAGE (RUNNING / STOPPED) */}
      {(stage === 'OPERATION_READY' || stage === 'RUNNING' || stage === 'STOPPED') && (
        <div className="flex flex-col h-[60vh] items-center justify-center">
          
          <div className="card w-full max-w-2xl p-10 flex flex-col items-center mb-12 relative overflow-hidden">
            {stage === 'RUNNING' && (
              <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none"></div>
            )}
            
            <div className="text-neutral-400 text-lg font-bold uppercase tracking-widest mb-2">
              OPERATION: {scenario.operation_name}
            </div>
            
            <div className={`text-6xl font-black mb-8 ${stage === 'RUNNING' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stage === 'RUNNING' ? 'RUNNING' : stage === 'STOPPED' ? 'STOPPED' : 'READY'}
            </div>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full text-center">
              <div>
                <span className="block text-neutral-400 text-sm">CNC PROGRAM</span>
                <span className="text-xl font-bold text-white">{scenario.cnc_program}</span>
              </div>
              <div>
                <span className="block text-neutral-400 text-sm">MATERIAL</span>
                <span className="text-xl font-bold text-white">{scenario.material}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-8 w-full max-w-2xl">
            <button
              onClick={handleStart}
              disabled={stage === 'RUNNING' || processing}
              className={`flex-1 flex flex-col items-center justify-center py-8 rounded-2xl shadow-xl transition-all ${
                stage === 'RUNNING' 
                  ? 'bg-emerald-900/50 text-emerald-700 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
              }`}
            >
              <Play size={48} className="mb-2" fill="currentColor" />
              <span className="text-2xl font-bold">START</span>
            </button>
            
            <button
              onClick={handleStop}
              disabled={stage === 'STOPPED' || processing}
              className={`flex-1 flex flex-col items-center justify-center py-8 rounded-2xl shadow-xl transition-all ${
                stage === 'STOPPED' 
                  ? 'bg-red-900/50 text-red-700 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-500 text-white active:scale-95'
              }`}
            >
              <Square size={48} className="mb-2" fill="currentColor" />
              <span className="text-2xl font-bold">STOP</span>
            </button>
          </div>
          
        </div>
      )}

    </Layout>
  );
}

export default App;
