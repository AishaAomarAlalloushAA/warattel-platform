import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";
import "./ToastProvider.css";

const icons = {
  success: FaCheckCircle,
  error: FaExclamationCircle,
  warning: FaExclamationTriangle,
  info: FaInfoCircle,
};

const titles = {
  success: "تم بنجاح",
  error: "حدث خطأ",
  warning: "تنبيه",
  info: "معلومة",
};

function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const handleToast = (event) => {
      const item = event.detail;
      if (!item?.message) return;

      setItems((current) => [...current, item].slice(-5));
      if (item.duration > 0) {
        window.setTimeout(() => {
          setItems((current) => current.filter((toast) => toast.id !== item.id));
        }, item.duration);
      }
    };

    const handleAuthExpired = (event) => {
      const login = event.detail?.login || "/login?role=student";
      handleToast({
        detail: {
          id: Date.now(),
          type: "warning",
          title: "انتهت الجلسة",
          message: "انتهت جلسة تسجيل الدخول. سيتم تحويلك لتسجيل الدخول من جديد.",
          duration: 2600,
        },
      });
      window.setTimeout(() => { window.location.href = login; }, 1300);
    };

    window.addEventListener("waratel:toast", handleToast);
    window.addEventListener("waratel:auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("waratel:toast", handleToast);
      window.removeEventListener("waratel:auth-expired", handleAuthExpired);
    };
  }, []);

  const remove = (id) => setItems((current) => current.filter((item) => item.id !== id));

  return (
    <>
      {children}
      <div className="toast-region" role="region" aria-label="الإشعارات">
        {items.map((item) => {
          const Icon = icons[item.type] || FaInfoCircle;
          return (
            <div key={item.id} className={`app-toast app-toast--${item.type || "info"}`} role={item.type === "error" ? "alert" : "status"}>
              <span className="app-toast__icon"><Icon /></span>
              <div className="app-toast__body">
                <strong>{item.title || titles[item.type] || titles.info}</strong>
                <span>{item.message}</span>
              </div>
              <button type="button" className="app-toast__close" onClick={() => remove(item.id)} aria-label="إغلاق الإشعار">
                <FaTimes />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ToastProvider;
