
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasscodeProps {
  mode: 'setup' | 'verify' | 'change';
  onSuccess: (code: string) => void;
  onCancel?: () => void;
  savedPasscode?: string; // For verify/change mode
}

const PasscodeScreen: React.FC<PasscodeProps> = ({ mode, onSuccess, onCancel, savedPasscode }) => {
  const [step, setStep] = useState<'enter' | 'confirm' | 'current'>('enter');
  const [code, setCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState('');

  // Initial setup based on mode
  useEffect(() => {
    if (mode === 'change') {
      setStep('current');
    } else {
      setStep('enter');
    }
    setCode('');
    setConfirmCode('');
    setError('');
  }, [mode]);

  const handlePress = (num: string) => {
    setError('');
    
    // Handle backspace
    if (num === 'back') {
      if (step === 'confirm') {
        setConfirmCode(prev => prev.slice(0, -1));
      } else {
        setCode(prev => prev.slice(0, -1));
      }
      return;
    }

    // Handle number input
    const currentVal = step === 'confirm' ? confirmCode : code;
    if (currentVal.length >= 4) return;

    const newVal = currentVal + num;
    
    if (step === 'confirm') {
      setConfirmCode(newVal);
      if (newVal.length === 4) {
        if (newVal === code) {
          onSuccess(code);
        } else {
          setError('Passcodes do not match. Try again.');
          setConfirmCode('');
          setTimeout(() => setError(''), 2000);
        }
      }
    } else if (step === 'current') {
      setCode(newVal);
      if (newVal.length === 4) {
        if (newVal === savedPasscode) {
          setStep('enter');
          setCode('');
        } else {
          setError('Incorrect passcode.');
          setCode('');
          setTimeout(() => setError(''), 2000);
        }
      }
    } else {
      // step === 'enter'
      setCode(newVal);
      if (newVal.length === 4) {
        if (mode === 'verify') {
          if (newVal === savedPasscode) {
            onSuccess(newVal);
          } else {
            setError('Incorrect passcode.');
            setCode('');
            setTimeout(() => setError(''), 2000);
          }
        } else {
          // setup or change (new code)
          setStep('confirm');
        }
      }
    }
  };

  const getTitle = () => {
    if (step === 'current') return 'Enter Current Passcode';
    if (step === 'confirm') return 'Confirm New Passcode';
    if (mode === 'setup') return 'Create Passcode';
    if (mode === 'change') return 'Enter New Passcode';
    return 'Enter Passcode';
  };

  const activeCode = step === 'confirm' ? confirmCode : code;

  return (
    <div className="absolute inset-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">{getTitle()}</h2>
          <p className="text-text-muted dark:text-gray-400 text-sm h-5">
            {error || (mode === 'setup' || mode === 'change' ? 'Secure your memories with a 4-digit PIN' : 'Welcome back')}
          </p>
        </div>

        {/* Dots */}
        <div className="flex gap-4 mb-12">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: activeCode.length > i ? 1.2 : 1,
                backgroundColor: activeCode.length > i 
                  ? (error ? '#EF4444' : '#a14573') 
                  : 'transparent'
              }}
              className={`w-4 h-4 rounded-full border-2 ${
                error ? 'border-red-500' : 'border-primary'
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 text-2xl font-medium text-text-main dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors focus:outline-none active:scale-95"
            >
              {num}
            </button>
          ))}
          <div className="w-16 h-16 flex items-center justify-center">
            {onCancel && (
              <button 
                onClick={onCancel}
                className="text-text-muted dark:text-gray-400 text-sm font-medium hover:text-text-main dark:hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
          <button
            onClick={() => handlePress('0')}
            className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 text-2xl font-medium text-text-main dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors focus:outline-none active:scale-95"
          >
            0
          </button>
          <button
            onClick={() => handlePress('back')}
            className="w-16 h-16 rounded-full flex items-center justify-center text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus:outline-none active:scale-95"
          >
            <span className="material-symbols-outlined text-2xl">backspace</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PasscodeScreen;
