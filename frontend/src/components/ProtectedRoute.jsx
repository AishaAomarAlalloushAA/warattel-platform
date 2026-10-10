import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "../auth/session";

function ProtectedRoute({ role, children }) {
  const location = useLocation();
  const session = getSession();
  const currentRole = session?.user?.role;

  if (!currentRole) {
    const wantedRole = role || "student";
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?role=${wantedRole}&redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (role && currentRole !== role) {
    const destinations = {
      admin: "/admin-dashboard",
      supervisor: "/supervisor-dashboard",
      student: "/student-dashboard",
    };
    return <Navigate to={destinations[currentRole] || "/"} replace />;
  }

  return children;
}

export default ProtectedRoute;
