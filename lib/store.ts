import { create } from 'zustand';

interface AppState {
  algorithmText: string;
  mermaidCode: string;
  isLoading: boolean;
  error: string | null;
  setAlgorithmText: (text: string) => void;
  generateFlowchart: () => Promise<void>;
  regenerateFlowchart: () => Promise<void>;
  clearState: () => void;
}

const isAlgorithmDescription = (text: string): boolean => {
  const algorithmKeywords = [
    'algorithm', 'sort', 'search', 'loop', 'iterate', 'function', 'method',
    'procedure', 'step', 'process', 'condition', 'if', 'else', 'while',
    'for', 'binary search', 'bubble sort', 'quick sort', 'merge sort',
    'linear search', 'depth first', 'breadth first', 'recursive', 'dynamic programming',
    'flowchart', 'diagram', 'pseudocode', 'input', 'output', 'variable',
    'array', 'list', 'tree', 'graph', 'node', 'edge', 'traversal',
    'implementation', 'execute', 'run', 'compute', 'calculate', 'solve',
    'optimize', 'efficient', 'complexity', 'big o', 'time complexity',
    'space complexity', 'data structure', 'programming', 'code',
    'logic', 'sequence', 'workflow', 'automation', 'processing'
  ];

  const lowerText = text.toLowerCase();
  const hasKeywords = algorithmKeywords.some(keyword => lowerText.includes(keyword));
  const hasSteps = /step\s*\d+|first|second|third|then|next|finally|lastly/i.test(text);
  const isLongDescription = text.split(' ').length > 15;
  
  return hasKeywords || hasSteps || isLongDescription;
};

export const useStore = create<AppState>((set, get) => ({
  algorithmText: '',
  mermaidCode: '',
  isLoading: false,
  error: null,
  
  setAlgorithmText: (text: string) => set({ algorithmText: text }),
  
  generateFlowchart: async () => {
    const { algorithmText } = get();
    if (!algorithmText.trim()) {
      set({ error: 'Please enter an algorithm description.' });
      return;
    }

    // Check if the input is actually an algorithm
    if (!isAlgorithmDescription(algorithmText)) {
      set({ 
        error: 'This doesn\'t appear to be an algorithm description. Please describe a process, procedure, or algorithm with steps, conditions, or technical terms.',
        isLoading: false 
      });
      return;
    }

    set({ isLoading: true, error: null, mermaidCode: '' });

    try {
      const response = await fetch('/api/convert-algorithm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithmText }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to convert algorithm: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      set({ mermaidCode: data.mermaidCode, isLoading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  regenerateFlowchart: async () => {
    // This function can have the same logic as generateFlowchart
    // It's here for semantic clarity on the UI
    await get().generateFlowchart();
  },

  clearState: () => {
    set({
      algorithmText: '',
      mermaidCode: '',
      isLoading: false,
      error: null
    });
  },
})); 