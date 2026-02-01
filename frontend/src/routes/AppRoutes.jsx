import MentorLogin from "../pages/MentorLogin";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/mentor-login" element={<MentorLogin />} />
    </Routes>
  );
}

export default AppRoutes;
