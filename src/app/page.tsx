'use client';

import TetrisGame from '../components/TetrisGame';
import { Toaster } from '../components/ui/sonner';

export default function Home() {
  return (
    <div className='min-h-screen grid-background flex items-center justify-center relative overflow-hidden'>
      {/* Main content */}
      <div className='text-center relative z-10 px-4'>
        <div className='mb-4 md:mb-6'>
          <h1 className='text-4xl md:text-6xl font-bold text-white mb-2 relative'>
            <span className='bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent'>
              TETRIS
            </span>
            <div className='absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400 rounded-lg blur opacity-25' />
          </h1>
        </div>

        <div className='float-animation'>
          <TetrisGame />
        </div>
      </div>

      {/* Background effects */}
      <div className='absolute top-10 left-10 w-32 h-32 bg-cyan-400 rounded-full opacity-10 blur-3xl animate-pulse' />
      <div
        className='absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full opacity-10 blur-3xl animate-pulse'
        style={{ animationDelay: '1s' }}
      />
      <div
        className='absolute top-1/2 left-1/4 w-20 h-20 bg-yellow-400 rounded-full opacity-10 blur-2xl animate-pulse'
        style={{ animationDelay: '2s' }}
      />

      {/* Global Toast Notifications */}
      <Toaster />
    </div>
  );
}
