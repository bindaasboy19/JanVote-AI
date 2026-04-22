import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Check, Globe, Vote } from 'lucide-react';
import { UserType } from '../types';

interface Props {
  onComplete: (type: UserType, lang: 'en' | 'hi') => void;
}

export default function VoterProfileForm({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const types: { id: UserType; label: string; desc: string; icon: React.ReactNode }[] = [
    { 
      id: 'first_time', 
      label: 'First-time Voter', 
      desc: 'I am new to voting and need step-by-step help.',
      icon: <span className="text-2xl">🌱</span>
    },
    { 
      id: 'regular', 
      label: 'Regular Voter', 
      desc: 'I have voted before but want to stay informed.',
      icon: <span className="text-2xl">🗳️</span>
    },
    { 
      id: 'low_literacy', 
      label: 'I need voice help', 
      desc: 'Prefer simple language and voice guidance.',
      icon: <span className="text-2xl">🔊</span>
    },
    { 
      id: 'volunteer', 
      label: 'Awareness Volunteer', 
      desc: 'I help others learn about the election process.',
      icon: <span className="text-2xl">📢</span>
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[32px] bg-white p-10 shadow-2xl shadow-indigo-100 border border-slate-200"
      >
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
            <Vote size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">JanVote AI</h2>
          <p className="mt-2 text-sm font-medium text-slate-400 uppercase tracking-widest leading-none">Intelligent Election Platform</p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 text-center">
              Choose Language
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setLanguage('en')}
                className={`flex flex-col items-center gap-4 rounded-2xl border-2 p-6 transition-all group ${
                  language === 'en' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100' : 'border-slate-100 text-slate-400 hover:border-indigo-200'
                }`}
              >
                <Globe size={32} className={language === 'en' ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-300'} />
                <span className="font-bold text-sm">English</span>
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`flex flex-col items-center gap-4 rounded-2xl border-2 p-6 transition-all group ${
                  language === 'hi' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100' : 'border-slate-100 text-slate-400 hover:border-indigo-200'
                }`}
              >
                <span className={`text-3xl font-bold ${language === 'hi' ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-300'}`}>अ</span>
                <span className="font-bold text-sm">हिंदी</span>
              </button>
            </div>
            <button 
              onClick={() => setStep(2)}
              className="w-full rounded-2xl bg-indigo-600 py-5 font-bold text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase tracking-widest mt-4"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 text-center">
              Active User Type
            </label>
            <div className="space-y-3">
              {types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setUserType(t.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                    userType === t.id ? 'border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100' : 'border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${userType === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                    {t.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-sm ${userType === t.id ? 'text-indigo-900' : 'text-slate-700'}`}>{t.label}</h4>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight leading-none mt-1">{t.desc}</p>
                  </div>
                  {userType === t.id && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                       <Check className="text-indigo-600" size={20} />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 rounded-2xl border-2 border-slate-100 py-4 font-bold text-slate-400 hover:bg-slate-50 transition-colors uppercase text-xs tracking-widest"
              >
                Back
              </button>
              <button 
                disabled={!userType}
                onClick={() => userType && onComplete(userType, language)}
                className="flex-[2] rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30 uppercase text-xs tracking-widest"
              >
                Begin Education
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
