'use client';

import TetrisGame from '../components/TetrisGame';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">テトリス</h1>
        <TetrisGame />
      </div>
    </div>
  );
}