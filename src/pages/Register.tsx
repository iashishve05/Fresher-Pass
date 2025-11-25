
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2, ChevronRight, User, BookOpen, Music, IndianRupee, Sparkles } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { registerStudent } from '../services/mockBackend';
import { Year, Course, Branch, INTEREST_OPTIONS } from '../types';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    enrollmentNo: '',
    fullName: '',
    fatherName: '',
    dob: '',
    email: '',
    year: Year.FIRST,
    course: Course.BTECH,
    branch: Branch.CSE,
    photoUrl: '',
    participationInterests: [] as string[],
    feeAmount: 'FREE' // Default
  });

  useEffect(() => {
    if (formData.year === Year.FIRST) {
      setFormData(prev => ({ ...prev, feeAmount: 'FREE' }));
    } else {
      setFormData(prev => ({ ...prev, feeAmount: '' }));
    }
  }, [formData.year]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      if (prev.participationInterests.includes(interest)) {
        return { ...prev, participationInterests: prev.participationInterests.filter(i => i !== interest) };
      } else {
        return { ...prev, participationInterests: [...prev.participationInterests, interest] };
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('error', 'Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.feeAmount) {
      addToast('error', 'Please enter valid fee amount');
      return;
    }
    if (formData.participationInterests.length === 0) {
      addToast('error', 'Please select at least one participation interest (or Audience)');
      return;
    }

    setLoading(true);
    try {
      const student = await registerStudent(formData);
      addToast('success', 'Registration Successful!');
      setTimeout(() => {
        navigate(`/pass/${student.serialId}`);
      }, 1000);
    } catch (error: any) {
      addToast('error', error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.enrollmentNo || !formData.fatherName) {
        addToast('error', 'Please fill in all basic details');
        return;
      }
      setStep(2);
    }
  };

  const isFeeFixed = formData.year === Year.FIRST || formData.year === Year.FOURTH;

  return (
    <div className="max-w-2xl mx-auto mb-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-4xl font-bold mb-3 text-white">Join The Party</h2>
        <p className="text-gray-400">Complete your profile to generate your pass</p>
        
        {/* Modern Stepper */}
        <div className="flex justify-center items-center gap-4 mt-8">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-accent-cyan scale-125 shadow-lg shadow-accent-cyan/50' : 'bg-gray-700'}`} />
            <div className={`w-20 h-0.5 transition-all duration-500 ${step >= 2 ? 'bg-accent-cyan' : 'bg-gray-800'}`} />
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-accent-cyan scale-125 shadow-lg shadow-accent-cyan/50' : 'bg-gray-700'}`} />
        </div>
      </div>

      <div className="glass-card p-10 rounded-3xl relative overflow-hidden">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6 text-accent-cyan">
                <div className="p-2 bg-accent-cyan/10 rounded-lg">
                    <User className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-xl text-white">Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl input-modern text-white placeholder-gray-600"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Father's Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    required
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl input-modern text-white placeholder-gray-600"
                    placeholder="Robert Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl input-modern text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl input-modern text-white placeholder-gray-600"
                    placeholder="john@college.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollment Number</label>
                <input
                  type="text"
                  name="enrollmentNo"
                  required
                  value={formData.enrollmentNo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 rounded-xl input-modern text-white placeholder-gray-600 font-mono"
                  placeholder="UNIV123456"
                />
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg hover:shadow-white/20"
                >
                  Next Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center gap-3 mb-6 text-accent-pink">
                <div className="p-2 bg-accent-pink/10 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-xl text-white">Academics & Vibe</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                 <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</label>
                  <div className="relative">
                    <select
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 rounded-xl input-modern text-white appearance-none cursor-pointer"
                    >
                        {Object.values(Course).map(c => <option key={c} value={c} className="bg-cosmic-800">{c}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>
                 <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</label>
                  <div className="relative">
                    <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 rounded-xl input-modern text-white appearance-none cursor-pointer"
                    >
                        {Object.values(Year).map(y => <option key={y} value={y} className="bg-cosmic-800">{y} Year</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>
                 <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</label>
                  <div className="relative">
                    <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 rounded-xl input-modern text-white appearance-none cursor-pointer"
                    >
                        {Object.values(Branch).map(b => <option key={b} value={b} className="bg-cosmic-800">{b}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                  </div>
                </div>
              </div>

              {/* Fee Section */}
              <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 p-6 rounded-2xl border border-emerald-500/20">
                 <div className="flex items-center gap-2 mb-3 text-emerald-400">
                    <IndianRupee className="w-5 h-5" />
                    <span className="font-display font-semibold">Contribution</span>
                 </div>
                 {isFeeFixed ? (
                   <div className="text-2xl font-bold text-white tracking-tight">
                      ₹ {formData.feeAmount} <span className="text-sm font-normal text-emerald-400/70 ml-2">(Standard Fee)</span>
                   </div>
                 ) : (
                   <div>
                     <input 
                        type="number"
                        name="feeAmount"
                        value={formData.feeAmount}
                        onChange={handleInputChange}
                        placeholder="Enter Amount (e.g., 500)"
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-emerald-700/50"
                     />
                     <p className="text-xs text-emerald-400/60 mt-2">Enter your entry fee amount.</p>
                   </div>
                 )}
              </div>

              {/* Interests Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent-violet">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-display font-semibold text-lg text-white">What's your vibe?</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {INTEREST_OPTIONS.map(interest => {
                    const isSelected = formData.participationInterests.includes(interest);
                    return (
                        <label 
                            key={interest} 
                            className={`cursor-pointer px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                                isSelected 
                                ? 'bg-accent-violet text-white border-accent-violet shadow-[0_0_15px_rgba(121,40,202,0.4)]' 
                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:bg-white/10'
                            }`}
                        >
                        <input 
                            type="checkbox" 
                            className="hidden"
                            checked={isSelected}
                            onChange={() => handleInterestToggle(interest)}
                        />
                        {interest}
                        </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Profile Photo</label>
                <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-accent-cyan hover:bg-accent-cyan/5 transition-all group cursor-pointer relative overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!formData.photoUrl}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {formData.photoUrl ? (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                      <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-accent-cyan to-accent-violet mb-3">
                        <img src={formData.photoUrl} alt="Preview" className="w-full h-full rounded-full object-cover border-2 border-black" />
                      </div>
                      <span className="text-sm font-medium text-emerald-400 flex items-center gap-1">
                         Photo Ready
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-accent-cyan transition-colors">
                      <div className="p-3 bg-white/5 rounded-full mb-3 group-hover:bg-accent-cyan/10">
                         <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium">Drop photo here or click to upload</span>
                      <span className="text-xs text-gray-600 mt-1">Passport size, Max 2MB</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-white/5">
                 <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-white transition-colors px-4"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 bg-gradient-to-r from-accent-violet to-accent-blue text-white font-bold rounded-xl shadow-lg shadow-accent-blue/30 hover:shadow-accent-blue/50 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;