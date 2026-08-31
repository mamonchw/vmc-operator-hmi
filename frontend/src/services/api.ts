import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

export interface WorkflowState {
  current_stage: string;
  operation_status: string | null;
}

export interface Scenario {
  operation_name: string;
  cnc_program: string;
  program_rev: string;
  material: string;
  drawing_rev: string;
  fixture: string;
  work_offset: string;
  workpiece_orientation: string;
  clamping_instruction: string;
  quantity: number;
}

export interface MachineCheck {
  id: number;
  check_name: string;
  description: string;
  order: number;
  is_confirmed: boolean;
}

export interface Tool {
  id: number;
  tool_number: string;
  tool_type: string;
  description: string;
  order: number;
  is_confirmed: boolean;
}

export interface WorkpieceSetupItem {
  id: number;
  item_name: string;
  description: string;
  order: number;
  is_confirmed: boolean;
}

export interface FullState {
  workflow: WorkflowState;
  scenario: Scenario;
  machine_checks: MachineCheck[];
  tools: Tool[];
  workpiece_setup: WorkpieceSetupItem[];
}

export const fetchState = async (): Promise<FullState> => {
  const response = await api.get('/workflow/state');
  return response.data;
};

export const advanceWorkflow = async (): Promise<WorkflowState> => {
  const response = await api.post('/workflow/advance');
  return response.data;
};

export const startOperation = async (): Promise<WorkflowState> => {
  const response = await api.post('/workflow/operation/start');
  return response.data;
};

export const stopOperation = async (): Promise<WorkflowState> => {
  const response = await api.post('/workflow/operation/stop');
  return response.data;
};

export const confirmMachineCheck = async (id: number): Promise<MachineCheck> => {
  const response = await api.post(`/checks/machine/${id}/confirm`, { is_confirmed: true });
  return response.data;
};

export const confirmTool = async (id: number): Promise<Tool> => {
  const response = await api.post(`/checks/tool/${id}/confirm`, { is_confirmed: true });
  return response.data;
};

export const confirmWorkpieceSetup = async (id: number): Promise<WorkpieceSetupItem> => {
  const response = await api.post(`/checks/workpiece/${id}/confirm`, { is_confirmed: true });
  return response.data;
};

export const resetWorkflow = async (): Promise<WorkflowState> => {
  const response = await api.post('/workflow/reset');
  return response.data;
};

export default api;
