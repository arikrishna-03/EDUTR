import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, ArrowRight, Loader2, X } from 'lucide-react';
import { signInWithGooglePopup, loginWithEmailPassword } from '../config/firebase';

const Login = () => {
  const [role, setRole] = useState('mentor'); // 'student' or 'mentor'
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mentorId, setMentorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [authMode, setAuthMode] = useState('signup'); // 'signin' or 'signup'
  const [fullName, setFullName] = useState('');

  // State for Google Login & Mentor ID Linking
  const [showMentorIdModal, setShowMentorIdModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [googleMentorId, setGoogleMentorId] = useState('');

  const processGoogleLogin = (userName, userEmail, photoURL) => {
    const avatar = photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}&backgroundColor=b6e3f4`;
    if (role === 'mentor') {
      const mentorObj = {
        role: 'mentor',
        id: `MNT-${Date.now().toString().slice(-6)}`,
        name: userName,
        fullName: userName,
        email: userEmail,
        mentorId: 'MNT-2024-001',
        department: 'Computer Science',
        location: 'Block A, Room 304',
        bio: `Logged in as ${userName} (${userEmail}).`,
        avatar: avatar,
      };

      localStorage.setItem('currentUser', JSON.stringify(mentorObj));
      localStorage.setItem('mentorProfile', JSON.stringify(mentorObj));

      const profilesMap = JSON.parse(localStorage.getItem('mentorProfilesMap') || '{}');
      profilesMap['MNT-2024-001'] = mentorObj;
      localStorage.setItem('mentorProfilesMap', JSON.stringify(profilesMap));

      window.dispatchEvent(new Event('mentorProfileUpdated'));
      navigate('/mentor/profile');
    } else {
      setPendingGoogleUser(userEmail);
      setGoogleMentorId('');
      setShowMentorIdModal(true);
    }
  };

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

      if (res.success && res.user) {
        if (role === 'mentor') {
          const userName = fullName.trim() || res.user?.name || (email ? email.split('@')[0] : 'Dr. Sarah Wilson');
          localStorage.setItem(
            'currentUser',
            JSON.stringify({
              role: 'mentor',
              id: res.user?.uid ? `MNT-${res.user.uid.slice(0, 6).toUpperCase()}` : 'MNT-2024-001',
              name: userName,
              email: email || 'sarah.wilson@edutrack.edu',
            })
          );
          navigate('/mentor/profile');
        } else {
          if (mentorId.trim()) {
            const existingStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
            const studentEmail = email || 'student@example.com';
            const studentName = fullName.trim() || res.user?.name || studentEmail.split('@')[0];

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
      } else {
        setAuthError(res.error || "Authentication failed.");
      }
    } catch (err) {
      console.error("Login process error:", err);
      setAuthError("Authentication error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Pure Firebase Google Auth Trigger
   */
  const handleGoogleClick = async () => {
    setAuthError('');
    setIsLoading(true);

    try {
      const res = await signInWithGooglePopup();
      if (res.success && res.user) {
        processGoogleLogin(res.user.name, res.user.email, res.user.photoURL);
      } else {
        setAuthError(res.error || 'Google Sign-In failed. Please try again.');
      }
    } catch (err) {
      console.error("Firebase Google popup error:", err);
      setAuthError("Google Sign-In error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleMentorIdSubmit = () => {
    if (googleMentorId.trim()) {
      const existingStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
      const studentEmail = pendingGoogleUser || 'student@example.com';
      const studentName = studentEmail.split('@')[0] || 'Student';
      const cleanStudentName = studentName.charAt(0).toUpperCase() + studentName.slice(1);

      const newStudent = {
        id: Date.now().toString(),
        name: cleanStudentName,
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
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-slate-100 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white px-4">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-slate-800/80 transition-all duration-300 min-h-[580px] flex flex-col justify-center before:absolute before:inset-x-10 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-indigo-500/40 before:to-transparent">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400 text-xs font-medium">
            {authMode === 'signin'
              ? 'Sign in to continue to EduTracker'
              : 'Sign up to get started with EduTracker'}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-950/80 p-1.5 rounded-2xl mb-6 relative border border-slate-800/80 shadow-inner">
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-600/30 transition-all duration-300 ease-out ${
              role === 'mentor' ? 'left-[calc(50%+3px)]' : 'left-1.5'
            }`}
          ></div>
          <button
            type="button"
            onClick={() => {
              setRole('student');
              setAuthError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors z-10 cursor-pointer ${
              role === 'student' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
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
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors z-10 cursor-pointer ${
              role === 'mentor' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={18} />
            Mentor
          </button>
        </div>

        {authError && (
          <div className="mb-5 p-3.5 bg-red-950/40 border border-red-800/50 rounded-xl text-red-300 text-xs text-center flex flex-col items-center gap-2 shadow-inner">
            <span>
              {authError.includes('auth/unauthorized-domain') || authError.includes('authorized in Firebase Console')
                ? 'This domain is not authorized in Firebase Console.'
                : authError}
            </span>
            {(authError.includes('auth/unauthorized-domain') || authError.includes('authorized in Firebase Console')) && (
              <button
                type="button"
                onClick={() => {
                  setAuthError('');
                  setShowGoogleAccountModal(true);
                }}
                className="px-3 py-1 bg-red-900/50 hover:bg-red-800/60 text-red-200 rounded-lg text-xs font-medium underline cursor-pointer transition-all border border-red-700/50"
              >
                Use Quick Account Sign-In
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {authMode === 'signup' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                placeholder={role === 'mentor' ? 'Dr. Sarah Wilson' : 'Alex Johnson'}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
              placeholder="name@college.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          {role === 'student' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Mentor ID
              </label>
              <input
                type="text"
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                placeholder="Enter your assigned Mentor ID"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type={authMode === 'signin' ? 'submit' : 'button'}
              onClick={() => {
                if (authMode !== 'signin') {
                  setAuthMode('signin');
                  setAuthError('');
                }
              }}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all shadow-lg group disabled:opacity-70 cursor-pointer text-sm ${
                authMode === 'signin'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500'
                  : 'bg-slate-950/40 text-slate-400 border border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {isLoading && authMode === 'signin' ? (
                <Loader2 size={20} className="animate-spin text-white" />
              ) : (
                'Sign In'
              )}
            </button>

            <button
              type={authMode === 'signup' ? 'submit' : 'button'}
              onClick={() => {
                if (authMode !== 'signup') {
                  setAuthMode('signup');
                  setAuthError('');
                }
              }}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all shadow-lg group disabled:opacity-70 cursor-pointer text-sm ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500'
                  : 'bg-slate-950/40 text-slate-400 border border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {isLoading && authMode === 'signup' ? (
                <Loader2 size={20} className="animate-spin text-white" />
              ) : (
                'Sign Up'
              )}
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">Or continue with</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-slate-950/80 hover:bg-slate-800 text-slate-200 font-medium py-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all disabled:opacity-70 cursor-pointer text-sm shadow-inner"
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
            Sign In with Google Account
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 text-sm">
          {authMode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>

      {/* Mentor ID Interception Modal for Google Login */}
      {showMentorIdModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowMentorIdModal(false)}
          ></div>

          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6 text-slate-100">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">One Last Step</h3>
              <p className="text-slate-400 text-xs mt-1">
                Please enter your Mentor ID to complete the login for{' '}
                <span className="font-semibold text-slate-200">{pendingGoogleUser}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Mentor ID
                </label>
                <input
                  type="text"
                  value={googleMentorId}
                  onChange={(e) => setGoogleMentorId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-sm"
                  placeholder="e.g. MENTOR123"
                  autoFocus
                />
              </div>

              <button
                onClick={handleGoogleMentorIdSubmit}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
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
