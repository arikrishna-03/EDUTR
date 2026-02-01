import api from "../api/axiosConfig";

export async function fetchDashboardSummary() {
  const res = await api.get("/dashboard/summary");
  return res.data;
}

export async function fetchMyStudents() {
  const res = await api.get("/mentors/my-students");
  return res.data;
}

export async function fetchStudent(id) {
  const res = await api.get(`/students/${id}`);
  return res.data;
}

export async function fetchStudentsForDemo() {
  // fallback demo data
  return {
    students: [
      { _id: "s1", name: "Alice", problems: 120, rating: 1500 },
      { _id: "s2", name: "Bob", problems: 80, rating: 1300 }
    ]
  };
}
