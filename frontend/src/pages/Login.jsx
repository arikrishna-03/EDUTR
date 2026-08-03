import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
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

  // State for Google Login Interception & Personal Account Modal
  const [showMentorIdModal, setShowMentorIdModal] = useState(false);
  const [showGoogleAccountModal, setShowGoogleAccountModal] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [googleMentorId, setGoogleMentorId] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

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
          navigate('/mentor/profile');
        } else {
          // Student role requires Mentor ID linking
          setPendingGoogleUser(res.user.email);
          setGoogleMentorId('');
          setShowMentorIdModal(true);
        }
      } else {
        if (res.code === 'auth/popup-closed-by-user') {
          setAuthError('Google Sign-In window was closed before completing login.');
        } else if (res.code === 'auth/popup-blocked' || res.code === 'auth/unauthorized-domain') {
          setShowGoogleAccountModal(true);
        } else {
          setAuthError(res.error || 'Google Sign-In failed. Please try again.');
        }
      }
    } catch (err) {
      console.error("Firebase Google popup error:", err);
      setAuthError("Google Sign-In error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalGoogleSubmit = (e) => {
    if (e) e.preventDefault();
    const targetEmail = (customGoogleEmail || pendingGoogleUser || '').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      alert("Please enter a valid Google email address");
      return;
    }

    if (role === 'mentor') {
      const name = targetEmail.split('@')[0];
      const cleanName = name.charAt(0).toUpperCase() + name.slice(1);
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          role: 'mentor',
          id: `MNT-${Date.now().toString().slice(-6)}`,
          name: cleanName,
          email: targetEmail,
        })
      );
      setShowGoogleAccountModal(false);
      navigate('/mentor/profile');
    } else {
      if (!googleMentorId.trim()) {
        alert("Please enter your assigned Mentor ID");
        return;
      }

      const existingStudents = JSON.parse(localStorage.getItem('linkedStudents') || '[]');
      const studentName = targetEmail.split('@')[0];
      const cleanStudentName = studentName.charAt(0).toUpperCase() + studentName.slice(1);

      const newStudent = {
        id: Date.now().toString(),
        name: cleanStudentName,
        email: targetEmail,
        mentorId: googleMentorId.trim().toUpperCase(),
        joinedAt: new Date().toLocaleDateString(),
      };

      const isDuplicate = existingStudents.some(
        (s) => s.email === newStudent.email && s.mentorId === googleMentorId.trim().toUpperCase()
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
          mentorId: googleMentorId.trim().toUpperCase(),
        })
      );

      setShowGoogleAccountModal(false);
      setShowMentorIdModal(false);
      navigate('/student/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 transition-all duration-300 min-h-[600px] flex flex-col justify-center">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
            {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-purple-100 text-xs">
            {authMode === 'signin'
              ? 'Sign in to continue to EduTracker'
              : 'Sign up to get started with EduTracker'}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-black/20 p-1 rounded-xl mb-5 relative">
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
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors z-10 cursor-pointer ${
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
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors z-10 cursor-pointer ${
              role === 'mentor' ? 'text-purple-600' : 'text-white/80 hover:text-white'
            }`}
          >
            <User size={18} />
            Mentor
          </button>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-100 text-sm text-center flex flex-col items-center gap-2">
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
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold underline cursor-pointer transition-all"
              >
                Use Quick Account Sign-In
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {authMode === 'signup' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-white/90 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
                placeholder={role === 'mentor' ? 'Dr. Sarah Wilson' : 'Alex Johnson'}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
              placeholder="name@college.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          {role === 'student' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-white/90 mb-1.5">Mentor ID</label>
              <input
                type="text"
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
                placeholder="Enter your assigned Mentor ID"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-2">
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
                  ? 'bg-white text-purple-600 hover:bg-purple-50'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              {isLoading && authMode === 'signin' ? (
                <Loader2 size={20} className="animate-spin text-purple-600" />
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
                  ? 'bg-white text-purple-600 hover:bg-purple-50'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              {isLoading && authMode === 'signup' ? (
                <Loader2 size={20} className="animate-spin text-purple-600" />
              ) : (
                'Sign Up'
              )}
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink-0 mx-4 text-white/60 text-xs">Or continue with</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white/10 text-white font-medium py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-70 cursor-pointer text-sm"
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

        <p className="text-center mt-5 text-purple-100 text-sm">
          {authMode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="text-white font-semibold hover:underline cursor-pointer"
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
                className="text-white font-semibold hover:underline cursor-pointer"
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

      {/* Personal Google Account Login Modal */}
      {showGoogleAccountModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGoogleAccountModal(false)}
          ></div>

          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 border border-blue-100">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              <h3 className="text-xl font-bold text-slate-800">Google Account Sign-In</h3>
              <p className="text-slate-500 text-xs mt-1">
                Enter your personal Google account email on this device to continue
              </p>
            </div>

            <form onSubmit={handlePersonalGoogleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Personal Google Email
                </label>
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm"
                  placeholder="your.email@gmail.com"
                  autoFocus
                  required
                />
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Assigned Mentor ID
                  </label>
                  <input
                    type="text"
                    value={googleMentorId}
                    onChange={(e) => setGoogleMentorId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium text-sm"
                    placeholder="e.g. MNT-2024-001"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                Sign In as {role === 'mentor' ? 'Mentor' : 'Student'}
              </button>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  ↻ Retry Browser Google Popup
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoogleAccountModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
