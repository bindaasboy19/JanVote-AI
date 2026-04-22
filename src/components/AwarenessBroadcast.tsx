import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Megaphone, Send, Copy, Volume2, Save, Loader2, Sparkles, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import { askJanVote } from '../lib/gemini';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Props {
  userProfile: UserProfile;
}

export default function AwarenessBroadcast({ userProfile }: Props) {
  const [prompt, setPrompt] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [broadcastLanguage, setBroadcastLanguage] = useState<'en' | 'hi'>(userProfile.language);
  
  const isHi = broadcastLanguage === 'hi';

  const generateScript = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setScript('');
    
    try {
      const guidance = `Generate an awareness script for: ${prompt}. 
      Mandatory: Use extremely simple language suitable for a village audience. 
      Structure it clearly. No political bias.`;
      
      const response = await askJanVote(guidance, 'volunteer', broadcastLanguage);
      setScript(response || '');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!script) return;
    try {
      await addDoc(collection(db, 'awareness_scripts'), {
        authorId: userProfile.userId,
        prompt: prompt,
        content: script,
        createdAt: new Date().toISOString()
      });
      alert(isHi ? 'स्क्रिप्ट आपके रिकॉर्ड में सेव हो गई।' : 'Script saved to your record.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12 overflow-y-auto custom-scrollbar">
      <div className="rounded-[32px] bg-indigo-600 p-10 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-6 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
             <Megaphone size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{isHi ? 'जागरूकता उपकरण' : 'Awareness Tool'}</h2>
            <p className="text-indigo-100/70 text-sm font-medium">{isHi ? 'सरल स्क्रिप्ट्स के साथ अपने गांव को सशक्त बनाएं।' : 'Empower your village with simple scripts.'}</p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex gap-3">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isHi ? "उदा. मतदान का महत्व..." : "e.g. Importance of voting..."}
              className="flex-1 rounded-2xl border-none bg-white/10 px-6 py-4 text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/40 outline-none transition-all"
            />
            <button 
              onClick={generateScript}
              disabled={!prompt.trim() || loading}
              className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-bold text-indigo-700 shadow-xl hover:bg-indigo-50 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              {isHi ? 'उत्पन्न करें' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {script && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isHi ? 'ग्राम संपर्क स्क्रिप्ट' : 'Village Outreach Script'}</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                  title={isHi ? 'कॉपी करें' : 'Copy'}
                >
                  {isCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
                <button 
                  onClick={handleSave}
                  className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                  title={isHi ? 'सेव करें' : 'Save'}
                >
                  <Save size={18} />
                </button>
              </div>
            </div>

            <div className="prose prose-slate max-w-none rounded-2xl bg-slate-50 p-6 text-slate-700 border border-slate-100 text-sm leading-relaxed">
               <Markdown>{script}</Markdown>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-5 rounded-2xl border border-green-100 bg-green-50/20">
                  <h4 className="flex items-center gap-2 font-bold text-xs text-green-700 uppercase tracking-widest mb-3">
                     <Check size={14} className="text-green-600" /> {isHi ? 'चेकलिस्ट' : 'Checklist'}
                  </h4>
                  <p className="text-[11px] text-green-800/70 font-medium">{isHi ? 'तटस्थ रहें। स्पष्ट बोलें। सवालों को प्रोत्साहित करें।' : 'Stay neutral. Speak clearly. Encourage questions.'}</p>
               </div>
                <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/20">
                  <h4 className="flex items-center gap-2 font-bold text-xs text-indigo-700 uppercase tracking-widest mb-3">
                     <Megaphone size={14} className="text-indigo-600" /> {isHi ? 'रणनीति' : 'Strategy'}
                  </h4>
                  <p className="text-[11px] text-indigo-800/70 font-medium">{isHi ? 'बातचीत के दौरान अपने फोन पर EVM सिम्युलेटर का उपयोग करें।' : 'Use the EVM simulator on your phone during the talk.'}</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-3 flex items-center justify-center gap-4 px-2 pt-4">
          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-white py-2 px-4 rounded-full shadow-sm border border-slate-100">
             <span 
               onClick={() => setBroadcastLanguage('en')}
               className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors ${broadcastLanguage === 'en' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600'}`}
             >English</span>
             <span 
               onClick={() => setBroadcastLanguage('hi')}
               className={`cursor-pointer px-1.5 py-0.5 rounded transition-colors ${broadcastLanguage === 'hi' ? 'bg-indigo-100 text-indigo-700' : 'hover:text-indigo-600'}`}
             >Hindi</span>
          </div>
      </div>
    </div>
  );
}
