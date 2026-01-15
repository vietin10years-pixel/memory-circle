
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to your quiet space.",
    subtitle: "",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBwnZxI1dkC6S1yZdIIJLZ3HNChZHj2n7G9ujFPkY6Mg4AMRvMbSEtPEfMNxDxDoqKKyyp8AOju0usGdq7sOJugsGcx3k-q-6rXGssM8TpM7CS074XXTn8V28a6gMCMpqQqxzzHt6P4SJaJ7QFuNu6zUziw4tcStjfyAyL_fqBREuCDkmHAHvLeHOdf7VbErRpcvgrL58DVei3_Srh_Ut69myx6BxkG6n-V9rWHc2oQ9cyPuUqWmlUqIDF0LQ3liR4pEhZgtkII8o",
    buttonText: "Next",
    layout: "hero"
  },
  {
    title: "Capture moments, whisper feelings.",
    subtitle: "A private sanctuary for your photos and thoughts, away from the noise.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCK7TN2tjJIG9UbZacT2roQZD6od2SybHKxjckXy6Lue3ZjGbHQ27DAVbYknzc02jiylG6osL11bQ88KZxrmLTp_reflpUhdShVfMu9LPT1AfHwdRI8DMTDxVESHGFuDmNkhJZ-ge7pDKoeL5QtinvcgWHkOJ-mahZHmZ53RNTD7EnitWAq85VLfDDYkkBP1g693QC4SBolW1SknrBb_LVjf_GlcaV3IOsvca8f9QXy2NFMJBvKNLmQd31pOLf3t7efRRPS6uOHz2c",
    buttonText: "Continue",
    layout: "illustration"
  },
  {
    title: "For your eyes only.",
    subtitle: "Organize memories with those who matter most, completely offline and secure.",
    image: null,
    buttonText: "Start your journey",
    layout: "abstract"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentStep = steps[step];

  if (currentStep.layout === 'hero') {
    return (
      <div className="relative flex h-full flex-col overflow-hidden bg-background-light dark:bg-background-dark">
        <div className="relative flex-grow w-full">
          <div 
            className="absolute inset-0 w-full h-full bg-center bg-cover rounded-b-[2.5rem] shadow-sm overflow-hidden" 
            style={{ backgroundImage: `url("${currentStep.image}")` }}
          />
        </div>
        <div className="flex flex-col items-center justify-center pt-10 pb-12 px-8 shrink-0">
          <h1 className="text-text-main dark:text-white text-3xl leading-tight text-center tracking-tight font-display">
            <span className="italic font-light block mb-1 opacity-90">Welcome to your</span>
            <span className="font-medium">quiet space.</span>
          </h1>
          <div className="h-10 w-full" />
          <button onClick={nextStep} className="text-teal-accent font-bold tracking-widest uppercase border-b border-transparent hover:border-teal-accent/40 pb-0.5 transition-all">
            {currentStep.buttonText}
          </button>
        </div>
      </div>
    );
  }

  if (currentStep.layout === 'illustration') {
    return (
      <div className="flex h-full flex-col bg-background-light dark:bg-background-dark items-center justify-center px-8 text-center">
        <div className="relative w-full aspect-square max-w-[280px] mb-8">
          <div 
            className="w-full h-full bg-center bg-contain bg-no-repeat" 
            style={{ backgroundImage: `url("${currentStep.image}")` }}
          />
          <div className="absolute inset-0 bg-primary/5 rounded-full -z-10 scale-90 blur-2xl dark:bg-primary/20" />
        </div>
        <div className="flex flex-col items-center gap-4 max-w-xs mb-12">
          <h1 className="text-text-main dark:text-white text-3xl font-bold font-display leading-tight">{currentStep.title}</h1>
          <p className="text-text-main/80 dark:text-white/70 text-base">{currentStep.subtitle}</p>
        </div>
        <button 
          onClick={nextStep}
          className="w-full max-w-[320px] h-14 bg-teal-accent hover:bg-teal-accent/90 text-white text-lg font-medium rounded-lg shadow-lg flex items-center justify-center transition-all group"
        >
          <span>Continue</span>
          <span className="material-symbols-outlined ml-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background-dark items-center justify-center px-6 text-center text-white relative">
      <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-card-dark to-background-dark" />
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="relative w-72 h-72 mb-10 flex items-center justify-center">
          <div className="absolute top-0 w-48 h-48 rounded-full bg-teal-accent mix-blend-screen blur-2xl animate-pulse" />
          <div className="absolute bottom-4 left-2 w-48 h-48 rounded-full bg-amber-400 mix-blend-screen blur-2xl" />
          <div className="absolute bottom-4 right-2 w-48 h-48 rounded-full bg-primary mix-blend-screen blur-2xl" />
        </div>
        <div className="space-y-4 mb-16">
          <h1 className="font-display text-4xl font-light tracking-tight leading-tight">For your eyes only.</h1>
          <p className="text-white/70 text-base max-w-[280px] mx-auto">{currentStep.subtitle}</p>
        </div>
        <button 
          onClick={nextStep}
          className="w-full h-14 bg-teal-accent text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center group"
        >
          <span>Start your journey</span>
          <span className="material-symbols-outlined ml-2 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
