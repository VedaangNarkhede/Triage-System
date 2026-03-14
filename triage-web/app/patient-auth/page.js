"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientAuth() {
  const router = useRouter();
  
  // Existing Patient Login State
  const [patientIdInput, setPatientIdInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // New Patient Reg State
  const [regData, setRegData] = useState({ name: "", age: "", gender: "", contact: "" });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);
  const [generatedId, setGeneratedId] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/patient/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patientIdInput })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to login");
      
      router.push(`/patient/${data.patientId}`);
    } catch (err) {
      setLoginError(err.message);
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);

    try {
      const res = await fetch("/api/patient/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to register");

      setGeneratedId(data.patientId);
      
      // Briefly show the generated ID before redirecting
      setTimeout(() => {
        router.push(`/patient/${data.patientId}`);
      }, 3000);
      
    } catch (err) {
      setRegError(err.message);
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary py-20 px-6 sm:px-12 relative">
      <div className="max-w-6xl mx-auto z-10 relative">
        <h1 className="text-4xl font-bold text-text-primary mb-12 text-center">Patient <span className="text-neon-purple glow-text-purple">Authentication</span></h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* SECTION 1: Existing Patient */}
          <div className="gradient-card rounded-2xl border border-border-subtle p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-text-primary mb-6 border-b border-border-subtle pb-4">Existing Patient</h2>
            
             {loginError && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-6 text-sm">{loginError}</div>}
             
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Patient ID</label>
                <input
                  type="number"
                  required
                  className="w-full p-3 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:ring-1 focus:ring-neon-purple outline-none focus:border-neon-purple transition-all"
                  value={patientIdInput}
                  onChange={(e) => setPatientIdInput(e.target.value)}
                  placeholder="Enter your Patient ID..."
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full gradient-btn-purple text-white font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all uppercase tracking-wide text-sm disabled:opacity-50"
              >
                {loginLoading ? "Verifying..." : "Continue"}
              </button>
            </form>
          </div>

          {/* SECTION 2: New Patient */}
          <div className="gradient-card rounded-2xl border border-border-subtle p-8 shadow-lg relative overflow-hidden">
             
            {/* Generated ID Overlay */}
             {generatedId && (
               <div className="absolute inset-0 bg-bg-primary/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center animate-slide-up">
                  <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mb-4 border border-neon-green/50">
                    <span className="text-3xl text-neon-green">✓</span>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Registration Successful</h3>
                  <p className="text-text-secondary mb-6">Please save your secure Patient ID.</p>
                  <div className="text-5xl font-black text-neon-purple glow-text-purple mb-8">{generatedId}</div>
                  <p className="text-text-muted text-sm animate-pulse-glow">Redirecting to your portal...</p>
               </div>
             )}

            <h2 className="text-2xl font-bold text-text-primary mb-6 border-b border-border-subtle pb-4">New Patient Registration</h2>
            
             {regError && <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-6 text-sm">{regError}</div>}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:ring-1 focus:ring-neon-purple outline-none focus:border-neon-purple transition-all"
                  value={regData.name}
                  onChange={(e) => setRegData({...regData, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Age</label>
                  <input
                    type="number"
                    required
                    className="w-full p-3 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:ring-1 focus:ring-neon-purple outline-none focus:border-neon-purple transition-all"
                    value={regData.age}
                    onChange={(e) => setRegData({...regData, age: e.target.value})}
                    placeholder="E.g. 45"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Gender</label>
                  <select
                    className="w-full p-3 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:ring-1 focus:ring-neon-purple outline-none focus:border-neon-purple transition-all"
                    value={regData.gender}
                    onChange={(e) => setRegData({...regData, gender: e.target.value})}
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Contact Number</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:ring-1 focus:ring-neon-purple outline-none focus:border-neon-purple transition-all"
                  value={regData.contact}
                  onChange={(e) => setRegData({...regData, contact: e.target.value})}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              
              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-bg-secondary border-2 border-neon-purple text-neon-purple font-bold py-3 rounded-xl hover:bg-neon-purple/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all mt-4 uppercase tracking-wide text-sm disabled:opacity-50"
              >
                {regLoading ? "Registering..." : "Register Patient"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
