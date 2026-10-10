import { FaExclamationTriangle, FaInbox, FaSpinner } from "react-icons/fa";
import "./DataState.css";

export function LoadingState({ label = "جاري تحميل البيانات..." }) {
  return <div className="data-state data-state--loading"><FaSpinner className="data-state__spinner" /><span>{label}</span></div>;
}

export function ErrorState({ message = "تعذر تحميل البيانات.", onRetry }) {
  return (
    <div className="data-state data-state--error">
      <FaExclamationTriangle />
      <strong>تعذر إكمال الطلب</strong>
      <span>{message}</span>
      {onRetry && <button type="button" onClick={onRetry}>إعادة المحاولة</button>}
    </div>
  );
}

export function EmptyState({ title = "لا توجد بيانات", message = "لا توجد عناصر لعرضها حالياً." }) {
  return <div className="data-state data-state--empty"><FaInbox /><strong>{title}</strong><span>{message}</span></div>;
}
