import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudent } from '../services/api.js';

const empty = { name: '', email: '', college: '', teach: '', learn: '', bio: '' };
const splitSkills = (v) => v.split(',').map((s) => s.trim()).filter(Boolean);

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Full name is required (min 2 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.college.length > 100) e.college = 'College name must be under 100 characters.';
  if (!splitSkills(f.teach).length) e.teach = 'Add at least one skill you can teach, separated by commas.';
  if (!splitSkills(f.learn).length) e.learn = 'Add at least one skill you want to learn, separated by commas.';
  if (f.bio.length > 300) e.bio = 'Bio must be 300 characters or fewer.';
  return e;
}

export default function AddProfile({ onCreated, onToast }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    try {
      const student = await createStudent({
        ...form,
        teach: splitSkills(form.teach),
        learn: splitSkills(form.learn),
      });
      await onCreated(student);
      onToast({ type: 'success', message: 'Profile created. Here are your matches.' });
      navigate('/matches');
    } catch (err) {
      if (err.details) setErrors(err.details);
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key, label, props = {}) => (
    <div className={`field ${errors[key] ? 'has-error' : ''}`}>
      <label htmlFor={key}>{label}</label>
      {props.textarea ? (
        <textarea id={key} rows="3" value={form[key]} onChange={set(key)} placeholder={props.placeholder} />
      ) : (
        <input id={key} type={props.type || 'text'} value={form[key]} onChange={set(key)} placeholder={props.placeholder} />
      )}
      {props.hint && !errors[key] && <small className="muted">{props.hint}</small>}
      {errors[key] && <small className="field-error">{errors[key]}</small>}
    </div>
  );

  return (
    <section className="container section narrow">
      <h1 className="page-title">Add your profile</h1>
      <form className="card form" onSubmit={submit} noValidate>
        {field('name', 'Full name *', { placeholder: 'Aarav Sharma' })}
        {field('email', 'Email *', { type: 'email', placeholder: 'you@college.edu' })}
        {field('college', 'College name', { placeholder: 'Your college or university' })}
        {field('teach', 'Skills I can teach *', { placeholder: 'React, JavaScript, Python', hint: 'Separate skills with commas.' })}
        {field('learn', 'Skills I want to learn *', { placeholder: 'UI/UX, Figma', hint: 'Separate skills with commas.' })}
        {field('bio', 'Short bio', { textarea: true, placeholder: 'A line or two about you', hint: `${form.bio.length}/300` })}
        {serverError && <p className="notice error">{serverError}</p>}
        <button className="btn btn-primary btn-lg" disabled={submitting}>{submitting ? 'Saving…' : 'Create profile'}</button>
      </form>
    </section>
  );
}
