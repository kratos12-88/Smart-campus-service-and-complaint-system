import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './styles.css';

const API = 'http://localhost:8080/api';

function App() {
  const [summary, setSummary] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', location:'', category:'ICT', submittedBy:'', priority:'MEDIUM' });

  const load = async () => {
    const [s, c] = await Promise.all([
      axios.get(`${API}/dashboard/summary`),
      axios.get(`${API}/complaints`)
    ]);
    setSummary(s.data);
    setComplaints(c.data);
  };

  useEffect(() => { load().catch(console.error); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/complaints`, form);
    setForm({ title:'', description:'', location:'', category:'ICT', submittedBy:'', priority:'MEDIUM' });
    await load();
  };

  return <div className="app">
    <header><h1>Smart Campus</h1><p>Service & Complaint Management System</p></header>
    <main>
      <section className="cards">
        <Stat label="Total" value={summary.total ?? 0}/>
        <Stat label="Submitted" value={summary.submitted ?? 0}/>
        <Stat label="In Progress" value={summary.inProgress ?? 0}/>
        <Stat label="Resolved" value={summary.resolved ?? 0}/>
      </section>

      <section className="grid">
        <form className="panel" onSubmit={submit}>
          <h2>Submit Complaint</h2>
          <input placeholder="Complaint title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
          <textarea placeholder="Describe the problem" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/>
          <input placeholder="Campus location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} required/>
          <input placeholder="Your name or matric number" value={form.submittedBy} onChange={e=>setForm({...form,submittedBy:e.target.value})}/>
          <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
            {['ELECTRICITY','WATER','HOSTEL_MAINTENANCE','ICT','SECURITY','CLASSROOM','OTHER'].map(x=><option key={x}>{x}</option>)}
          </select>
          <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
            {['LOW','MEDIUM','HIGH','URGENT'].map(x=><option key={x}>{x}</option>)}
          </select>
          <button>Submit Complaint</button>
        </form>

        <section className="panel">
          <h2>Recent Complaints</h2>
          {complaints.length===0 ? <p>No complaints yet.</p> : complaints.slice().reverse().slice(0,8).map(c =>
            <article className="ticket" key={c.id}>
              <div><strong>{c.title}</strong><small>{c.category} · {c.location}</small></div>
              <span>{c.status}</span>
            </article>
          )}
        </section>
      </section>
    </main>
  </div>;
}

function Stat({label,value}) { return <div className="stat"><span>{label}</span><strong>{value}</strong></div>; }

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
