import React, { useState, useEffect } from "react";

function MentorDashboard() {
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    const storedMentor = localStorage.getItem("mentor");
    if (storedMentor) setMentor(JSON.parse(storedMentor));
  }, []);

  if (!mentor) return <p>Loading mentor info...</p>;

  return (
    <div className="dashboard-container">
      <h2>Welcome, {mentor.name}</h2>
      <p>Email: {mentor.email}</p>
      <p>Department: {mentor.department}</p>

      {/* Later we’ll add: Editable ID + View Students section here */}
    </div>
  );
}

export default MentorDashboard;
