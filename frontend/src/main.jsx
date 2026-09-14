import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './premium.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const serviceCatalog = [
  { code:'EL', title:'Power & Electricity', category:'ELECTRICITY', text:'Outages, sockets, lighting faults and electrical safety issues.', team:'Facilities & Maintenance' },
  { code:'WA', title:'Water & Plumbing', category:'WATER', text:'Leaks, blocked drains, supply issues and faulty fittings.', team:'Facilities & Maintenance' },
  { code:'HS', title:'Hostel Maintenance', category:'HOSTEL_MAINTENANCE', text:'Room repairs, furniture, doors, windows and shared facilities.', team:'Student Affairs' },
  { code:'IT', title:'ICT Support', category:'ICT', text:'Wi-Fi, portal access, computer labs, devices and networks.', team:'ICT Services' },
  { code:'SE', title:'Security', category:'SECURITY', text:'Unsafe areas, suspicious activity and campus safety concerns.', team:'Campus Security' },
  { code:'CF', title:'Classroom Facilities', category:'CLASSROOM', text:'Projectors, seats, fans, AC and classroom equipment.', team:'Academic Facilities' }
];

const demoComplaints = [
  { id:1042, title:'Library Wi-Fi outage', category:'ICT', location:'Main Library', status:'IN_PROGRESS', priority:'HIGH', submittedBy:'Student' },
  { id:1038, title:'Faulty projector', category:'CLASSROOM', location:'Lecture Hall 2', status:'ASSIGNED', priority:'MEDIUM', submittedBy:'Student' },
  { id:1031, title:'Broken corridor light', category:'ELECTRICITY', location:'Hostel Block B', status:'RESOLVED', priority:'HIGH', submittedBy:'Student' }
];

function useRoute(){
  const [path,setPath]=useState(window.location.pathname || '/');
  useEffect(()=>{const onPop=()=>setPath(window.location.pathname||'/');window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop)},[]);
  const go=(to)=>{if(to===path)return;window.history.pushState({},'',to);setPath(to);window.scrollTo({top:0,behavior:'smooth'})};
  return {path,go};
}

function Link({to,go,className='',children}){return <a href={to} className={className} onClick={e=>{if(!e.metaKey&&!e.ctrlKey&&!e.shiftKey){e.preventDefault();go(to)}}}>{children}</a>}

function App(){
  const {path,go}=useRoute();
  const [summary,setSummary]=useState({});
  const [complaints,setComplaints]=useState([]);
  const [apiOnline,setApiOnline]=useState(false);
  const [notice,setNotice]=useState('');
  const [form,setForm]=useState({title:'',description:'',location:'',category:'ICT',submittedBy:'',priority:'MEDIUM'});

  const load=async()=>{try{const [s,c]=await Promise.all([axios.get(`${API}/dashboard/summary`),axios.get(`${API}/complaints`)]);setSummary(s.data||{});setComplaints(c.data||[]);setApiOnline(true)}catch{setApiOnline(false)}};
  useEffect(()=>{load()},[]);

  const data=complaints.length?complaints:demoComplaints;
  const total=summary.total ?? data.length;
  const resolved=summary.resolved ?? data.filter(x=>x.status==='RESOLVED').length;
  const inProgress=summary.inProgress ?? data.filter(x=>x.status==='IN_PROGRESS').length;
  const open=Math.max(total-resolved,0);
  const rate=total?Math.round((resolved/total)*100):0;

  const submit=async e=>{e.preventDefault();setNotice('Submitting complaint...');try{const response=await axios.post(`${API}/complaints`,form);setApiOnline(true);setNotice(`Complaint #${response.data?.id ?? ''} submitted successfully.`);setForm({title:'',description:'',location:'',category:'ICT',submittedBy:'',priority:'MEDIUM'});await load()}catch{setNotice('Complaint could not be submitted because the service API is currently unavailable.')}};

  const props={go,data,summary:{total,resolved,inProgress,open,rate},apiOnline,form,setForm,submit,notice,load};
  let page=<HomePage {...props}/>;
  if(path==='/services')page=<ServicesPage {...props}/>;
  else if(path==='/report')page=<ReportPage {...props}/>;
  else if(path==='/track')page=<TrackPage {...props}/>;
  else if(path==='/updates')page=<UpdatesPage {...props}/>;
  else if(path==='/portal')page=<PortalPage {...props}/>;
  else if(path==='/staff')page=<StaffPage {...props}/>;

  return <div className="product-shell"><Header path={path} go={go}/><main>{page}</main><Footer go={go}/></div>;
}

function Header({path,go}){
  const nav=[['/services','Services'],['/report','Report'],['/track','Track'],['/updates','Updates']];
  return <header className="topbar"><div className="container topbar-inner"><Link to="/" go={go} className="brand-lockup"><img src="/logo-full.svg" alt="Smart Campus"/></Link><nav className="main-nav">{nav.map(([to,label])=><Link key={to} to={to} go={go} className={path===to?'active':''}>{label}</Link>)}</nav><div className="nav-actions"><Link to="/portal" go={go} className="text-link">Student portal</Link><Link to="/report" go={go} className="button primary">Report issue</Link></div></div></header>
}

function HomePage({go,data,summary,apiOnline}){return <><section className="hero"><div className="container hero-grid"><div className="hero-copy"><h1>Campus support that works like a real service.</h1><p>Report an issue, receive a reference number, track progress and see exactly when the responsible department resolves it.</p><div className="hero-actions"><Link to="/report" go={go} className="button primary">Submit a complaint</Link><Link to="/track" go={go} className="button secondary">Track a complaint</Link></div><div className="system-line"><span className={apiOnline?'dot online':'dot'}></span>{apiOnline?'Live service connected':'Demo interface — service API pending deployment'}</div></div><OverviewCard summary={summary}/></div></section><section className="section white"><div className="container"><SectionTitle eyebrow="Service directory" title="Choose the department you need." text="Every report is categorized so it reaches the right operational team."/><div className="service-grid">{serviceCatalog.slice(0,4).map(s=><ServiceCard key={s.code} service={s} go={go}/>)}</div><div className="section-action"><Link to="/services" go={go} className="button secondary">View all services</Link></div></div></section><section className="section"><div className="container split-feature"><div><SectionTitle eyebrow="A complete workflow" title="Not just a complaint form." text="The product covers reporting, tracking, service updates and staff resolution workflows."/><div className="feature-list"><Feature n="01" title="Create" text="Submit a structured report with category, location and priority."/><Feature n="02" title="Track" text="Use a complaint reference to see live status and details."/><Feature n="03" title="Resolve" text="Staff can assign and update cases through the operations console."/></div></div><RecentList data={data.slice(0,3)} go={go}/></div></section></>}

function ServicesPage({go}){return <PageFrame eyebrow="Service directory" title="Campus support services" text="Find the correct service area before submitting a report."><div className="service-grid full">{serviceCatalog.map(s=><ServiceCard key={s.code} service={s} go={go}/>)}</div></PageFrame>}
function ServiceCard({service,go}){return <article className="service-card"><div className="service-code">{service.code}</div><h3>{service.title}</h3><p>{service.text}</p><div className="service-meta">Handled by {service.team}</div><button className="card-link" onClick={()=>go('/report')}>Report this issue →</button></article>}

function ReportPage({form,setForm,submit,notice,apiOnline}){return <PageFrame eyebrow="New complaint" title="Report a campus issue" text="Give the service team the information they need to investigate and respond."><div className="report-layout"><aside className="side-panel"><h3>What happens next</h3><StepMini n="1" text="Your report receives a reference number."/><StepMini n="2" text="The appropriate department reviews the case."/><StepMini n="3" text="Status updates appear in the tracking portal."/><div className="api-note"><span className={apiOnline?'dot online':'dot'}></span>{apiOnline?'Submission service online':'Backend service is not deployed yet'}</div></aside><ComplaintForm form={form} setForm={setForm} submit={submit} notice={notice}/></div></PageFrame>}
function ComplaintForm({form,setForm,submit,notice}){return <form className="product-form" onSubmit={submit}><div className="form-grid"><label>Issue title<input required placeholder="e.g. Broken light in corridor" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Location<input required placeholder="e.g. Hostel B, Floor 2" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label></div><label>Description<textarea required placeholder="Explain what happened and anything the service team should know." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><div className="form-grid"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['ELECTRICITY','WATER','HOSTEL_MAINTENANCE','ICT','SECURITY','CLASSROOM','OTHER'].map(x=><option key={x}>{x.replaceAll('_',' ')}</option>)}</select></label><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{['LOW','MEDIUM','HIGH','URGENT'].map(x=><option key={x}>{x}</option>)}</select></label></div><label>Your name<input placeholder="Optional" value={form.submittedBy} onChange={e=>setForm({...form,submittedBy:e.target.value})}/></label><button className="button primary wide">Submit complaint</button>{notice&&<div className="form-notice">{notice}</div>}</form>}

function TrackPage({data,apiOnline}){const [query,setQuery]=useState('');const [result,setResult]=useState(null);const [message,setMessage]=useState('');const find=async e=>{e.preventDefault();setMessage('');setResult(null);if(!query.trim())return;try{const r=await axios.get(`${API}/complaints/${query.trim()}`);setResult(r.data)}catch{const local=data.find(x=>String(x.id)===query.trim());if(local)setResult(local);else setMessage('No complaint was found with that reference number.')}};return <PageFrame eyebrow="Complaint tracking" title="Track a report" text="Enter the complaint reference number you received when the issue was submitted."><div className="track-layout"><form className="track-search" onSubmit={find}><label>Complaint reference</label><div className="search-row"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. 1042"/><button className="button primary">Track</button></div><small>{apiOnline?'Connected to live complaint records.':'Demo records are available while the API is offline. Try 1042.'}</small></form>{message&&<div className="empty-state">{message}</div>}{result&&<ComplaintDetail complaint={result}/>}</div></PageFrame>}
function ComplaintDetail({complaint}){return <article className="complaint-detail"><div className="detail-head"><div><span className="ref">#{complaint.id}</span><h2>{complaint.title}</h2></div><Status status={complaint.status}/></div><div className="detail-grid"><Detail label="Category" value={clean(complaint.category)}/><Detail label="Location" value={complaint.location}/><Detail label="Priority" value={clean(complaint.priority)}/><Detail label="Submitted by" value={complaint.submittedBy||'Anonymous'}/></div><div className="timeline"><TimelineItem active title="Complaint submitted" text="Your issue has been recorded."/><TimelineItem active={['ASSIGNED','IN_PROGRESS','RESOLVED'].includes(complaint.status)} title="Assigned to department" text="A service team has received the case."/><TimelineItem active={['IN_PROGRESS','RESOLVED'].includes(complaint.status)} title="Work in progress" text="The department is working on the issue."/><TimelineItem active={complaint.status==='RESOLVED'} title="Resolved" text="The complaint has been completed."/></div></article>}

function UpdatesPage({data}){const [filter,setFilter]=useState('ALL');const filtered=filter==='ALL'?data:data.filter(x=>x.status===filter);return <PageFrame eyebrow="Service updates" title="Campus complaint activity" text="See recent reports and how they are progressing through the service process."><div className="filter-row">{['ALL','SUBMITTED','ASSIGNED','IN_PROGRESS','RESOLVED'].map(x=><button key={x} className={filter===x?'filter active':'filter'} onClick={()=>setFilter(x)}>{clean(x)}</button>)}</div><div className="case-list">{filtered.map(c=><CaseRow key={c.id} complaint={c}/>)}</div></PageFrame>}

function PortalPage({go,data,summary}){return <PageFrame eyebrow="Student portal" title="Your service centre" text="A single place to submit, track and review campus service requests."><div className="portal-grid"><div className="portal-main"><div className="quick-grid"><Quick title="Report an issue" text="Create a new complaint." action="Start report" onClick={()=>go('/report')}/><Quick title="Track complaint" text="Check a case by reference." action="Track now" onClick={()=>go('/track')}/><Quick title="Service directory" text="Find the correct department." action="View services" onClick={()=>go('/services')}/></div><h2 className="subheading">Recent complaints</h2><div className="case-list">{data.slice(0,5).map(c=><CaseRow key={c.id} complaint={c}/>)}</div></div><aside className="portal-aside"><h3>Overview</h3><MetricLine label="Total reports" value={summary.total}/><MetricLine label="Open cases" value={summary.open}/><MetricLine label="Resolved" value={summary.resolved}/><MetricLine label="Resolution rate" value={`${summary.rate}%`}/><button className="button dark wide" onClick={()=>go('/staff')}>Open staff console</button></aside></div></PageFrame>}

function StaffPage({data,load}){const [cases,setCases]=useState(data);useEffect(()=>setCases(data),[data]);const update=async(id,status)=>{setCases(prev=>prev.map(x=>x.id===id?{...x,status}:x));try{await axios.put(`${API}/complaints/${id}/status`,{status});await load()}catch{}};return <PageFrame eyebrow="Operations console" title="Staff complaint management" text="Review active cases and move complaints through the service workflow."><div className="staff-toolbar"><div><strong>{cases.length}</strong><span> visible cases</span></div><span>Department operations view</span></div><div className="staff-table-wrap"><table className="staff-table"><thead><tr><th>Reference</th><th>Issue</th><th>Location</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead><tbody>{cases.map(c=><tr key={c.id}><td>#{c.id}</td><td><strong>{c.title}</strong><small>{clean(c.category)}</small></td><td>{c.location}</td><td>{clean(c.priority)}</td><td><Status status={c.status}/></td><td><select value={c.status} onChange={e=>update(c.id,e.target.value)}>{['SUBMITTED','ASSIGNED','IN_PROGRESS','RESOLVED','REJECTED'].map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div></PageFrame>}

function PageFrame({eyebrow,title,text,children}){return <section className="page-section"><div className="container"><div className="page-head"><span>{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{children}</div></section>}
function OverviewCard({summary}){return <aside className="overview-card"><div className="overview-head"><h2>Service overview</h2><span>System status</span></div><div className="metric-grid"><Metric value={summary.total} label="Total reports"/><Metric value={summary.open} label="Open cases"/><Metric value={summary.resolved} label="Resolved"/><Metric value={`${summary.rate}%`} label="Resolution rate"/></div><div className="overview-footer"><span>Latest operational data</span><span className="online-text">● Available</span></div></aside>}
function Metric({value,label}){return <div className="metric"><strong>{value}</strong><span>{label}</span></div>}
function SectionTitle({eyebrow,title,text}){return <div className="section-title"><span>{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>}
function Feature({n,title,text}){return <div className="feature"><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>}
function RecentList({data,go}){return <div className="recent-panel"><div className="panel-title"><h3>Recent reports</h3><button onClick={()=>go('/updates')}>View all</button></div>{data.map(c=><CaseRow key={c.id} complaint={c}/>)}</div>}
function CaseRow({complaint}){return <div className="case-row"><div className="case-id">#{complaint.id}</div><div className="case-main"><strong>{complaint.title}</strong><span>{complaint.location} · {clean(complaint.category)}</span></div><Status status={complaint.status}/></div>}
function Status({status}){const value=status||'SUBMITTED';return <span className={`status status-${value.toLowerCase()}`}>{clean(value)}</span>}
function Detail({label,value}){return <div className="detail"><span>{label}</span><strong>{value||'—'}</strong></div>}
function TimelineItem({active,title,text}){return <div className={active?'timeline-item active':'timeline-item'}><span></span><div><strong>{title}</strong><p>{text}</p></div></div>}
function StepMini({n,text}){return <div className="step-mini"><span>{n}</span><p>{text}</p></div>}
function Quick({title,text,action,onClick}){return <button className="quick-card" onClick={onClick}><strong>{title}</strong><span>{text}</span><b>{action} →</b></button>}
function MetricLine({label,value}){return <div className="metric-line"><span>{label}</span><strong>{value}</strong></div>}
function clean(value=''){return String(value).replaceAll('_',' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())}
function Footer({go}){return <footer><div className="container footer-grid"><div><img src="/logo-full.svg" alt="Smart Campus"/><p>Campus service and complaint management built as a complete student and staff product.</p></div><div><strong>Product</strong><button onClick={()=>go('/services')}>Services</button><button onClick={()=>go('/report')}>Report issue</button><button onClick={()=>go('/track')}>Track complaint</button></div><div><strong>Portals</strong><button onClick={()=>go('/portal')}>Student portal</button><button onClick={()=>go('/staff')}>Staff console</button></div></div><div className="container footer-bottom">© 2026 Smart Campus Service & Complaint Management System · Giwa Abayomi</div></footer>}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
