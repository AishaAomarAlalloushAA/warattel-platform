import { useCallback, useEffect, useState } from "react";
import { FaExternalLinkAlt, FaLink } from "react-icons/fa";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { studentService } from "../services";
import "./StudentLinks.css";

function StudentLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLinks(await studentService.links());
    } catch (requestError) {
      setError(requestError.message || "تعذر تحميل الروابط التعليمية.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="links-container">
      <h2 className="links-title">روابط تعليمية</h2>
      {loading ? (
        <LoadingState label="جاري تحميل الروابط..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : links.length === 0 ? (
        <EmptyState title="لا توجد روابط متاحة" message="ستظهر هنا الروابط العامة والروابط المناسبة لمستواك." />
      ) : links.map((link) => (
        <div key={link.id} className="link-card">
          <div className="link-row">
            <FaLink aria-hidden="true" />
            <span className="link-label">العنوان:</span>
            <span className="link-value">{link.title || "—"}</span>
          </div>
          <div className="link-row">
            <span className="link-label">الوصف:</span>
            <span className="link-value">{link.description || "لا يوجد وصف إضافي."}</span>
          </div>
          <div className="link-row">
            <span className="link-label">الرابط:</span>
            {link.url ? (
              <a className="link-value" href={link.url} target="_blank" rel="noopener noreferrer">
                فتح الرابط <FaExternalLinkAlt aria-hidden="true" />
              </a>
            ) : <span className="link-value">—</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentLinks;
