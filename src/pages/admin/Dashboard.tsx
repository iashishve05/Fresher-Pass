
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Search, Download, Filter, UserCheck, Users, Edit2, X, Save, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { getStudents, isAdminLoggedIn, updateStudent } from '../../services/mockBackend';
import { Student, Year, YEAR_COLORS, VerificationStatus, INTEREST_OPTIONS, Course, Branch } from '../../types';
import { useToast } from '../../components/ui/Toast';

const Dashboard: React.FC = () => {
  const { addToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      window.location.href = '/admin';
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getStudents();
    setStudents(data);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.serialId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'all' || student.year === filterYear;
    const matchesStatus = filterStatus === 'all' || student.verificationStatus === filterStatus;
    
    return matchesSearch && matchesYear && matchesStatus;
  });

  const exportCSV = () => {
    if (filteredStudents.length === 0) {
      addToast('info', 'No records to export based on current filters.');
      return;
    }
    // ... (Existing CSV logic same as before, skipping for brevity of UI update)
    const headers = ['Serial ID', 'Name', 'Enrollment', 'Year', 'Course', 'Email', 'Fee', 'Status', 'Interests', 'Checked In'];
    const escape = (val: string | number | boolean) => {
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };
    const csvContent = [
        headers.join(','),
        ...filteredStudents.map(s => [
            s.serialId, s.fullName, s.enrollmentNo, s.year, s.course, s.email, s.feeAmount, s.verificationStatus, s.participationInterests.join('; '), s.checkedIn ? 'Yes' : 'No'
        ].map(escape).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `aurora_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', `Exported ${filteredStudents.length} records`);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent({ ...student });
    setIsModalOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await updateStudent(editingStudent.serialId, editingStudent);
      addToast('success', 'Updated successfully');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      addToast('error', 'Failed to update');
    }
  };

  const checkedInCount = students.filter(s => s.checkedIn).length;
  const pendingCount = students.filter(s => s.verificationStatus === VerificationStatus.PENDING).length;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Real-time overview of event metrics.</p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/admin/scan"
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-accent-cyan hover:text-black transition-all shadow-lg shadow-white/10"
          >
            <QrCode className="w-4 h-4" /> Scan QR
          </Link>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-3 glass-card rounded-xl hover:bg-white/10 transition-colors font-medium text-gray-300 hover:text-white"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-accent-blue"><Users className="w-20 h-20" /></div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Total Registrations</p>
          <p className="text-4xl font-display font-bold mt-2 text-white">{students.length}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-accent-blue font-medium bg-accent-blue/10 inline-flex px-2 py-1 rounded">
             <ArrowUpRight className="w-3 h-3" /> Live Data
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-accent-cyan"><UserCheck className="w-20 h-20" /></div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Checked In</p>
          <p className="text-4xl font-display font-bold mt-2 text-white">{checkedInCount}</p>
          <div className="mt-4 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
             <div className="h-full bg-accent-cyan" style={{ width: `${(checkedInCount/Math.max(students.length, 1))*100}%` }} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-l-4 border-l-amber-500/50">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500"><AlertTriangle className="w-20 h-20" /></div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Pending Verification</p>
          <p className="text-4xl font-display font-bold mt-2 text-amber-400">{pendingCount}</p>
          <div className="mt-4 text-xs text-amber-500/80">
             Requires action
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card rounded-3xl overflow-hidden border-0">
        <div className="p-6 bg-white/5 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl input-modern text-sm"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative">
                <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 pr-8 rounded-xl input-modern text-sm appearance-none cursor-pointer"
                >
                <option value="all" className="bg-cosmic-800">All Status</option>
                <option value={VerificationStatus.PENDING} className="bg-cosmic-800">Pending</option>
                <option value={VerificationStatus.VERIFIED} className="bg-cosmic-800">Verified</option>
                </select>
                <Filter className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
                <select 
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-3 pr-8 rounded-xl input-modern text-sm appearance-none cursor-pointer"
                >
                <option value="all" className="bg-cosmic-800">All Years</option>
                {Object.values(Year).map(y => <option key={y} value={y} className="bg-cosmic-800">{y} Year</option>)}
                </select>
                <Filter className="absolute right-3 top-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-xs text-gray-400 uppercase tracking-wider font-bold">
                <th className="p-5 pl-8">Identity</th>
                <th className="p-5">Academic</th>
                <th className="p-5">Status</th>
                <th className="p-5">Fee</th>
                <th className="p-5 text-center">Check-in</th>
                <th className="p-5 text-right pr-8">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                const colors = YEAR_COLORS[student.year];
                return (
                  <tr key={student.serialId} className="hover:bg-white/5 transition-colors group">
                    <td className="p-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 p-0.5">
                            <img src={student.photoUrl || 'https://picsum.photos/50'} alt="" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-accent-cyan transition-colors">{student.fullName}</p>
                          <p className="text-xs text-gray-500 font-mono">{student.serialId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                         <span className={`w-2 h-2 rounded-full ${colors.bg.replace('/20','')} ${colors.text.replace('text-', 'bg-')}`}></span>
                         <span className="text-gray-300">{student.year} Year</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{student.branch}</p>
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        student.verificationStatus === VerificationStatus.VERIFIED 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {student.verificationStatus}
                      </span>
                    </td>
                    <td className="p-5 font-mono text-gray-300">₹{student.feeAmount}</td>
                    <td className="p-5 text-center">
                      {student.checkedIn ? (
                         <div className="inline-flex justify-center items-center w-8 h-8 rounded-full bg-green-500/20 text-green-400">
                             <CheckCircle className="w-4 h-4" />
                         </div>
                      ) : (
                         <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="p-5 text-right pr-8">
                       <button 
                        onClick={() => handleEditClick(student)}
                        className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xs font-medium border border-transparent hover:border-white/10"
                       >
                         Edit
                       </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                        <Search className="w-8 h-8 mb-3 opacity-20" />
                        No registrations match your search.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal - Re-styled */}
      {isModalOpen && editingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="glass-card w-full max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 shadow-2xl border-white/10">
            <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0f0c29]/90 backdrop-blur-xl z-10">
              <h2 className="text-xl font-display font-bold flex items-center gap-2 text-white">
                Edit Record
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="p-8 space-y-6">
              {/* Form content similar to Dashboard.tsx but with updated classNames for inputs */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</label>
                    <select 
                      value={editingStudent.verificationStatus}
                      onChange={(e) => setEditingStudent({...editingStudent, verificationStatus: e.target.value as VerificationStatus})}
                      className="w-full mt-2 px-4 py-3 rounded-xl input-modern text-white appearance-none"
                    >
                      <option value={VerificationStatus.PENDING} className="bg-cosmic-800 text-amber-400">Pending</option>
                      <option value={VerificationStatus.VERIFIED} className="bg-cosmic-800 text-emerald-400">Verified</option>
                    </select>
                 </div>
                 {/* ... Other inputs with input-modern class ... */}
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Fee Amount</label>
                    <input 
                      type="text"
                      value={editingStudent.feeAmount}
                      onChange={(e) => setEditingStudent({...editingStudent, feeAmount: e.target.value})}
                      className="w-full mt-2 px-4 py-3 rounded-xl input-modern text-white"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Name</label>
                    <input 
                      type="text"
                      value={editingStudent.fullName}
                      onChange={(e) => setEditingStudent({...editingStudent, fullName: e.target.value})}
                      className="w-full mt-2 px-4 py-3 rounded-xl input-modern text-white"
                    />
                 </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Enrollment</label>
                    <input 
                      type="text"
                      value={editingStudent.enrollmentNo}
                      onChange={(e) => setEditingStudent({...editingStudent, enrollmentNo: e.target.value})}
                      className="w-full mt-2 px-4 py-3 rounded-xl input-modern text-white"
                    />
                 </div>
              </div>
              
              <div className="pt-6 flex justify-end gap-3 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
