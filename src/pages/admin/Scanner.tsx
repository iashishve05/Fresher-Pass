
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft, RefreshCw, Check, AlertTriangle, XCircle, Info, DollarSign, UserCheck } from 'lucide-react';
import { checkInStudent, isAdminLoggedIn, getStudentBySerial, notifyAdminPendingScan } from '../../services/mockBackend';
import { Student, YEAR_COLORS, VerificationStatus } from '../../types';
import { useToast } from '../../components/ui/Toast';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  
  const [scanResult, setScanResult] = useState<{
    status: 'idle' | 'success' | 'error' | 'warning';
    message: string;
    student?: Student;
  }>({ status: 'idle', message: '' });

  const [isScanning, setIsScanning] = useState(true);
  const [pendingApprovalStudent, setPendingApprovalStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/admin');
      return;
    }

    // Initialize Scanner
    const initScanner = () => {
        const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    };

    const timer = setTimeout(initScanner, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5-qrcode scanner. ", error);
        });
      }
    };
  }, []);

  const onScanSuccess = async (decodedText: string, decodedResult: any) => {
    if (!isScanning) return;
    
    // Pause scanner immediately upon detection
    if (scannerRef.current) {
        scannerRef.current.pause();
    }
    
    try {
      const data = JSON.parse(decodedText);
      const serialId = data.sid;

      if (!serialId) throw new Error("Invalid QR Code");

      // 1. Fetch details first to check status
      const student = await getStudentBySerial(serialId);

      // If student not found, let checkInStudent handle the error message
      if (!student) {
         processCheckIn(serialId);
         return;
      }

      // 2. If already checked in, proceed to show "Already checked in" message
      if (student.checkedIn) {
        processCheckIn(serialId);
        return;
      }

      // 3. INTERCEPT: If Pending Verification, show Alert UI
      if (student.verificationStatus === VerificationStatus.PENDING) {
        setIsScanning(false);
        setPendingApprovalStudent(student);
        
        // Notify Admin (Async)
        notifyAdminPendingScan(student)
          .then(() => addToast('info', 'Admin email notification sent.'))
          .catch(err => console.error("Failed to send notification", err));
          
        return;
      }

      // 4. Normal Verified Check-in
      processCheckIn(serialId);

    } catch (e) {
      setScanResult({
        status: 'error',
        message: 'Invalid QR Format',
      });
      setIsScanning(false);
    }
  };

  const processCheckIn = async (serialId: string) => {
    try {
        const result = await checkInStudent(serialId);
        
        if (result.success) {
            if (result.warning) {
                 setScanResult({
                    status: 'warning',
                    message: result.message,
                    student: result.student
                });
                if(result.message !== 'Warning: Verification is PENDING!') {
                   addToast('info', result.message);
                }
            } else {
                setScanResult({
                  status: 'success',
                  message: 'Check-in Verified!',
                  student: result.student
                });
                addToast('success', `Welcome ${result.student?.fullName}`);
            }
        } else {
            if (result.student) {
                 // Duplicate check-in
                 setScanResult({
                    status: 'warning',
                    message: result.message,
                    student: result.student
                });
                addToast('info', result.message);
            } else {
                 setScanResult({
                    status: 'error',
                    message: 'Student not found in database.',
                });
                addToast('error', 'Student not found');
            }
        }
    } catch (e) {
        setScanResult({ status: 'error', message: 'Check-in Failed' });
    }
    setIsScanning(false);
  };

  const onScanFailure = (error: any) => {
    // console.warn(error); 
  };

  const resetScanner = () => {
    setScanResult({ status: 'idle', message: '' });
    setPendingApprovalStudent(null);
    setIsScanning(true);
    if (scannerRef.current) {
        scannerRef.current.resume();
    }
  };

  const handleForceCheckIn = () => {
    if (pendingApprovalStudent) {
        processCheckIn(pendingApprovalStudent.serialId);
        setPendingApprovalStudent(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/dashboard')} className="p-2 glass-panel rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Check-in Scanner</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 relative">
        {/* Scanner Viewport */}
        <div className="glass-panel p-4 rounded-2xl overflow-hidden bg-black/50 border-neon-blue/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] min-h-[400px] relative">
            <div id="reader" className="w-full h-full"></div>
            
            {/* PENDING APPROVAL OVERLAY */}
            {pendingApprovalStudent && (
                 <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="bg-yellow-500/20 p-5 rounded-full mb-6 ring-4 ring-yellow-500/30 animate-pulse">
                        <AlertTriangle className="w-16 h-16 text-yellow-500" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white mb-2">Verification Pending</h2>
                    <p className="text-gray-400 mb-6">This student has not been verified yet.</p>

                    <div className="bg-white/10 p-5 rounded-xl w-full mb-6 border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                             <img src={pendingApprovalStudent.photoUrl || 'https://picsum.photos/50'} className="w-14 h-14 rounded-full border-2 border-white/20 object-cover" />
                             <div className="text-left">
                                <h3 className="font-bold text-xl">{pendingApprovalStudent.fullName}</h3>
                                <p className="text-gray-400">{pendingApprovalStudent.enrollmentNo}</p>
                             </div>
                        </div>
                        
                        <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg mb-2">
                            <span className="text-gray-400 text-sm">Amount to Collect:</span>
                            <span className="text-xl font-bold text-neon-green">₹{pendingApprovalStudent.feeAmount}</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/30 p-3 rounded-lg">
                            <span className="text-gray-400 text-sm">Year/Course:</span>
                            <span className="text-sm font-medium">{pendingApprovalStudent.year} / {pendingApprovalStudent.course}</span>
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                        <button 
                            onClick={handleForceCheckIn}
                            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <UserCheck className="w-5 h-5" /> Proceed & Check In
                        </button>
                        <button 
                            onClick={resetScanner}
                            className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                 </div>
            )}

            {/* SUCCESS / RESULT OVERLAY */}
            {!isScanning && !pendingApprovalStudent && (
                <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    {scanResult.status === 'success' && (
                        <div className="bg-green-500/20 p-4 rounded-full mb-4 ring-4 ring-green-500/50">
                            <Check className="w-12 h-12 text-green-500" />
                        </div>
                    )}
                    {scanResult.status === 'warning' && (
                        <div className="bg-yellow-500/20 p-4 rounded-full mb-4 ring-4 ring-yellow-500/50">
                            <AlertTriangle className="w-12 h-12 text-yellow-500" />
                        </div>
                    )}
                    {scanResult.status === 'error' && (
                        <div className="bg-red-500/20 p-4 rounded-full mb-4 ring-4 ring-red-500/50">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                    )}

                    <h2 className="text-2xl font-bold mb-2">{scanResult.message}</h2>
                    
                    {scanResult.student && (
                        <div className="bg-white/10 p-4 rounded-xl w-full mb-6 text-left border border-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                <img src={scanResult.student.photoUrl || 'https://picsum.photos/50'} className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" />
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{scanResult.student.fullName}</h3>
                                    <p className="text-gray-400 text-sm">{scanResult.student.enrollmentNo}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className={`text-xs px-2 py-1 rounded border ${YEAR_COLORS[scanResult.student.year].border} ${YEAR_COLORS[scanResult.student.year].text} bg-white/5`}>
                                    {scanResult.student.year} Year
                                </span>
                                <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">
                                    {scanResult.student.branch}
                                </span>
                            </div>
                            
                            {/* Status Badge */}
                            <div className={`text-xs px-3 py-2 rounded-lg flex items-center gap-2 font-medium mt-3 ${
                                scanResult.student.verificationStatus === VerificationStatus.PENDING 
                                ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30' 
                                : 'bg-green-500/20 text-green-200 border border-green-500/30'
                            }`}>
                                <Info className="w-3 h-3" />
                                Status: {scanResult.student.verificationStatus}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={resetScanner}
                        className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        <RefreshCw className="w-4 h-4" /> Scan Next
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;
