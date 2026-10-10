import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck, FaComments, FaEnvelopeOpenText, FaTimes, FaTrash, FaUserClock } from "react-icons/fa";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { adminService } from "../services";
import { toast } from "../ui/toast";
import "./AdminInbox.css";

const statusLabel = (value) => value === "accepted" ? "مقبول" : value === "rejected" ? "مرفوض" : "قيد المراجعة";

function AdminInbox() {
  const [tab, setTab] = useState("volunteers");
  const [volunteers, setVolunteers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [volunteerResult, suggestionResult] = await Promise.all([
        adminService.volunteerForms(),
        adminService.suggestions(),
      ]);
      setVolunteers(volunteerResult.items || []);
      setSuggestions(suggestionResult.items || []);
    } catch (requestError) {
      setError(requestError.message || "تعذر تحميل صندوق الطلبات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pendingCount = useMemo(() => volunteers.filter((item) => (item.status?.value || item.status) === "pending").length, [volunteers]);

  const openVolunteer = (item) => {
    setSelected(item);
    setResponseText(item.admin_response || "");
  };

  const updateStatus = async (status) => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      await adminService.updateVolunteer(selected.id, {
        status,
        admin_response: responseText.trim() || null,
      });
      toast.success(status === "accepted" ? "تم قبول طلب التطوع." : status === "rejected" ? "تم رفض طلب التطوع." : "تم تحديث الطلب.");
      setSelected(null);
      await load();
    } catch (requestError) {
      toast.error(requestError.message || "تعذر تحديث طلب التطوع.");
    } finally {
      setSaving(false);
    }
  };

  const removeSuggestion = async (item) => {
    if (confirmDelete !== item.id) {
      setConfirmDelete(item.id);
      toast.warning("اضغط زر الحذف مرة ثانية لتأكيد حذف الاقتراح.");
      return;
    }
    try {
      await adminService.deleteSuggestion(item.id);
      setConfirmDelete(null);
      toast.success("تم حذف الاقتراح.");
      await load();
    } catch (requestError) {
      toast.error(requestError.message || "تعذر حذف الاقتراح.");
    }
  };

  if (loading) return <LoadingState label="جاري تحميل طلبات الزوار..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <section className="admin-inbox-page">
      <div className="admin-page-heading admin-inbox-heading">
        <div>
          <span className="admin-page-kicker">تواصل الزوار</span>
          <h1>صندوق الطلبات</h1>
          <p>مراجعة طلبات التطوع والاقتراحات المرسلة من زوار الموقع بدون اشتراط حساب.</p>
        </div>
        {pendingCount > 0 && <span className="admin-inbox-pending"><FaUserClock /> {pendingCount} طلب تطوع بانتظار المراجعة</span>}
      </div>

      <div className="admin-inbox-tabs">
        <button type="button" className={tab === "volunteers" ? "is-active" : ""} onClick={() => setTab("volunteers")}><FaEnvelopeOpenText /> طلبات التطوع ({volunteers.length})</button>
        <button type="button" className={tab === "suggestions" ? "is-active" : ""} onClick={() => setTab("suggestions")}><FaComments /> الاقتراحات ({suggestions.length})</button>
      </div>

      {tab === "volunteers" ? (
        volunteers.length === 0 ? <EmptyState title="لا توجد طلبات تطوع" /> : (
          <div className="admin-inbox-grid">
            {volunteers.map((item) => {
              const status = item.status?.value || item.status || "pending";
              return (
                <article className="admin-inbox-card" key={item.id}>
                  <div className="admin-inbox-card-head">
                    <div><strong>{item.name}</strong><span>{item.form_type?.label || item.form_type || "تطوع"}</span></div>
                    <span className={`admin-inbox-status ${status}`}>{item.status?.label || statusLabel(status)}</span>
                  </div>
                  <div className="admin-inbox-contact"><a href={`mailto:${item.email}`}>{item.email}</a><a href={`tel:${item.contact_number}`}>{item.contact_number}</a>{item.telegram_username && <span>{item.telegram_username}</span>}</div>
                  {item.additional_skills && <p>{item.additional_skills}</p>}
                  <button type="button" className="admin-inbox-review" onClick={() => openVolunteer(item)}>مراجعة الطلب</button>
                </article>
              );
            })}
          </div>
        )
      ) : suggestions.length === 0 ? <EmptyState title="لا توجد اقتراحات" /> : (
        <div className="admin-inbox-grid">
          {suggestions.map((item) => (
            <article className="admin-inbox-card" key={item.id}>
              <div className="admin-inbox-card-head"><div><strong>{item.name}</strong><span>اقتراح / ملاحظة</span></div></div>
              <div className="admin-inbox-contact"><a href={`mailto:${item.email}`}>{item.email}</a>{item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}</div>
              <p>{item.message}</p>
              <button type="button" className={`admin-inbox-delete ${confirmDelete === item.id ? "is-confirming" : ""}`} onClick={() => removeSuggestion(item)}><FaTrash /> {confirmDelete === item.id ? "تأكيد الحذف" : "حذف"}</button>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="admin-inbox-modal-overlay" onMouseDown={() => !saving && setSelected(null)}>
          <div className="admin-inbox-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="admin-inbox-modal-close" onClick={() => setSelected(null)} disabled={saving}><FaTimes /></button>
            <h2>مراجعة طلب التطوع</h2>
            <div className="admin-inbox-modal-summary"><strong>{selected.name}</strong><span>{selected.email}</span><span>{selected.contact_number}</span><span>{selected.form_type?.label || selected.form_type}</span></div>
            {selected.additional_skills && <div className="admin-inbox-skills"><strong>المهارات:</strong><p>{selected.additional_skills}</p></div>}
            <label className="admin-inbox-response"><span>رد الإدارة / ملاحظة داخلية</span><textarea rows="4" value={responseText} onChange={(event) => setResponseText(event.target.value)} placeholder="اكتب ملاحظة أو الرد المناسب..." /></label>
            <div className="admin-inbox-modal-actions">
              <button type="button" className="reject" onClick={() => updateStatus("rejected")} disabled={saving}><FaTimes /> رفض</button>
              <button type="button" className="pending" onClick={() => updateStatus("pending")} disabled={saving}><FaUserClock /> إبقاء قيد المراجعة</button>
              <button type="button" className="accept" onClick={() => updateStatus("accepted")} disabled={saving}><FaCheck /> قبول</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminInbox;
