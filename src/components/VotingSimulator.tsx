import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, RefreshCcw, ShieldCheck, AlertCircle } from 'lucide-react';

const CANDIDATES_EN = [
  { id: 1, name: 'Sample Candidate A', symbol: '🍎' },
  { id: 2, name: 'Sample Candidate B', symbol: '💡' },
  { id: 3, name: 'Sample Candidate C', symbol: '🚜' },
  { id: 4, name: 'Sample Candidate D', symbol: '⚙️' },
  { id: 5, name: 'NOTA (None Of The Above)', symbol: '❌' },
];

const CANDIDATES_HI = [
  { id: 1, name: 'नमूना उम्मीदवार A', symbol: '🍎' },
  { id: 2, name: 'नमूना उम्मीदवार B', symbol: '💡' },
  { id: 3, name: 'नमूना उम्मीदवार C', symbol: '🚜' },
  { id: 4, name: 'नमूना उम्मीदवार D', symbol: '⚙️' },
  { id: 5, name: 'NOTA (उपरोक्त में से कोई नहीं)', symbol: '❌' },
];

export default function VotingSimulator({ userProfile }: { userProfile: any }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [simLanguage, setSimLanguage] = useState<'en' | 'hi'>(userProfile?.language || 'en');

  const isHi = simLanguage === 'hi';
  const CANDIDATES = isHi ? CANDIDATES_HI : CANDIDATES_EN;

  const playBeep = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 1.5);
    }
  };

  const handleVote = () => {
    if (selectedId === null) return;
    setIsCasting(true);
    // Simulate process
    setTimeout(() => {
      setIsCasting(false);
      playBeep();
      setIsConfirmed(true);
    }, 2000);
  };

  const reset = () => {
    setSelectedId(null);
    setIsConfirmed(false);
  };

  if (isConfirmed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-xl"
      >
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 size={64} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">{isHi ? 'वोट सफलतापूर्वक दर्ज किया गया!' : 'Vote Recorded Successfully!'}</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-sm">
          {isHi ? 'यह एक अभ्यास सिमुलेशन था। वास्तविक चुनाव में, आपका वोट गुप्त और सुरक्षित होता है।' : 'This was a practice simulation. In a real election, your vote is secret and secure.'}
        </p>
        <div className="mt-8 rounded-2xl bg-blue-50 p-6 text-left">
          <h4 className="flex items-center gap-2 font-bold text-blue-900">
            <Info size={20} /> {isHi ? 'असल जिंदगी में आगे क्या होता है?' : 'What happens next in real life?'}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li>• {isHi ? "एक पेपर स्लिप (VVPAT) 7 सेकंड के लिए कांच के पीछे दिखाई देती है।" : "A paper slip (VVPAT) appears behind a glass for 7 seconds."}</li>
            <li>• {isHi ? "एक तेज 'बीप' ध्वनि वोट की पुष्टि करती है।" : "A loud 'BEEP' sound confirms the vote."}</li>
            <li>• {isHi ? "आपकी उंगली पर अमिट स्याही लगाई जाती है।" : "Your finger is marked with indelible ink."}</li>
          </ul>
        </div>
        <button 
          onClick={reset}
          className="mt-10 flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg hover:bg-blue-700"
        >
          <RefreshCcw size={20} /> {isHi ? 'पुनः प्रयास करें' : 'Try Again'}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-8">
      <div className="mb-6 rounded-2xl bg-amber-50 p-4 border border-amber-100 flex items-start gap-4">
         <AlertCircle className="text-amber-600 shrink-0 mt-0.5" />
         <div>
            <p className="font-bold text-amber-900 leading-none mb-1">{isHi ? 'अभ्यास सिम्युलेटर' : 'Practice Simulator'}</p>
            <p className="text-xs text-amber-700">{isHi ? 'यह एक नकली इंटरफ़ेस है जिसे आपको यह समझने में मदद करने के लिए डिज़ाइन किया गया है कि इलेक्ट्रॉनिक वोटिंग मशीन (EVM) का उपयोग कैसे करें।' : 'This is a fake interface designed to help you understand how to use an Electronic Voting Machine (EVM).'}</p>
         </div>
      </div>

      <div className="bg-slate-800 rounded-3xl shadow-xl flex flex-col flex-1 border border-slate-700 overflow-hidden min-h-[500px]">
      <div className="bg-slate-700/50 p-5 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"></div>
          <h3 className="text-white font-bold text-xs tracking-widest uppercase">{isHi ? 'अभ्यास वोटिंग सिम्युलेटर (EVM)' : 'Practice Voting Simulator (EVM)'}</h3>
        </div>
        <span className="text-[10px] bg-slate-600/50 text-slate-300 px-2.5 py-1 rounded-md font-mono border border-slate-600">{isHi ? 'सुरक्षित मॉक वातावरण' : 'SECURE MOCK ENVIRONMENT'}</span>
      </div>

      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar bg-slate-800/50">
        {CANDIDATES.map((c) => (
          <button
            key={c.id}
            onClick={() => !isCasting && setSelectedId(c.id)}
            className={`evm-button flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
              selectedId === c.id 
                ? 'bg-indigo-50/5 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-3xl shadow-inner shrink-0 leading-none">
                {c.symbol}
              </div>
              <div className="flex flex-col text-left">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedId === c.id ? 'text-indigo-400' : 'text-slate-400'}`}>{isHi ? 'उम्मीदवार' : 'Candidate'} 0{c.id}</span>
                <span className={`font-bold text-base leading-tight ${selectedId === c.id ? 'text-white' : 'text-slate-200'}`}>{c.name}</span>
              </div>
            </div>
            <div className={`w-12 h-12 bg-indigo-600 border-4 border-slate-800 rounded-lg flex items-center justify-center text-white shadow-lg transition-all ${
              selectedId === c.id ? 'scale-110 rotate-3 ring-4 ring-indigo-500/20' : 'opacity-40 grayscale'
            }`}>
              <div className={`w-4 h-4 bg-white rounded-full ${selectedId === c.id ? 'shadow-glow' : ''}`}></div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-5 bg-slate-900 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-[11px] font-medium italic opacity-80 max-w-md">
          {isHi ? (
            <>कदम 1: अपने उम्मीदवार के आगे नीला बटन दबाएं। <br/>
            कदम 2: चयन की जांच करें। <br/>
            कदम 3: नीचे "अपना वोट डालें" पर क्लिक करें।</>
          ) : (
            <>Step 1: Press the blue button next to your candidate. <br/>
            Step 2: Check the selection. <br/>
            Step 3: Click "Cast Your Vote" below.</>
          )}
        </p>
        
        <button
          disabled={selectedId === null || isCasting}
          onClick={handleVote}
          className={`px-10 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-3 ${
            selectedId === null || isCasting
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
              : 'bg-red-600 text-white hover:bg-red-700 shadow-red-900/20'
          }`}
        >
          {isCasting ? <RefreshCcw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
          {isHi ? 'अपना वोट डालें' : 'Cast Your Vote'}
        </button>
      </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 px-2">
          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 py-2 px-4 rounded-full shadow-sm border border-slate-100">
             <span 
               onClick={() => setSimLanguage('en')}
               className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors ${simLanguage === 'en' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600'}`}
             >English</span>
             <span 
               onClick={() => setSimLanguage('hi')}
               className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors ${simLanguage === 'hi' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600'}`}
             >Hindi</span>
          </div>
      </div>
    </div>
  );
}
