import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, 
  IdCard, 
  MapPin, 
  Vote, 
  CheckCircle,
  ChevronRight,
  Info,
  ShieldCheck,
  Trophy
} from 'lucide-react';

const STEPS_EN = [
  {
    icon: <UserPlus className="text-blue-500" />,
    title: 'Voter Registration',
    desc: 'The first step is enrolling in the voter list.',
    points: ['Fill Form 6', 'Check your name on NVSP portal', 'Requires birth certificate & residence proof']
  },
  {
    icon: <IdCard className="text-indigo-500" />,
    title: 'Identity Verification',
    desc: 'You need an EPIC card or valid ID to vote.',
    points: ['Voter ID Card (EPIC)', 'ID proof like Aadhaar or PAN', 'Voter Slip from booth']
  },
  {
    icon: <MapPin className="text-amber-500" />,
    title: 'Booth Presence',
    desc: 'Locate your polling booth on election day.',
    points: ['Check booth address online', 'Queue up as per serial number', 'Agent verifies your identity']
  },
  {
    icon: <Vote className="text-red-500" />,
    title: 'Casting the Vote',
    desc: 'Using the EVM securely.',
    points: ['Privacy behind the voting shield', 'Blue light next to choice', 'Beep sound & VVPAT slip']
  }
];

const STEPS_HI = [
  {
    icon: <UserPlus className="text-blue-500" />,
    title: 'मतदाता पंजीकरण',
    desc: 'पहला कदम मतदाता सूची में नामांकन करना है।',
    points: ['फॉर्म 6 भरें', 'NVSP पोर्टल पर अपना नाम जांचें', 'जन्म प्रमाण पत्र और निवास प्रमाण आवश्यक है']
  },
  {
    icon: <IdCard className="text-indigo-500" />,
    title: 'पहचान सत्यापन',
    desc: 'वोट देने के लिए आपको EPIC कार्ड या वैध आईडी की आवश्यकता है।',
    points: ['वोटर आईडी कार्ड (EPIC)', 'आधार या पैन जैसे आईडी प्रमाण', 'बूथ से वोटर स्लिप']
  },
  {
    icon: <MapPin className="text-amber-500" />,
    title: 'बूथ उपस्थिति',
    desc: 'चुनाव के दिन अपने मतदान केंद्र का पता लगाएँ।',
    points: ['ऑनलाइन बूथ का पता जांचें', 'सीरियल नंबर के अनुसार कतार में लगें', 'एजेंट आपकी पहचान सत्यापित करता है']
  },
  {
    icon: <Vote className="text-red-500" />,
    title: 'वोट डालना',
    desc: 'EVM का सुरक्षित उपयोग करना।',
    points: ['वोटिंग शील्ड के पीछे गोपनीयता', 'पसंद के आगे नीली बत्ती', 'बीप की आवाज और VVPAT स्लिप']
  }
];

export default function ElectionJourney({ userProfile }: { userProfile: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [journeyLanguage, setJourneyLanguage] = useState<'en' | 'hi'>(userProfile?.language || 'en');
  
  const STEPS = journeyLanguage === 'hi' ? STEPS_HI : STEPS_EN;
  const isHindi = journeyLanguage === 'hi';

  const markCompleted = (idx: number) => {
    if (idx === currentStep) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(currentStep + 1);
        setShowCongrats(true);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
      <AnimatePresence>
        {showCongrats && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-100"
            >
              <Trophy size={48} />
            </motion.div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {isHindi ? 'बधाई हो!' : 'Congratulations!'}
            </h2>
            <p className="text-slate-600 font-medium max-w-md">
              {isHindi 
                ? 'आपने मतदान प्रक्रिया के सभी चरणों को सफलतापूर्वक समझ लिया है। आप लोकतंत्र में अपना योगदान देने के लिए पूरी तरह तैयार हैं।' 
                : 'You have successfully understood all the steps of the voting process. You are fully prepared to contribute to democracy.'}
            </p>
            <button 
              onClick={() => { setShowCongrats(false); setCurrentStep(0); }}
              className="mt-8 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors"
            >
              {isHindi ? 'फिर से शुरू करें' : 'Start Over'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-16">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">{isHindi ? 'आपकी चुनाव यात्रा' : 'Your Election Journey'}</h2>
          <p className="text-xs text-slate-500 font-medium">{isHindi ? 'अपनी लोकतांत्रिक भागीदारी को पूरा करने के लिए इन चरणों का पालन करें।' : 'Follow these steps to complete your democratic participation.'}</p>
        </div>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">{isHindi ? 'प्लेटफ़ॉर्म गाइड' : 'PLATFORM GUIDE'}</span>
      </div>

      <div className="relative flex justify-between px-4 mb-16">
        <div className="journey-line" style={{ background: '#e2e8f0' }}></div>
        <div 
          className="journey-line" 
          style={{ 
            background: '#4f46e5', 
            width: `${(Math.min(currentStep, STEPS.length - 1) / (STEPS.length - 1)) * 100}%`,
            transition: 'width 0.5s ease-in-out'
          }}
        ></div>
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <div key={idx} className="journey-step flex flex-col items-center gap-3 relative group z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ring-offset-2 ${
                isCompleted || isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}>
                {isCompleted ? <CheckCircle size={20} /> : <span className="font-bold text-sm">0{idx + 1}</span>}
              </div>
              <div className="flex flex-col items-center">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isCompleted || isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
              
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white p-3 rounded-xl text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                 <p className="font-bold mb-1 text-indigo-300 uppercase leading-none tracking-tighter">{step.title}</p>
                 <p className="leading-relaxed opacity-80">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border transition-all relative ${
                isActive 
                  ? 'bg-indigo-50/50 border-indigo-200 shadow-md ring-2 ring-indigo-500/20' 
                  : isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : 'bg-white border-slate-100 opacity-50'
              }`}
            >
               {isCompleted && (
                 <div className="absolute top-4 right-4 text-green-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
                   <CheckCircle size={14} /> {isHindi ? 'पूरा हुआ' : 'Done'}
                 </div>
               )}
               <div className="flex items-center gap-4 mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                    isActive ? 'bg-white border-indigo-100 shadow-sm' : 'bg-slate-100 border-slate-200'
                  }`}>
                     {step.icon}
                  </div>
                  <h4 className={`font-bold text-sm tracking-tight ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>{step.title}</h4>
               </div>
               <ul className="space-y-2 mb-4">
                  {step.points.map((p, i) => (
                    <li key={i} className={`flex items-start gap-2 text-[11px] leading-snug ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>
                      <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${isActive ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                      {p}
                    </li>
                  ))}
               </ul>
               
               {isActive && (
                 <button 
                   onClick={() => markCompleted(idx)}
                   className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-md hover:bg-indigo-700 transition-colors mt-2 flex justify-center items-center gap-2"
                 >
                   {isHindi ? 'पूरा के रूप में चिह्नित करें' : 'Mark as Completed'} <ChevronRight size={14} />
                 </button>
               )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-4 px-2">
          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 py-2 px-4 rounded-full shadow-sm border border-slate-100">
             <span 
               onClick={() => setJourneyLanguage('en')}
               className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors ${journeyLanguage === 'en' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600'}`}
             >English</span>
             <span 
               onClick={() => setJourneyLanguage('hi')}
               className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors ${journeyLanguage === 'hi' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600'}`}
             >Hindi</span>
          </div>
      </div>
    </div>
  );
}
