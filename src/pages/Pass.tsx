
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, ArrowLeft, CheckCircle2, AlertOctagon } from 'lucide-react';
import { getStudentBySerial } from '../services/mockBackend';
import { Student, YEAR_COLORS, VerificationStatus } from '../types';
import { useToast } from '../components/ui/Toast';

const Pass: React.FC = () => {
  const { serialId } = useParams<{ serialId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const { addToast } = useToast();
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (serialId) {
      getStudentBySerial(serialId).then(data => {
        if (data) setStudent(data);
      });
    }
  }, [serialId]);

  if (!student) {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-pulse flex flex-col items-center text-accent-cyan">
                <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mb-4" />
                Fetching Pass...
            </div>
        </div>
    );
  }

  const theme = YEAR_COLORS[student.year];

  const handleDownload = () => {
    addToast('success', 'Pass saved to gallery');
  };

  const qrData = JSON.stringify({
    sid: student.serialId,
    enum: student.enrollmentNo,
    yr: student.year,
    sts: student.verificationStatus,
    fee: student.feeAmount
  });

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center mb-12 animate-in fade-in duration-700">
      <Link to="/" className="self-start mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
      </Link>

      <div className="text-center mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3 text-white">You're In.</h1>
        <p className="text-gray-400">Your digital access key is ready.</p>
        
        {student.verificationStatus === VerificationStatus.PENDING && (
          <div className="mt-6 bg-amber-500/10 border border-amber-500/20 text-amber-200 px-5 py-2.5 rounded-full inline-flex items-center gap-2 backdrop-blur-md">
            <AlertOctagon className="w-4 h-4" />
            <span className="text-sm font-medium">Verification Pending</span>
          </div>
        )}
      </div>

      <div className="relative group perspective-1000">
        <div 
          ref={ticketRef}
          className={`w-[340px] md:w-[380px] rounded-[32px] overflow-hidden glass-card relative transition-transform duration-700 hover:rotate-y-6 hover:rotate-x-6 hover:scale-105 ${theme.glow}`}
        >
          {/* Top Decorative Section */}
          <div className={`h-40 ${theme.bg} relative overflow-hidden flex items-center justify-center`}>
            {/* Abstract Shapes */}
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent animate-spin-slow" />
            <div className="absolute inset-0 bg-noise opacity-20" />
            
            <div className="relative z-10 text-center">
                <h2 className="font-display font-black text-3xl tracking-widest text-white drop-shadow-lg">AURORA</h2>
                <div className="mt-2 text-[10px] font-bold tracking-[0.3em] uppercase text-white/80 border border-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
                    Access Pass 2024
                </div>
            </div>
          </div>

          {/* Profile Section overlapping */}
          <div className="relative px-8 pb-8 pt-0 -mt-12 flex flex-col items-center bg-gradient-to-b from-transparent to-black/80">
            <div className="p-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 mb-5 relative">
                <img 
                  src={student.photoUrl || 'https://picsum.photos/200'} 
                  alt={student.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-black ${student.verificationStatus === 'Verified' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-1 text-center font-display">{student.fullName}</h3>
            <div className="flex items-center gap-2 mb-6">
                <span className={`text-xs uppercase tracking-wider font-bold ${theme.text}`}>{student.year} Year</span>
                <span className="text-gray-600 text-[10px]">•</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">{student.branch}</span>
            </div>

            {/* QR Section */}
            <div className="bg-white p-3 rounded-2xl shadow-xl shadow-white/5 mb-6">
              <QRCodeSVG value={qrData} size={160} level="M" />
            </div>

            {/* Info Grid */}
            <div className="w-full grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Serial ID</p>
                    <p className="font-mono text-xs text-white mt-1">{student.serialId}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Pass Fee</p>
                    <p className="font-mono text-xs text-white mt-1">₹{student.feeAmount}</p>
                </div>
            </div>
          </div>
          
          {/* Bottom Holographic Strip */}
          <div className="h-2 w-full bg-gradient-to-r from-accent-cyan via-accent-violet to-accent-pink opacity-80" />
        </div>
      </div>

      <div className="flex gap-4 mt-12">
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-8 py-3.5 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
        >
          <Download className="w-4 h-4" /> Save Pass
        </button>
      </div>
    </div>
  );
};

export default Pass;