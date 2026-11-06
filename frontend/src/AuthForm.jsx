import React, { useRef, useState } from 'react';
import { Page } from './components';
import { readError } from './api';
import { validateAuth } from './auth-validation';

export function AuthForm({ login, register, go, apiOnline, serviceError }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', schoolName:'', campusName:'', schoolType:'University', schoolState:'Lagos' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const formRef = useRef(null);
  const isRegister = mode === 'register';
  const change = event => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]:value }));
    setErrors(previous => ({ ...previous, [name]:undefined }));
    setMessage('');
  };
  const field = (name, label, type = 'text', extra = {}) => <label htmlFor={`auth-${name}`}>{label}<input id={`auth-${name}`} name={name} type={type} value={form[name]} onChange={change} required aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `error-${name}` : undefined} {...extra}/>{errors[name] && <span id={`error-${name}`} className="field-error">{errors[name]}</span>}</label>;
  const submit = async event => {
    event.preventDefault();
    if (busy) return;
    const nextErrors = validateAuth(form, isRegister);
    setErrors(nextErrors); setMessage('');
    if (Object.keys(nextErrors).length) {
      formRef.current?.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    setBusy(true);
    try {
      const email = form.email.trim().toLowerCase();
      const user = isRegister
        ? await register(form.name.trim(), email, form.password, form.schoolName.trim(), form.campusName.trim(), form.schoolType, form.schoolState, form.confirmPassword)
        : await login(email, form.password);
      setForm(previous => ({...previous,password:'',confirmPassword:''}));
      go(user.role === 'STUDENT' ? '/portal' : user.role === 'ADMIN' ? '/admin' : '/staff');
    } catch (error) {
      setMessage(readError(error, 'Unable to reach the service. Please try again.'));
    } finally { setBusy(false); }
  };
  return <Page tag="Account access" title={isRegister ? 'Create student account' : 'Sign in to Smart Campus'} text={isRegister ? 'Link your reports to your school and campus.' : 'Access your school-linked service account.'}>
    <div className="auth-layout"><form ref={formRef} className="auth-card" onSubmit={submit} noValidate aria-busy={busy}>
      {isRegister && <>
        {field('name','Full name','text',{autoComplete:'name',maxLength:80})}
        <div className="form-grid"><label>Institution type<select name="schoolType" value={form.schoolType} onChange={change}>{['University','Polytechnic / Monotechnic','College of Education','College of Health / Nursing','Other tertiary institution'].map(value=><option key={value}>{value}</option>)}</select></label><label>State<select name="schoolState" value={form.schoolState} onChange={change}>{['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'].map(value=><option key={value}>{value}</option>)}</select></label></div>
        {field('schoolName','School / institution','text',{maxLength:120})}
        {field('campusName','Campus / branch','text',{maxLength:120})}
      </>}
      {field('email','Email','email',{autoComplete:'username',maxLength:254,autoCapitalize:'none',spellCheck:false})}
      {field('password','Password',visible ? 'text' : 'password',{autoComplete:isRegister?'new-password':'current-password',maxLength:128})}
      {isRegister && <><small className="muted">8–128 characters with uppercase, lowercase and a number.</small>{field('confirmPassword','Confirm password',visible?'text':'password',{autoComplete:'new-password',maxLength:128})}</>}
      <label className="password-visibility"><input type="checkbox" checked={visible} onChange={event=>setVisible(event.target.checked)}/> Show password{isRegister?'s':''}</label>
      {!apiOnline && <p className="form-notice" role="status">{serviceError || 'Checking service connection…'} You can still try signing in.</p>}
      <button disabled={busy} className="button primary wide">{busy?'Please wait…':isRegister?'Create student account':'Sign in'}</button>
      {message && <div className="form-notice error" role="alert">{message}</div>}
      <button type="button" disabled={busy} className="switch-auth" onClick={()=>{setMode(isRegister?'login':'register');setMessage('');setErrors({});setVisible(false);setForm(previous=>({...previous,password:'',confirmPassword:''}));}}>{isRegister?'Already have an account? Sign in':'New student? Create an account'}</button>
    </form><aside className="demo-accounts"><h3>School-linked reporting</h3><p>Your school and campus are stored with your account. Complaints are routed into your institution’s staff workspace.</p><p>Staff and administrator accounts are provisioned by the institution. Public registration creates student accounts only.</p></aside></div>
  </Page>;
}
