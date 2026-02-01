import { useState } from "react";
import MentorForm from "./MentorForm";
import StudentForm from "./StudentForm";
import "./loginCard.css";

export default function LoginCard() {
  const [isMentor, setIsMentor] = useState(true);

  return (
    <div className="login-container">
      {/* LEFT FLIP CARD */}
      <div className={`flip-card ${isMentor ? "" : "flip"}`}>
        <div className="flip-inner">
          
          {/* Front – Mentor Login */}
          <div className="flip-front glass">
            <h2>Mentor Login</h2>
            <MentorForm />
            <p className="switch">Student?  
              <span onClick={() => setIsMentor(false)}> Click here</span>
            </p>
          </div>

          {/* Back – Student Login */}
          <div className="flip-back glass">
            <h2>Student Login</h2>
            <StudentForm />
            <p className="switch">Mentor?  
              <span onClick={() => setIsMentor(true)}> Click here</span>
            </p>
          </div>

        </div>
      </div>

      {/* RIGHT STATIC PANEL – changes based on login type */}
      <div className="side-panel glass">
        {isMentor ? (
          <>
            <h1>Welcome Back!</h1>
            <p>Login as a mentor to continue</p>

            <div className="switch-box">
              <h3>Student</h3>
              <span onClick={() => setIsMentor(false)}>
                ☝🏻 click for student login
              </span>
            </div>
          </>
        ) : (
          <>
            <h1>Hello Student!</h1>
            <p>Login to access your dashboard</p>

            <div className="switch-box">
              <h3>Mentor</h3>
              <span onClick={() => setIsMentor(true)}>
                ☝🏻 click for mentor login
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
