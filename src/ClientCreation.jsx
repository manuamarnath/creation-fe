import React, { useState } from "react";

export default function ClientCreation() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Creating client...");
    try {
      const res = await fetch("https://hybrid-chat-be.onrender.com/api/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, domain })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Client created! Site ID: ${data.siteId}`);
      } else {
        setStatus(data.error || "Failed to create client");
      }
    } catch (err) {
      setStatus("Network error");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Create New Client</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email<br />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%" }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password<br />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%" }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Domain<br />
            <input type="text" value={domain} onChange={e => setDomain(e.target.value)} required style={{ width: "100%" }} />
          </label>
        </div>
        <button type="submit">Create Client</button>
      </form>
      {status && <p style={{ marginTop: 16 }}>{status}</p>}
    </div>
  );
}
