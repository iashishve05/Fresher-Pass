import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Disc, Zap, Stars } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] text-center relative">
      
      {/* Hero Badge */}
      <div className="animate-float mb-6">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan text-xs font-bold uppercase tracking-widest backdrop-blur-md">
          <Stars className="w-3 h-3" /> Class of 2024
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="font-display text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight">
        <span className="text-white drop-shadow-2xl">FRESHER'S</span>
        <br />
        <span className="text-holographic">ODYSSEY</span>
      </h1>

      <p className="max-w-xl text-lg text-gray-300/80 mb-10 leading-relaxed font-light">
        Step into the future. Secure your digital passport for the most immersive night of the year. Music, Lights, and Memories.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md mx-auto">
        <Link
          to="/register"
          className="flex-1 group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,234,0.5)] transition-all duration-300"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan via-white to-accent-cyan opacity-0 group-hover:opacity-20 transition-opacity" />
          <div className="relative flex items-center justify-center gap-2">
            Get Your Pass <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        
        <Link
          to="/admin"
          className="flex-1 px-8 py-4 glass-card rounded-xl font-bold text-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
        >
          Admin Portal
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-2 transition-transform duration-500">
          <div className="w-12 h-12 rounded-xl bg-accent-violet/20 flex items-center justify-center mb-6 text-accent-violet">
            <Disc className="w-6 h-6 animate-spin-slow" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Sonic Experience</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Top-tier DJs and sound systems to keep the vibe alive all night.</p>
        </div>
        <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-2 transition-transform duration-500 delay-100">
          <div className="w-12 h-12 rounded-xl bg-accent-cyan/20 flex items-center justify-center mb-6 text-accent-cyan">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Neon Ambience</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Immersive lighting and decorations matching your year theme.</p>
        </div>
        <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-2 transition-transform duration-500 delay-200">
          <div className="w-12 h-12 rounded-xl bg-accent-pink/20 flex items-center justify-center mb-6 text-accent-pink">
            <Stars className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">Exclusive Entry</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Secure, QR-coded digital passes sent directly to your email.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;