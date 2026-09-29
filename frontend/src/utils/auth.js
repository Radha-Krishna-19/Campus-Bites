// Auth utility functions

export const setAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Pages use `user` as an effect dependency, so it must keep the same identity
// until the stored value actually changes.
let cachedRaw = null;
let cachedUser = null;

export const getAuth = () => {
  const token = localStorage.getItem('token');
  const raw = localStorage.getItem('user');
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = raw ? JSON.parse(raw) : null;
  }
  return { token, user: cachedUser };
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const { token } = getAuth();
  return !!token;
};

export const getUserRole = () => {
  const { user } = getAuth();
  return user?.role || null;
};
