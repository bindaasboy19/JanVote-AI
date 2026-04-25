import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  ChevronRight, 
  ChevronLeft, 
  MessageSquare, 
  ShieldAlert, 
  ClipboardList, 
  Mic, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Clock,
  CheckCircle2,
  PhoneCall,
  Bot,
  Send,
  FileText,
  RotateCcw
} from 'lucide-react';
import Markdown from 'react-markdown';
import { askJanVote } from '../lib/gemini';
import { UserProfile } from '../types';

interface Props {
  userProfile: UserProfile;
}

type Step = 'issue_selection' | 'identity_choice' | 'problem_description' | 'guidance' | 'complaint_generator' | 'summary';

const ISSUE_TYPES = [
  { id: 'evm', label: 'EVM Malfunction', icon: <RotateCcw size={24} />, description: 'EVM is not working or showing wrong lights.' },
  { id: 'voter_id', label: 'Voter ID Issue', icon: <FileText size={24} />, description: 'Issues with your ID card or physical card not received.' },
  { id: 'name_missing', label: 'Name Missing', icon: <UserX size={24} />, description: 'Your name is not in the voter list at the booth.' },
  { id: 'malpractice', label: 'Booth Capturing', icon: <ShieldAlert size={24} />, description: 'Illegal activities or malpractice at the polling booth.' },
  { id: 'bribery', label: 'Bribery / Coercion', icon: <AlertTriangle size={24} />, description: 'Someone offering money or threatening you to vote.' },
  { id: 'other', label: 'Other Issues', icon: <MessageSquare size={24} />, description: 'Any other election related grievances.' },
];

const AUTHORITIES: Record<string, string[]> = {
  'evm': ['Booth Level Officer (BLO)', 'Returning Officer'],
  'voter_id': ['Booth Level Officer', 'ECI Online Portal'],
  'name_missing': ['Electoral Registration Officer (ERO)', 'BLO'],
  'malpractice': ['General Observer', 'Returning Officer', 'Police Help Desk'],
  'bribery': ['Flying Squad', 'Static Surveillance Team', 'C-Vigil App'],
  'other': ['Returning Officer', 'District Election Officer']
};

export default function GrievanceAssistant({ userProfile }: Props) {
  const [step, setStep] = useState<Step>('issue_selection');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);
  const [description, setDescription] = useState('');
  const [aiGuidance, setAiGuidance] = useState('');
  const [complaintDraft, setComplaintDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleIssueSelect = (id: string) => {
    setSelectedIssue(id);
    setStep('identity_choice');
  };

  const handleIdentityChoice = (anonymous: boolean) => {
    setIsAnonymous(anonymous);
    setStep('problem_description');
  };

  const getGuidance = async () => {
    setLoading(true);
    setStep('guidance');
    try {
      const prompt = `I am facing an issue: ${selectedIssue}. Details: ${description}. 
      Is this a valid election grievance? 
      Provide a step-by-step resolution process: 
      1. Where to go? 
      2. Required documents? 
      3. Expected resolution timeline?
      Keep it practical and helpful.`;
      
      const response = await askJanVote(prompt, userProfile.userType, userProfile.language);
      setAiGuidance(response);
    } catch (error) {
      setAiGuidance("Sorry, I could not generate guidance at this moment. Please contact your nearest Polling Officer.");
    } finally {
      setLoading(false);
    }
  };

  const generateComplaint = async () => {
    setLoading(true);
    setStep('complaint_generator');
    try {
      const prompt = `Generate a formal election complaint draft for: ${selectedIssue}. 
      User description: ${description}. 
      Identity: ${isAnonymous ? 'Anonymous' : 'Identified'}. 
      Language: ${userProfile.language === 'hi' ? 'Hindi' : 'English'}.
      Format it professionally for submission to the Returning Officer.`;
      
      const response = await askJanVote(prompt, userProfile.userType, userProfile.language);
      setComplaintDraft(response);
    } catch (error) {
      setComplaintDraft("Failed to generate draft. Please write a simple letter to the Returning Officer.");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, ''));
    utterance.lang = userProfile.language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = userProfile.language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(prev => prev + ' ' + transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'issue_selection':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800">What issue are you facing?</h2>
              <p className="text-slate-500 font-medium">Select the category that best describes your problem.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ISSUE_TYPES.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleIssueSelect(issue.id)}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-slate-100 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {issue.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{issue.label}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{issue.description}</p>
                  </div>
                  <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-500" size={20} />
                </button>
              ))}
            </div>
          </div>
        );

      case 'identity_choice':
        return (
          <div className="space-y-8 py-4">
             <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800">Choose your privacy</h2>
              <p className="text-slate-500 font-medium">Do you want to disclose your identity in the complaint?</p>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <button
                onClick={() => handleIdentityChoice(false)}
                className="flex-1 p-8 rounded-3xl bg-white border-2 border-slate-100 hover:border-indigo-500 hover:shadow-xl transition-all text-center space-y-4 group"
              >
                <div className="mx-auto w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <UserCheck size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Identified</h3>
                  <p className="text-sm text-slate-500 mt-2">Required for official processing and feedback. Most effective.</p>
                </div>
              </button>
              <button
                onClick={() => handleIdentityChoice(true)}
                className="flex-1 p-8 rounded-3xl bg-white border-2 border-slate-100 hover:border-orange-500 hover:shadow-xl transition-all text-center space-y-4 group"
              >
                <div className="mx-auto w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <UserX size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Anonymous</h3>
                  <p className="text-sm text-slate-500 mt-2">Keep your identity hidden. May have limited official tracking.</p>
                </div>
              </button>
            </div>
            <button onClick={() => setStep('issue_selection')} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 mx-auto">
              <ChevronLeft size={18} /> Back to issues
            </button>
          </div>
        );

      case 'problem_description':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800">Tell us what happened</h2>
              <p className="text-slate-500 font-medium">Describe the issue in detail. You can also use voice.</p>
            </div>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue here..."
                className="w-full h-48 p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white outline-none transition-all text-lg"
              />
              <button
                onClick={startListening}
                className={`absolute bottom-4 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                <Mic size={24} />
              </button>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep('identity_choice')}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Back
              </button>
              <button 
                disabled={!description.trim() || loading}
                onClick={getGuidance}
                className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <span className="animate-spin text-xl">⏳</span> : 'Get AI Guidance'} <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );

      case 'guidance':
        return (
          <div className="space-y-6">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Bot size={120} />
               </div>
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot size={20} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-wider">AI Guidance</h3>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <Markdown>{aiGuidance}</Markdown>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => speak(aiGuidance)}
                      className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all flex items-center gap-2 text-sm font-bold"
                    >
                      {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />} 
                      {isSpeaking ? 'Stop Listening' : 'Listen Guidance'}
                    </button>
                  </div>
               </div>
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin size={18} className="text-red-500" /> Authorized Contacts
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedIssue && AUTHORITIES[selectedIssue]?.map((auth, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">{auth}</span>
                    <button className="text-indigo-600 hover:text-indigo-700">
                      <PhoneCall size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep('problem_description')}
                className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-all"
              >
                Refine Details
              </button>
              <button 
                onClick={generateComplaint}
                className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Generate Complaint Letter <FileText size={20} />
              </button>
            </div>
          </div>
        );

      case 'complaint_generator':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800">Formal Complaint Draft</h2>
              <p className="text-slate-500 font-medium">Ready to use. You can copy or print this for submission.</p>
            </div>
            
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 font-serif relative">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold text-slate-400">Generating formal document...</p>
                </div>
              ) : (
                <>
                  <div className="prose prose-slate max-w-none whitespace-pre-wrap">
                    {complaintDraft}
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 uppercase font-bold tracking-widest">
                    <span>JanVote AI Verified</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
               <button 
                onClick={() => {
                   navigator.clipboard.writeText(complaintDraft);
                   alert('Copied to clipboard!');
                }}
                className="flex-1 py-4 rounded-2xl bg-slate-800 text-white font-bold shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                Copy Content
              </button>
              <button 
                onClick={() => setStep('summary')}
                className="flex-1 py-4 rounded-2xl bg-green-600 text-white font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                Done & Track <CheckCircle2 size={20} />
              </button>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="text-center space-y-8 py-12">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-50">
              <CheckCircle2 size={64} />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-800">You're all set!</h2>
              <p className="text-slate-500 max-w-md mx-auto">Your grievance has been structured and you have the guidance to resolve it. Remember, JanVote AI is only an assistant and does not file complaints officially.</p>
            </div>
            
            <div className="max-w-md mx-auto bg-white border-2 border-slate-100 rounded-3xl p-6 space-y-4 text-left">
               <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest">Status Tracking (Simulation)</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <CheckCircle2 size={16} />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-800">Complaint Generated</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Completed</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Clock size={16} />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-400">Submission to RO</p>
                        <p className="text-[10px] text-indigo-500 font-bold uppercase">Pending your action</p>
                     </div>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => {
                setStep('issue_selection');
                setSelectedIssue(null);
                setDescription('');
                setComplaintDraft('');
              }}
              className="py-4 px-8 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-all"
            >
              Start New Grievance
            </button>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-100">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">Grievance Assistant</h3>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Help & Complaint Guidance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => {
                    const stepMap: Record<number, Step[]> = {
                        1: ['issue_selection'],
                        2: ['identity_choice'],
                        3: ['problem_description'],
                        4: ['guidance'],
                        5: ['complaint_generator', 'summary']
                    };
                    const isActive = stepMap[s].includes(step);
                    return (
                        <div key={s} className={`h-1.5 rounded-full transition-all ${isActive ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`} />
                    );
                })}
            </div>
            <div className="ml-4 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">Emergency help: 1950</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
