import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';

interface LockScreenProps {
  correctPin: string;
  onUnlock: () => void;
  appName?: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({ correctPin, onUnlock, appName = 'Clipboard' }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setTimeout(() => {
            onUnlock();
          }, 150);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 700);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 rounded-full bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 shadow-inner">
        <Lock className="w-8 h-8" />
      </div>

      <h1 className="text-xl font-semibold tracking-wide mb-1">{appName} Terkunci</h1>
      <p className="text-stone-400 text-sm mb-8">Masukkan 4 digit PIN untuk membuka</p>

      {/* PIN dots indicator */}
      <div className={`flex items-center gap-4 mb-10 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(index => {
          const filled = index < pin.length;
          return (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                error
                  ? 'border-red-500 bg-red-500/80 scale-110'
                  : filled
                  ? 'border-purple-500 bg-purple-500 scale-105'
                  : 'border-stone-600 bg-transparent'
              }`}
            />
          );
        })}
      </div>

      {error && <p className="text-red-400 text-xs mb-4">PIN salah. Silakan coba lagi.</p>}

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num)}
            className="h-16 rounded-2xl bg-stone-800/80 hover:bg-stone-700/80 active:bg-stone-600 border border-stone-700/50 text-2xl font-medium flex items-center justify-center transition"
          >
            {num}
          </button>
        ))}

        <div />

        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="h-16 rounded-2xl bg-stone-800/80 hover:bg-stone-700/80 active:bg-stone-600 border border-stone-700/50 text-2xl font-medium flex items-center justify-center transition"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="h-16 rounded-2xl bg-stone-800/40 hover:bg-stone-700/40 active:bg-stone-600/60 border border-stone-700/40 text-stone-400 hover:text-stone-200 flex items-center justify-center transition"
          aria-label="Hapus digit"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
