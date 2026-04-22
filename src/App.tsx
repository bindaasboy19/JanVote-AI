/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  HelpCircle, 
  Vote, 
  Megaphone, 
  Mic, 
  BookOpen, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, UserType } from './types';
import VoterProfileForm from './components/VoterProfileForm';
import Assistant from './components/Assistant';
import VotingSimulator from './components/VotingSimulator';
import AwarenessBroadcast from './components/AwarenessBroadcast';
import ElectionJourney from './components/ElectionJourney';

export default function App() {
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assistant' | 'simulator' | 'journey' | 'broadcast'>('assistant');

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
        } catch (err: any) {
          console.error("Firestore read error:", err);
          // Don't block the UI with an auth error for demo purposes
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const handleProfileComplete = async (type: UserType, lang: 'en' | 'hi') => {
    setAuthError(null);
    try {
      let currentUid = user?.uid;
      if (!user) {
        try {
          const cred = await signInAnonymously(auth);
          currentUid = cred.user.uid;
        } catch (authErr) {
          console.warn("Auth error, bypassing for demo:", authErr);
          currentUid = "demo_user_" + Math.random().toString(36).substr(2, 9);
        }
      }
      
      if (currentUid) {
        const newProfile: UserProfile = {
          userId: currentUid,
          userType: type,
          language: lang,
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', currentUid), newProfile);
        } catch (dbErr: any) {
           console.warn("Firestore error, saving to memory only for demo:", dbErr);
        }
        setProfile(newProfile);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/admin-restricted-operation') {
        setAuthError("Anonymous Authentication is not enabled in your Firebase Console. Please go to Authentication > Sign-in method and enable 'Anonymous'.");
      } else {
        setAuthError(err.message || "An unexpected error occurred.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Vote className="mx-auto h-12 w-12 animate-bounce text-indigo-600" />
          <p className="mt-4 font-medium text-slate-600">JanVote AI Loading...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-3xl bg-white p-8 shadow-xl border border-red-100 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Auth Configuration Required</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {authError}
          </p>
          <button 
            onClick={() => setAuthError(null)}
            className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg hover:bg-indigo-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <VoterProfileForm onComplete={handleProfileComplete} />;
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
            J
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800">JanVote AI</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">National Election Education Platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Profile</span>
              <span className="flex items-center gap-2 font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs">
                {profile.userType.replace('_', ' ')}
                <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></div>
              </span>
           </div>
           <button 
             onClick={() => signOut(auth)}
             className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
             title="Logout"
           >
             <LogOut size={20} />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 gap-6 max-w-[1440px] mx-auto w-full">
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'assistant' && (
              <motion.div
                key="assistant"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 h-full"
              >
                <Assistant userProfile={profile} />
              </motion.div>
            )}
            {activeTab === 'simulator' && (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1"
              >
                <VotingSimulator userProfile={profile} />
              </motion.div>
            )}
            {activeTab === 'journey' && (
              <motion.div
                key="journey"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <ElectionJourney userProfile={profile} />
              </motion.div>
            )}
            {activeTab === 'broadcast' && (
              <motion.div
                key="broadcast"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1"
              >
                <AwarenessBroadcast userProfile={profile} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar - Key Deadlines */}
        <div className="hidden lg:flex w-80 flex-col gap-6 shrink-0">
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Key Deadlines</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-1 bg-indigo-600 h-10 rounded-full shadow-glow text-indigo-400"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Voter List Check</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Deadline: 12 Oct 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1 bg-slate-200 h-10 rounded-full"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">National Voting Day</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Date: 25 Nov 2026</p>
                  </div>
                </div>
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
              <ShieldCheck className="mb-4 text-indigo-200" size={32} />
              <h4 className="font-bold text-lg leading-tight mb-2">Secure & Anonymous</h4>
              <p className="text-xs text-indigo-100/80 leading-relaxed">
                Your data is encrypted and used only to personalize your educational experience.
              </p>
           </div>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/80 backdrop-blur-md px-2 py-2 md:py-3 shadow-2xl md:static md:border-t-0 md:bg-white md:shadow-none">
        <div className="mx-auto flex max-w-5xl justify-around md:justify-center md:gap-4">
          <NavItem 
            icon={<HelpCircle size={20} />} 
            label="Assistant" 
            active={activeTab === 'assistant'} 
            onClick={() => setActiveTab('assistant')} 
          />
          <NavItem 
            icon={<BookOpen size={20} />} 
            label="Journey" 
            active={activeTab === 'journey'} 
            onClick={() => setActiveTab('journey')} 
          />
          <NavItem 
            icon={<Vote size={20} />} 
            label="Simulator" 
            active={activeTab === 'simulator'} 
            onClick={() => setActiveTab('simulator')} 
          />
          {profile.userType === 'volunteer' && (
            <NavItem 
              icon={<Megaphone size={20} />} 
              label="Awareness" 
              active={activeTab === 'broadcast'} 
              onClick={() => setActiveTab('broadcast')} 
            />
          )}
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200">
           <Mic size={24} />
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all md:flex-row md:gap-3 md:px-6 ${
        active 
          ? 'bg-blue-600 text-white shadow-md md:bg-blue-50 md:text-blue-700 md:shadow-none' 
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider md:text-xs">{label}</span>
    </button>
  );
}
