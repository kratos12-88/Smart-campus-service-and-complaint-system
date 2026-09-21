import axios from 'axios';

const DEFAULT_API = import.meta.env.PROD ? 'https://smart-campus-service-api-production.up.railway.app/api' : 'http://localhost:8080/api';
export const API_BASE = import.meta.env.VITE_API_URL || DEFAULT_API;
export const api = axios.create({ baseURL: API_BASE, timeout: 12000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const clean = (value = '') => String(value).replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};
export const isOverdue = (c) => Boolean(c?.dueAt && new Date(c.dueAt) < new Date() && !['RESOLVED','CLOSED','REJECTED'].includes(c.status));
export const slaText = (c) => {
  if (!c) return '—';
  if (['RESOLVED','CLOSED'].includes(c.status)) return 'Completed';
  if (!c.dueAt) return `${c.slaHours || 48}h target`;
  const ms = new Date(c.dueAt) - new Date();
  const hours = Math.max(1, Math.ceil(Math.abs(ms) / 3600000));
  return ms < 0 ? `${hours}h overdue` : `${hours}h remaining`;
};
export const readError = (error, fallback = 'Something went wrong.') => error?.response?.data?.message || error?.response?.data?.error || fallback;
export const toDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const serviceCatalog = [
  { code:'EL', title:'Power & Electricity', category:'ELECTRICITY', team:'Facilities & Maintenance', sla:24, text:'Outages, sockets, lighting and electrical safety.' },
  { code:'WA', title:'Water & Plumbing', category:'WATER', team:'Facilities & Maintenance', sla:24, text:'Leaks, drains, plumbing and water supply.' },
  { code:'HS', title:'Hostel Maintenance', category:'HOSTEL_MAINTENANCE', team:'Student Affairs', sla:72, text:'Rooms, furniture, doors and shared facilities.' },
  { code:'IT', title:'ICT Support', category:'ICT', team:'ICT Services', sla:12, text:'Wi-Fi, portals, labs, devices and networks.' },
  { code:'SE', title:'Security', category:'SECURITY', team:'Campus Security', sla:1, text:'Safety concerns, suspicious activity and access.' },
  { code:'CF', title:'Classroom Facilities', category:'CLASSROOM', team:'Academic Facilities', sla:48, text:'Projectors, seating, fans, AC and equipment.' }
];

export const locations = ['Main Library','Lecture Hall 1','Lecture Hall 2','Engineering Block','Science Block','Hostel Block A','Hostel Block B','Hostel Block C','Female Hostel','Admin Building','Student Affairs Office','Main Gate','Sports Complex','Car Park'];
