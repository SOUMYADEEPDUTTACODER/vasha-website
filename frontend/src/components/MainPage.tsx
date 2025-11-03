import { useEffect, useState } from "react";

export function MainPage() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUsername(data.username));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
  };

  return (
    <div>
      <div className="top-bar flex justify-between items-center p-4 bg-gray-100">
        <span>Welcome, {username}</span>
        <button onClick={handleLogout} className="text-red-600 underline">Logout</button>
      </div>
      {/* rest of your main page */}
    </div>
  );
}