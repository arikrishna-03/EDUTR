import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, ArrowRight, X, Loader2 } from 'lucide-react';
import { signInWithGooglePopup, loginWithEmailPassword } from '../config/firebase';

const Login = () => {
  const [role, setRole] = useState('mentor'); // 'student' or 'mentor'
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // State for Google Login Interception
  const [showMentorIdModal, setShowMentorIdModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [googleMentorId, setGoogleMentorId] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      // Execute Firebase Email/Password Sign-in with Fallback
      const res = await loginWithEmailPassword(
        email || 'user@college.edu',
        password || 'password123'
      );

      if (role === 'mentor') {
        const userName = res.user?.name || (email ? email.split('@')[0] : 'Dr. Sarah Wilson');
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            role: 'mentor',
            id: res.user?.uid ? `MNT-${res.user.uid.slice(0, 6).toUpperCase()}` : 'MNT-2024-001',
            name: userName,
            email: email || 'sarah.wilson@edutrack.edu',
          })
        );
        navigate('/mentor/home');
      } else {
        if (mentorId.trim()) {
          const existingStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
          const studentEmail = email || 'student@example.com';
          const studentName = res.user?.name || studentEmail.split('@')[0];

          const newStudent = {
            id: res.user?.uid || Date.now().toString(),
            name: studentName,
            email: studentEmail,
            mentorId: mentorId.toUpperCase(),
            joinedAt: new Date().toLocaleDateString(),
          };

          const isDuplicate = existingStudents.some(
            (s) => s.email === newStudent.email && s.mentorId === mentorId.toUpperCase()
          );
          if (!isDuplicate) {
            localStorage.setItem('linkedStudents', JSON.stringify([...existingStudents, newStudent]));
          }

          localStorage.setItem(
            'currentUser',
            JSON.stringify({
              role: 'student',
              id: newStudent.id,
              name: newStudent.name,
              mentorId: mentorId.toUpperCase(),
            })
          );

          navigate('/student/dashboard');
        } else {
          setAuthError("Please enter your assigned Mentor ID.");
        }
      }
    } catch (err) {
      console.error("Login process error:", err);
      setAuthError("Authentication error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Firebase Google Auth Trigger
   */
  const handleGoogleClick = async () => {
    setAuthError('');
    setIsLoading(true);

    try {
      const res = await signInWithGooglePopup();
      if (res.success && res.user) {
        if (role === 'mentor') {
          localStorage.setItem(
            'currentUser',
            JSON.stringify({
              role: 'mentor',
              id: `MNT-${res.user.uid.slice(0, 6).toUpperCase()}`,
              name: res.user.name,
              email: res.user.email,
              photoURL: res.user.photoURL,
            })
          );
          navigate('/mentor/home');
        } else {
          // Student role requires Mentor ID linking
          setPendingGoogleUser(res.user.email);
          setGoogleMentorId('');
          setShowMentorIdModal(true);
        }
      } else {
        // Fallback to quick account selector modal if popup is closed or in demo mode
        setShowGoogleModal(true);
      }
    } catch (err) {
      console.warn("Firebase Google popup fallback to account modal:", err);
      setShowGoogleModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  /* Account selection handler for quick demo / fallback modal */
  const handleAccountSelect = (account) => {
    setShowGoogleModal(false);

    setTimeout(() => {
      if (account.role === 'mentor') {
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            role: 'mentor',
            id: account.id,
            name: account.name,
          })
        );
        navigate('/mentor/home');
      } else {
        setPendingGoogleUser(account.email);
        if (account.mentorId) {
          setGoogleMentorId(account.mentorId);
        } else {
          setGoogleMentorId('');
        }
        setShowMentorIdModal(true);
      }
    }, 300);
  };

  const handleGoogleMentorIdSubmit = () => {
    if (googleMentorId.trim()) {
      const existingStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
      const studentEmail = pendingGoogleUser || 'student@example.com';
      const newStudent = {
        id: Date.now().toString(),
        name: studentEmail.split('@')[0] || 'Student',
        email: studentEmail,
        mentorId: googleMentorId.toUpperCase(),
        joinedAt: new Date().toLocaleDateString(),
      };

      const isDuplicate = existingStudents.some(
        (s) => s.email === newStudent.email && s.mentorId === googleMentorId.toUpperCase()
      );
      if (!isDuplicate) {
        localStorage.setItem('linkedStudents', JSON.stringify([...existingStudents, newStudent]));
      }

      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          role: 'student',
          id: newStudent.id,
          name: newStudent.name,
          mentorId: googleMentorId.toUpperCase(),
        })
      );

      setShowMentorIdModal(false);
      navigate('/student/dashboard');
    } else {
      alert("Please enter a Mentor ID to continue");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

      {/* Main Login Card */}
      <div
        className={`relative z-10 w-full max-w-md p-8 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 transition-all duration-300 min-h-[600px] flex flex-col justify-center ${
          showGoogleModal ? 'blur-sm scale-95 opacity-50 pointer-events-none' : ''
        }`}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-purple-100">Sign in to continue to EduTracker</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-black/20 p-1 rounded-xl mb-6 relative">
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-lg transition-all duration-300 ease-out ${
              role === 'mentor' ? 'left-[calc(50%+2px)]' : 'left-1'
            }`}
          ></div>
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setAuthError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors z-10 ${
              role === 'student' ? 'text-purple-600' : 'text-white/80 hover:text-white'
            }`}
          >
            <GraduationCap size={18} />
            Student
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('mentor');
              setAuthError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors z-10 ${
              role === 'mentor' ? 'text-purple-600' : 'text-white/80 hover:text-white'
            }`}
          >
            <User size={18} />
            Mentor
          </button>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-100 text-sm text-center">
            {authError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="name@college.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          {role === 'student' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-white/90 mb-2">Mentor ID</label>
              <input
                type="text"
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                placeholder="Enter your assigned Mentor ID"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white text-purple-600 font-bold py-4 rounded-xl hover:bg-purple-50 transition-colors shadow-lg group disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-purple-600" />
            ) : (
              <>
                Sign In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink-0 mx-4 text-white/60 text-sm">Or continue with</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white/10 text-white font-medium py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-70"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.24.81-.6z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google (Firebase)
          </button>
        </form>

        <p className="text-center mt-6 text-purple-100 text-sm">
          Don't have an account?{' '}
          <a href="#" className="text-white font-semibold hover:underline">
            Contact Admin
          </a>
        </p>
      </div>

      {/* Account Selector Modal (Fallback / Demo Accounts) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowGoogleModal(false)}
          ></div>

          <div className="bg-white w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6 pb-2">
              <div className="flex justify-center mb-4">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.24.81-.6z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <h2 className="text-center text-xl font-medium text-slate-800 mb-1">
                Choose an account
              </h2>
              <p className="text-center text-slate-500 text-sm mb-6">to continue to EduTracker</p>

              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                <button
                  onClick={() =>
                    handleAccountSelect({
                      email: 'sarah.wilson@edutrack.edu',
                      role: 'mentor',
                      name: 'Dr. Sarah Wilson',
                      id: 'MNT-2024-001',
                    })
                  }
                  className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate text-sm">
                      Dr. Sarah Wilson (Mentor)
                    </div>
                    <div className="text-xs text-slate-500 truncate">sarah.wilson@edutrack.edu</div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleAccountSelect({
                      email: 'albus@hogwarts.edu',
                      role: 'mentor',
                      name: 'Prof. Dumbledore',
                      id: 'MENTOR123',
                    })
                  }
                  className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                    D
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate text-sm">
                      Prof. Dumbledore (Mentor)
                    </div>
                    <div className="text-xs text-slate-500 truncate">albus@hogwarts.edu</div>
                  </div>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() =>
                    handleAccountSelect({
                      email: 'arikrishna.student@college.edu',
                      role: 'student',
                      name: 'Arikrishna',
                      id: 'STU-1001',
                      mentorId: 'MNT-2024-001',
                    })
                  }
                  className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium text-sm">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate text-sm">
                      Arikrishna (Student)
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      arikrishna.student@college.edu
                    </div>
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleAccountSelect({
                      email: 'harry.potter@college.edu',
                      role: 'student',
                      name: 'Harry Potter',
                      id: 'STU-1002',
                      mentorId: 'MENTOR123',
                    })
                  }
                  className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-medium text-sm">
                    H
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate text-sm">
                      Harry Potter (Student)
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      harry.potter@college.edu
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div className="p-3 pt-2 text-[10px] text-slate-500 text-center border-t border-slate-50 bg-slate-50/50">
              Firebase Authentication & Local Account Manager
            </div>
          </div>
        </div>
      )}

      {/* Mentor ID Interception Modal for Google Login */}
      {showMentorIdModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMentorIdModal(false)}
          ></div>

          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">One Last Step</h3>
              <p className="text-slate-500 text-sm mt-1">
                Please enter your Mentor ID to complete the login for{' '}
                <span className="font-semibold text-slate-700">{pendingGoogleUser}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Mentor ID
                </label>
                <input
                  type="text"
                  value={googleMentorId}
                  onChange={(e) => setGoogleMentorId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                  placeholder="e.g. MENTOR123"
                  autoFocus
                />
              </div>

              <button
                onClick={handleGoogleMentorIdSubmit}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-purple-500/30"
              >
                Complete Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
