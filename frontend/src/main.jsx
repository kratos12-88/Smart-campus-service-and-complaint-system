import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './styles.css';
import './premium.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const services = [
  ['EL','Power & Electricity','Report outages, damaged sockets, lighting issues and electrical hazards.'],
  ['WA','Water & Plumbing','Report leaks, blocked drains, water supply problems and faulty fittings.'],
  ['HS','Hostel Maintenance','Request repairs for rooms, doors, windows, furniture and shared facilities.'],
  ['IT','ICT Support','Report Wi-Fi, portal, computer lab, device and network problems.'],
  ['SE','Security','Report suspicious activity, unsafe areas and urgent campus security concerns.'],
  ['CF','Classroom Facilities','Report broken seats, projectors, fans, AC units and classroom equipment.']
];

function App(){
  const [summary,setSummary]=useState({});
  const [complaints,setComplaints]=useState([]);
  const [status,setStatus]=useState('');
  const [form,setForm]=useState({title:'',description:'',location:'',category:'ICT',submittedBy:'',priority:'MEDIUM'});

  const load = async () => {
    const [s,c] = await Promise.all([
      axios.get(`${API}/dashboard/summary`),
      axios.get(`${API}/complaints`)
    ]);
    setSummary(s.data||{});
    setComplaints(c.data||[]);
  };

  useEffect(()=>{ load().catch(()=>{}); },[]);

  const total = summary.total ?? complaints.length ?? 0;
  const resolved = summary.resolved ?? complaints.filter(x=>x.status==='RESOLVED').length;
  const open = Math.max(total-resolved,0);
  const rate = total ? Math.round((resolved/total)*100) : 0;
  const recent = useMemo(()=>complaints.slice().reverse().slice(0,3),[complaints]);

  const submit = async e => {
    e.preventDefault();
    setStatus('Submitting your complaint...');
    try{
      await axios.post(`${API}/complaints`,form);
      setStatus('Complaint submitted successfully.');
      setForm({title:'',description:'',location:'',category:'ICT',submittedBy:'',priority:'MEDIUM'});
      await load();
    }catch{
      setStatus('We could not submit your complaint right now. Please try again shortly.');
    }
  };

  return <div className="site">
    <header className="nav-wrap">
      <nav className="nav container">
        <a className="brand brand-lockup" href="#home"><img src="/logo-full.svg" alt="Smart Campus Service & Complaint Management"/></a>
        <div className="nav-links"><a href="#services">Services</a><a href="#how">How it works</a><a href="#report">Report issue</a><a href="#updates">Updates</a></div>
        <a className="nav-cta" href="#report">Report an issue</a>
      </nav>
    </header>

    <main>
      <section id="home" className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>Report campus problems.<br/><span>Track every resolution.</span></h1>
            <p>A single, reliable place for students to report maintenance, ICT, security and facility issues — with a clear process from submission to resolution.</p>
            <div className="hero-actions"><a className="btn primary" href="#report">Submit a complaint</a><a className="btn secondary" href="#how">How it works</a></div>
            <div className="trust-row"><span>24/7 reporting</span><span>One service channel</span><span>Clear status tracking</span></div>
          </div>
          <div className="hero-card">
            <div className="hero-card-top"><span>Campus service overview</span><span className="live-dot">● Live</span></div>
            <div className="metric-grid"><Metric value={total} label="Total reports"/><Metric value={open} label="Open cases"/><Metric value={resolved} label="Resolved"/><Metric value={`${rate}%`} label="Resolution rate"/></div>
            <div className="mini-ticket"><div className="icon-circle">IT</div><div><strong>Network issue logged</strong><small>Main Library • ICT Support</small></div><span className="pill">Assigned</span></div>
            <div className="mini-ticket"><div className="icon-circle">EL</div><div><strong>Electrical issue resolved</strong><small>Lecture Hall 2 • Maintenance</small></div><span className="pill done">Resolved</span></div>
          </div>
        </div>
      </section>

      <section id="services" className="section services-section">
        <div className="container"><div className="section-head"><span className="eyebrow">Core service areas</span><h2>Everything students need in one service portal.</h2><p>Reports are categorized so each complaint reaches the right department without unnecessary delays.</p></div>
          <div className="service-grid">{services.map(([icon,title,text])=><article className="service-card" key={title}><div className="service-icon">{icon}</div><h3>{title}</h3><p>{text}</p><a href="#report">Report this issue →</a></article>)}</div>
        </div>
      </section>

      <section id="how" className="section how-section"><div className="container"><div className="section-head center"><span className="eyebrow">How the platform works</span><h2>Simple for students. Structured for staff.</h2></div><div className="steps"><Step n="01" title="Submit your issue" text="Tell us what happened, where it happened and how urgent it is."/><Step n="02" title="The right team receives it" text="Your complaint is routed to the relevant campus department for action."/><Step n="03" title="Track the outcome" text="Follow the complaint status until the issue is fully resolved."/></div></div></section>

      <section id="report" className="section report-section"><div className="container report-grid">
        <div className="report-copy"><span className="eyebrow light">Make a report</span><h2>Tell the right team what needs attention.</h2><p>Give a clear description and exact location so the responsible department can act quickly.</p><div className="contact-box"><strong>Before you submit</strong><p>Use the correct category, include the exact location and reserve urgent priority for serious time-sensitive issues.</p></div></div>
        <form className="report-form" onSubmit={submit}><div className="form-row"><label>Issue title<input required placeholder="e.g. Faulty projector in lecture hall" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Location<input required placeholder="e.g. Lecture Hall 2" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label></div><label>Description<textarea required placeholder="Describe the issue clearly..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><div className="form-row"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['ELECTRICITY','WATER','HOSTEL_MAINTENANCE','ICT','SECURITY','CLASSROOM','OTHER'].map(x=><option key={x}>{x.replaceAll('_',' ')}</option>)}</select></label><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{['LOW','MEDIUM','HIGH','URGENT'].map(x=><option key={x}>{x}</option>)}</select></label></div><label>Your name<input placeholder="Optional" value={form.submittedBy} onChange={e=>setForm({...form,submittedBy:e.target.value})}/></label><button className="submit-btn">Submit complaint</button>{status&&<p className="form-status">{status}</p>}</form>
      </div></section>

      <section id="updates" className="section updates-section"><div className="container"><div className="section-head"><span className="eyebrow">Recent activity</span><h2>Latest service updates</h2></div><div className="updates-grid">{recent.length?recent.map(c=><article className="update-card" key={c.id}><span className={`status ${c.status==='RESOLVED'?'resolved':''}`}>{c.status?.replaceAll('_',' ')}</span><h3>{c.title}</h3><p>{c.category?.replaceAll('_',' ')} • {c.location}</p></article>):<><article className="update-card"><span className="status resolved">RESOLVED</span><h3>Library Wi-Fi restored</h3><p>ICT • Main Library</p></article><article className="update-card"><span className="status">IN PROGRESS</span><h3>Hostel water pressure check</h3><p>WATER • Hostel Block C</p></article><article className="update-card"><span className="status">ASSIGNED</span><h3>Classroom projector repair</h3><p>CLASSROOM • Lecture Hall 2</p></article></>}</div></div></section>
    </main>

    <footer><div className="container footer-grid"><div><a className="brand footer-brand brand-lockup" href="#home"><img src="/logo-full.svg" alt="Smart Campus Service & Complaint Management"/></a><p>A student-first platform for reporting and resolving campus service issues.</p></div><div><strong>Quick links</strong><a href="#services">Services</a><a href="#how">How it works</a><a href="#report">Report issue</a></div><div><strong>Project</strong><span>Built by Giwa Abayomi</span><span>Final Semester Project</span><span>Web Development</span></div></div><div className="container footer-bottom">© 2026 Smart Campus Service & Complaint Management System.</div></footer>
  </div>;
}

const Metric=({value,label})=><div className="metric"><strong>{value}</strong><span>{label}</span></div>;
const Step=({n,title,text})=><article className="step"><span>{n}</span><h3>{title}</h3><p>{text}</p></article>;

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
