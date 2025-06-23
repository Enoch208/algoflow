'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import Image from 'next/image';
import { useEffect } from 'react';
import Footer from './components/Footer';

export default function HomePage() {
  const router = useRouter();
  const { algorithmText, setAlgorithmText, isLoading, clearState } = useStore();

  // Clear state when component mounts (fresh start)
  useEffect(() => {
    clearState();
  }, [clearState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!algorithmText.trim()) return;
    router.push('/flowchart');
  };

  return (
    <main className="main-container">
      <header className="app-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="app-logo">
          <path d="M12 3L13.4142 10.5858L21 12L13.4142 13.4142L12 21L10.5858 13.4142L3 12L10.5858 10.5858L12 3Z" stroke="#FFC700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="app-logo">AlgoFlow</span>
      </header>

      <h1 className="title">
        From Algorithm to Flowchart, in an Instance
      </h1>
      <p className="subtitle">
        Turn your complex algorithms and ideas into clear, downloadable flowcharts with the power of AI.
      </p>
      
      <form onSubmit={handleSubmit} className="input-card">
        <textarea
          value={algorithmText}
          onChange={(e) => setAlgorithmText(e.target.value)}
          placeholder="Describe your process step-by-step... For example: 'Start the program. Receive input: customer age. Check if age is 18 or above. If yes, grant access. If no, deny access and show error message. End the program.'"
          className="prompt-textarea"
          rows={6}
        />
        <button
          type="submit"
          disabled={!algorithmText.trim() || isLoading}
          className="primary-button"
        >
          {isLoading ? 'Generating...' : 'Generate Flowchart'}
        </button>
      </form>
      
      <div className="mt-8">
        <Image
            src="/triangle.svg"
            alt="Decorative upside-down triangle"
            width={80}
            height={70}
        />
      </div>
      <Footer />
    </main>
  );
}
