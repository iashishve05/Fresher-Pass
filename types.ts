
export enum Year {
  FIRST = '1st',
  SECOND = '2nd',
  THIRD = '3rd',
  FOURTH = '4th',
}

export enum Course {
  BTECH = 'B.Tech',
  MTECH = 'M.Tech',
  BCA = 'BCA',
  MCA = 'MCA',
}

export enum Branch {
  CSE = 'CSE',
  ECE = 'ECE',
  ME = 'Mechanical',
  CE = 'Civil',
  EE = 'Electrical',
  IT = 'IT',
  AIML = 'AI & ML',
}

export enum VerificationStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
}

export interface Student {
  serialId: string;
  enrollmentNo: string;
  fullName: string;
  fatherName: string;
  dob: string;
  email: string;
  year: Year;
  course: Course;
  branch: Branch;
  photoUrl: string; // Base64 string for this demo
  registrationDate: string;
  checkedIn: boolean;
  checkedInAt?: string;
  
  // New Fields
  participationInterests: string[];
  feeAmount: string;
  verificationStatus: VerificationStatus;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const YEAR_COLORS = {
  [Year.FIRST]: {
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-400/30',
    glow: 'shadow-[0_0_30px_rgba(52,211,153,0.3)]',
    hex: '#34d399'
  },
  [Year.SECOND]: {
    text: 'text-amber-300',
    bg: 'bg-amber-500/20',
    border: 'border-amber-400/30',
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.3)]',
    hex: '#fbbf24'
  },
  [Year.THIRD]: {
    text: 'text-cyan-300',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-400/30',
    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.3)]',
    hex: '#22d3ee'
  },
  [Year.FOURTH]: {
    text: 'text-fuchsia-300',
    bg: 'bg-fuchsia-500/20',
    border: 'border-fuchsia-400/30',
    glow: 'shadow-[0_0_30px_rgba(232,121,249,0.3)]',
    hex: '#e879f9'
  },
};

export const INTEREST_OPTIONS = [
  'Dance (Solo/Group)',
  'Singing',
  'Drama / Skit',
  'Fashion Show',
  'Anchoring',
  'Event Volunteer',
  'Audience Only'
];