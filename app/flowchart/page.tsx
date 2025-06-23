'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Lottie from 'lottie-react';
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';
import { useStore } from '@/lib/store';
import Footer from '../components/Footer';

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#F9F9F9',      // Node background
    primaryTextColor: '#444444',    // Node text
    primaryBorderColor: '#CCCCCC', // Node border
    lineColor: '#777777',         // Arrow color
    secondaryColor: '#F9F9F9',    // Used for some shapes
    tertiaryColor: '#444444'     // Decision node text
  },
});

export default function FlowchartPage() {
  const router = useRouter();
  const { 
    mermaidCode, 
    isLoading, 
    error,
    algorithmText,
    generateFlowchart,
    regenerateFlowchart,
    clearState
  } = useStore();
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // Fetch the animation data from the public folder
    fetch('/generating-animation/animation.json')
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data);
      });
  }, []);

  useEffect(() => {
    if (!algorithmText) {
        // If there's no algorithm text, maybe the user navigated here directly.
        // Send them back to the home page.
        router.push('/');
        return;
    }
    if (!mermaidCode && !isLoading && !error) {
      generateFlowchart();
    }
  }, [algorithmText, generateFlowchart, router, mermaidCode, isLoading, error]);

  useEffect(() => {
    if (!isLoading && mermaidCode && mermaidRef.current) {
      // Clear any existing content
      mermaidRef.current.innerHTML = '';
      
      // Create a unique ID for this diagram
      const diagramId = `mermaid-diagram-${Date.now()}`;
      
      // Render the mermaid diagram
      mermaid.render(diagramId, mermaidCode).then((result) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = result.svg;
        }
      }).catch((error) => {
        console.error('Mermaid rendering error:', error);
        // Show a sleek error message instead of raw error details
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `
            <div class="text-center py-8">
              <div class="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                <div class="text-4xl mb-3">😔</div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
                <p class="text-gray-600 text-sm mb-4">We couldn't generate your flowchart properly. Please refresh and try again.</p>
                <button onclick="window.location.reload()" class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Refresh & Try Again
                </button>
              </div>
            </div>
          `;
        }
      });
    }
  }, [isLoading, mermaidCode]);

  const downloadAsPng = () => {
    if (mermaidRef.current) {
      html2canvas(mermaidRef.current, {
        backgroundColor: '#F8F7F4',
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `algoflow-chart-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
    }
  };

  const handleBack = () => {
    clearState(); // Clear all data for fresh start
    router.push('/');
  }

  return (
    <main className="main-container">
        <header className="app-header cursor-pointer" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="app-logo">
                <path d="M12 3L13.4142 10.5858L21 12L13.4142 13.4142L12 21L10.5858 13.4142L3 12L10.5858 10.5858L12 3Z" stroke="#FFC700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="app-logo">AlgoFlow</span>
        </header>

      {isLoading && (
        <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Crafting your flowchart...</h2>
            <div className="lottie-container">
                {animationData && <Lottie animationData={animationData} loop={true} />}
            </div>
        </div>
      )}

      {error && (
        <div className="text-center">
            <div className="flowchart-container max-w-2xl">
                <h2 className="text-2xl font-semibold mb-4 text-red-600">⚠️ Not an Algorithm</h2>
                <p className="mb-6 text-gray-700">{error}</p>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold mb-2 text-blue-800">💡 Try describing processes like:</h3>
                    <ul className="text-left text-sm text-blue-700 space-y-1">
                        <li>• "Start program. Get material name. Check if ductile. If yes, return 'Ductile'. If no, check if brittle..."</li>
                        <li>• "Receive customer order. Validate payment. If valid, process order. If invalid, show error. Send confirmation."</li>
                        <li>• "Start login. Get username and password. Check database. If match, grant access. If not, deny access."</li>
                        <li>• "Input student grade. If grade ≥ 90, assign 'A'. If ≥ 80, assign 'B'. Otherwise assign 'F'. Display result."</li>
                    </ul>
                </div>
                
                <div className="button-group">
                    <button onClick={handleBack} className="primary-button">
                        ← Edit Description
                    </button>
                    <button onClick={() => regenerateFlowchart()} className="secondary-button">
                        Try Again
                    </button>
                </div>
            </div>
        </div>
      )}

      {!isLoading && mermaidCode && (
        <div className="flowchart-container">
            <h2 className="text-2xl font-bold mb-2">Your Flowchart is Ready!</h2>
            <p className="text-gray-600 mb-6">Here is the visual representation of your algorithm.</p>
            <div ref={mermaidRef} className="mermaid" />
            <div className="button-group">
                <button onClick={downloadAsPng} className="primary-button">Download as PNG</button>
                <button onClick={() => regenerateFlowchart()} className="secondary-button">Regenerate</button>
            </div>
        </div>
      )}

      {!isLoading && !error && (
         <button onClick={handleBack} className="secondary-button mt-8">
            &larr; Back to Editor
        </button>
      )}
      <Footer />
    </main>
  );
} 