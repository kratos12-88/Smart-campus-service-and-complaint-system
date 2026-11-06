export function validateAuth(form, registration = false) {
  const errors = {};
  const name = form.name?.trim().replace(/\s+/g, ' ') || '';
  const email = form.email?.trim().toLowerCase() || '';
  if (!email || email.length > 254 || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) errors.email = 'Enter a valid email address.';
  if (!form.password?.trim()) errors.password = 'Enter your password.';
  if (registration) {
    if (!/^[\p{L}][\p{L} .'-]{1,79}$/u.test(name)) errors.name = 'Enter a name between 2 and 80 characters, using letters, spaces, apostrophes or hyphens.';
    if (!form.password || form.password.length < 8 || form.password.length > 128 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) errors.password = 'Use 8–128 characters, including uppercase, lowercase and a number.';
    if (!form.confirmPassword || form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords must match.';
    for (const key of ['schoolName', 'campusName']) {
      const value = form[key]?.trim() || '';
      if (value.length < 2 || value.length > 120) errors[key] = `Enter your ${key === 'schoolName' ? 'school' : 'campus'} name (2–120 characters).`;
    }
  }
  return errors;
}
