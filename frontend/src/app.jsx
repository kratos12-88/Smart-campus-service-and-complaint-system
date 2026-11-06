import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './premium.css';
import './enhancements.css';
import {api,isOverdue} from './api';
import {Footer,Header,NotFound} from './components';
import {Admin,Auth,CampusMapPage,ComplaintPage,Help,Home,Portal,Report,Services,Staff,Track,Updates} from './pages';

function storedUser(){try{return JSON.parse(localStorage.getItem('sc_user')||'null')}catch{localStorage.removeItem('sc_user');return null}}
function useRoute(){const[path,setPath]=useState(location.pathname||'/');useEffect(()=>{const f=()=>setPath(location.pathname||'/');addEventListener('popstate',f);return()=>removeEventListener('popstate',f)},[]);const go=t=>{history.pushState({},'',t);setPath(location.pathname||'/');scrollTo({top:0,behavior:'smooth'})};return{path,go}}
function App(){
 const {path,go}=useRoute();
 const [user,setUser]=useState(null);
 const [authReady,setAuthReady]=useState(!localStorage.getItem('sc_token'));
 const [cases,setCases]=useState([]),[apiOnline,setApiOnline]=useState(false),[serviceError,setServiceError]=useState(''),[notifications,setNotifications]=useState([]);
 const clearSession=()=>{localStorage.removeItem('sc_token');localStorage.removeItem('sc_user');setUser(null);setNotifications([])};
 const loadCases=async()=>{try{const current=storedUser();const endpoint=localStorage.getItem('sc_token')&&['STAFF','ADMIN'].includes(current?.role)?'/staff/complaints':'/complaints';const r=await api.get(endpoint);setCases(Array.isArray(r.data)?r.data:[]);setApiOnline(true);setServiceError('')}catch(error){setCases([]);if(error.response?.status===401)clearSession();setApiOnline(false);setServiceError('The live service API is currently unavailable. Please retry.')}};
 const refreshNotifications=async()=>{if(!localStorage.getItem('sc_token'))return;try{const r=await api.get('/auth/notifications');setNotifications(r.data||[])}catch{setNotifications([])}};
 const loadUser=async()=>{if(!localStorage.getItem('sc_token')){setAuthReady(true);return}try{const r=await api.get('/auth/me');setUser(r.data);localStorage.setItem('sc_user',JSON.stringify(r.data));await refreshNotifications()}catch(error){if(error.response?.status===401)clearSession();else setServiceError('Could not verify your session. Refresh to retry.')}finally{setAuthReady(true)}};
 useEffect(()=>{const interceptor=api.interceptors.response.use(r=>r,error=>{if(error.response?.status===401&&!error.config?.url?.startsWith('/auth/login'))clearSession();return Promise.reject(error)});loadUser().then(loadCases);return()=>api.interceptors.response.eject(interceptor)},[]);
 const saveSession=async(data)=>{const{token,...profile}=data;localStorage.setItem('sc_token',token);localStorage.setItem('sc_user',JSON.stringify(profile));setUser(profile);setAuthReady(true);setApiOnline(true);await loadCases();await refreshNotifications();return profile};
 const login=async(email,password)=>{const r=await api.post('/auth/login',{email,password});return saveSession(r.data)};
 const register=async(name,email,password,schoolName,campusName,schoolType,schoolState,confirmPassword)=>{const r=await api.post('/auth/register',{name,email,password,confirmPassword,schoolName,campusName,schoolType,schoolState});return saveSession(r.data)};
 const logout=async()=>{try{await api.post('/auth/logout')}catch{}clearSession();await loadCases();go('/')};
 const summary=useMemo(()=>{const total=cases.length,resolved=cases.filter(x=>['RESOLVED','CLOSED'].includes(x.status)).length,open=cases.filter(x=>!['RESOLVED','CLOSED','REJECTED'].includes(x.status)).length,overdue=cases.filter(isOverdue).length;return{total,resolved,open,overdue,rate:total?Math.round(resolved/total*100):0}},[cases]);
 const p={go,path,user,cases,summary,apiOnline,serviceError,login,register,logout,notifications,refreshNotifications,loadCases};
 let page=<Home {...p}/>;
 if(path==='/services')page=<Services {...p}/>;else if(path==='/report')page=<Report {...p}/>;else if(path==='/track')page=<Track {...p}/>;else if(path.startsWith('/complaint/'))page=<ComplaintPage {...p} id={path.split('/').pop()}/>;else if(path==='/updates')page=<Updates {...p}/>;else if(path==='/portal')page=user?<Portal {...p}/>:<Auth {...p}/>;else if(path==='/map')page=user?<CampusMapPage {...p}/>:<Auth {...p}/>;else if(path==='/staff')page=user&&['STAFF','ADMIN'].includes(user.role)?<Staff {...p}/>:user?<div className="container section"><h1>Staff access required</h1><p>Your student account cannot access operations.</p></div>:<Auth {...p}/>;else if(path==='/admin')page=user?.role==='ADMIN'?<Admin {...p}/>:user?<div className="container section"><h1>Administrator access required</h1></div>:<Auth {...p}/>;else if(path==='/help')page=<Help {...p}/>;else if(path==='/login')page=<Auth {...p}/>;else if(path!=='/')page=<NotFound go={go}/>;
 if(!authReady&&['/portal','/map','/staff','/admin','/report'].includes(path))page=<div className="container section" role="status">Verifying your session…</div>;
 return <div className="product-shell"><Header {...p}/><main>{page}</main><Footer go={go}/></div>
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
