export default function StudentForm() {
  return (
    <form className="form">
      <input type="text" placeholder="Name / Roll No" />
      <input type="email" placeholder="Email ID" />
      <input type="password" placeholder="Password" />

      <button className="btn">Login</button>

      <button className="google-btn">Login with Google</button>
    </form>
  );
}
