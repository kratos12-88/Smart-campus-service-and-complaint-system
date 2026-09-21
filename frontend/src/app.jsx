import React,{useEffect,useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import'./premium.css';
import'./enhancements.css';
import{api,isOverdue}from'./api';
import{Footer,Header,NotFound}from'./components';
import{Admin,Auth,CampusMapPage,ComplaintPage,Help,Home,Portal,Report,Services,Staff,Track,Updates}from'./pages';


function useRoute(){const[path,setPath]=useState(location.pathname||'/');useEffect(()=>{const f=()=>setPath(location.pathname||'/');addEventListener('popstate',f);return()=>removeEventListener('popstate',f)},[]);const go=t=>{history.pushState({},'',t);setPath(t);scrollTo({top:0,behavior:'smooth'})};return{path,go}}

function App(){
 const{path,go}=useRoute();
 const[user,setUser]=useState(()=>JSON.parse(localStorage.getItem('sc_user')||'null'));
 const[cases,setCases]=useState([]);const[apiOnline,setApiOnline]=useState(false);const[serviceError,setServiceError]=useState('');const[notifications,setNotifications]=useState([]);
 const loadCases=async()=>{try{const r=await api.get('/complaints');setCases(Array.isArray(r.data)?r.data:[]);setApiOnline(true);setServiceError('')}catch{setCases([]);setApiOnline(false);setServiceError('The live service API is currently unavailable.')}};
 const refreshNotifications=async()=>{if(!localStorage.getItem('sc_token'))return;try{const r=await api.get('/auth/notifications');setNotifications(r.data||[])}catch{}};
 const loadUser=async()=>{if(!localStorage.getItem('sc_token'))return;try{const r=await api.get('/auth/me');setUser(r.data);localStorage.setItem('sc_user',JSON.stringify(r.data));await refreshNotifications();setApiOnline(true)}catch{localStorage.removeItem('sc_token');localStorage.removeItem('sc_user');setUser(null)}};
 useEffect(()=>{loadCases();loadUser()},[]);
 const login=async(email,password)=>{const r=await api.post('/auth/login',{email,password});localStorage.setItem('sc_token',r.data.token);const u={id:r.data.id,name:r.data.name,email:r.data.email,role:r.data.role,department:r.data.department,schoolName:r.data.schoolName,campusName:r.data.campusName,schoolType:r.data.schoolType,schoolState:r.data.schoolState};localStorage.setItem('sc_user',JSON.stringify(u));setUser(u);setApiOnline(true);await loadCases();await refreshNotifications();return u};
 const register=async(name,email,password,schoolName,campusName,schoolType,schoolState)=>{const r=await api.post('/auth/register',{name,email,password,schoolName,campusName,schoolType,schoolState});localStorage.setItem('sc_token',r.data.token);const u={id:r.data.id,name:r.data.name,email:r.data.email,role:r.data.role,department:r.data.department,schoolName:r.data.schoolName,campusName:r.data.campusName,schoolType:r.data.schoolType,schoolState:r.data.schoolState};localStorage.setItem('sc_user',JSON.stringify(u));setUser(u);setApiOnline(true);return u};
 const logout=async()=>{try{await api.post('/auth/logout')}catch{}localStorage.removeItem('sc_token');localStorage.removeItem('sc_user');setUser(null);setNotifications([]);go('/')};
 const summary=useMemo(()=>{const total=cases.length,resolved=cases.filter(x=>['RESOLVED','CLOSED'].includes(x.status)).length,open=cases.filter(x=>!['RESOLVED','CLOSED','REJECTED'].includes(x.status)).length,overdue=cases.filter(isOverdue).length;return{total,resolved,open,overdue,rate:total?Math.round(resolved/total*100):0}},[cases]);
 const p={go,path,user,cases,setCases,summary,apiOnline,serviceError,login,register,logout,notifications,refreshNotifications,loadCases};
 let page=<Home {...p}/>;
 if(path==='/services')page=<Services {...p}/>;else if(path==='/report')page=<Report {...p}/>;else if(path==='/track')page=<Track {...p}/>;else if(path.startsWith('/complaint/'))page=<ComplaintPage {...p} id={path.split('/').pop()}/>;else if(path==='/updates')page=<Updates {...p}/>;else if(path==='/portal')page=user?<Portal {...p}/>:<Auth {...p}/>;else if(path==='/map')page=user?<CampusMapPage {...p}/>:<Auth {...p}/>;else if(path==='/staff')page=user&&['STAFF','ADMIN'].includes(user.role)?<Staff {...p}/>:<Auth {...p}/>;else if(path==='/admin')page=user?.role==='ADMIN'?<Admin {...p}/>:<Auth {...p}/>;else if(path==='/help')page=<Help {...p}/>;else if(path==='/login')page=<Auth {...p}/>;else if(path!=='/')page=<NotFound go={go}/>;
 return <div className="product-shell"><Header {...p}/><main>{page}</main><Footer go={go}/></div>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
