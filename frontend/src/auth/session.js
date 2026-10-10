const SESSION_KEY = "waratel_session_v1";

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore corrupted legacy storage and fall through.
  }

  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  if (!role && !token) return null;

  return {
    token: token || null,
    user: {
      role: role || null,
      full_name: localStorage.getItem("studentName") || localStorage.getItem("adminName") || "",
      role_data: {
        student_id: localStorage.getItem("studentID") || null,
      },
    },
  };
}

export function saveSession({ token = null, user }) {
  const session = { token, user };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");

  if (user?.role) localStorage.setItem("role", user.role);
  if (user?.full_name) {
    if (user.role === "student") localStorage.setItem("studentName", user.full_name);
    if (user.role === "admin") localStorage.setItem("adminName", user.full_name);
  }

  const studentId = user?.role_data?.student_id;
  if (studentId != null) localStorage.setItem("studentID", String(studentId));

  if (user?.person?.gender) localStorage.setItem("gender", user.person.gender);
  window.dispatchEvent(new CustomEvent("waratel:session", { detail: session }));
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  ["token", "role", "studentID", "studentName", "adminName", "gender"].forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new CustomEvent("waratel:session", { detail: null }));
}

export function getToken() {
  return getSession()?.token || null;
}

export function getCurrentUser() {
  return getSession()?.user || null;
}

export function getRole() {
  return getCurrentUser()?.role || null;
}

export function isAuthenticated() {
  return Boolean(getSession()?.user?.role);
}
