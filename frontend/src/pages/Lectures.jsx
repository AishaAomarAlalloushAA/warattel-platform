/*import { useCallback, useEffect, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { publicService } from "../services";
import "./Lectures.css";

const registrationLabel = (value) => {
  if (value === "open") return "التسجيل مفتوح";
  if (value === "soon") return "قريباً";
  if (value === "closed") return "منتهي";
  return value || "غير محدد";
};

function Lectures() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLectures(await publicService.lectures());
    } catch (requestError) {
      setError(requestError.message || "تعذر تحميل المحاضرات والأنشطة.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="lectures-page">
      <div className="lectures-container">
        <h1 className="lectures-title">محاضرات وأنشطة نادي ورتل</h1>
        <p className="lectures-subtitle">المحتوى المنشور من إدارة النادي يظهر هنا تلقائياً.</p>

        {loading ? (
          <LoadingState label="جاري تحميل المحاضرات..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : lectures.length === 0 ? (
          <EmptyState title="لا توجد محاضرات منشورة حالياً" />
        ) : (
          <div className="lectures-grid">
            {lectures.map((lecture) => (
              <article className="lecture-card" key={lecture.id}>
                <div className="lecture-image">
                  <img src={lecture.thumbnail || "/w.png"} alt={lecture.title} loading="lazy" />
                </div>
                <div className="lecture-content">
                  <h2>{lecture.title}</h2>
                  {lecture.description && <p>{lecture.description}</p>}
                  <div className="lecture-meta">
                    {lecture.display_date && <span>{lecture.display_date}</span>}
                    {lecture.category && <span>{lecture.category}</span>}
                    <span>{registrationLabel(lecture.registration_status)}</span>
                  </div>
                  {lecture.url && (
                    <a className="lecture-link" href={lecture.url} target="_blank" rel="noopener noreferrer">
                      <span>{lecture.type === "playlist" ? "فتح السلسلة" : lecture.type === "video" ? "مشاهدة المحاضرة" : "فتح المحتوى"}</span>
                      <FaExternalLinkAlt aria-hidden="true" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Lectures;*/



import { FaExternalLinkAlt } from "react-icons/fa";
import "./Lectures.css";

const lectures = [
  {
    id: 1,
    title: "قبل أن يهل الهلال",
    description: "التحضير لشهر رمضان خلال الأيام المتبقية من شهر شعبان.",
    display_date: "4/2/2026",
    type: "video",
    url: "https://youtu.be/q_jGe-paLcU?si=eRHDbFuiBHjoO9Lu",
    thumbnail: "https://img.youtube.com/vi/q_jGe-paLcU/0.jpg",
    registration_status: "closed",
    category:  "  للذكور فقط  ",
  },
  {
    id: 2,
    title: "بعد أن هل الهلال",
    description: "للمحافظة على العبادة بعد رمضان",
    display_date: "22/4/2026",
    type: "video",
    url: "https://www.youtube.com/watch?v=svA-x21r1Yg",
    thumbnail: "https://img.youtube.com/vi/svA-x21r1Yg/0.jpg",
    registration_status: "closed",
    category:  "  للذكور فقط   ",
  },
  {
    id: 3,
    title: "قبل العشر من ذي الحجة",
    description: "الاستعداد لأفضل أيام الدنيا",
    display_date: "18/5/2026",
    type: "video",
    url: "https://youtu.be/ntAolNp3j68?is=5VDT_USK7f-Zp5jR",
    thumbnail: "https://img.youtube.com/vi/ntAolNp3j68/0.jpg",
    registration_status: "closed",
    category: "  للذكور فقط  ",
  },
  {
    id: 4,
    title: "ولادة مسلم",
    description: "سلسلة فيديوهات تتحدث عن الرحلة لاكتشاف المعنى والهوية وبناء حياة أقرب إلى الله.",
    display_date: null,
    type: "playlist",
    url: "https://youtube.com/playlist?list=PL38keZKifrmEyWdYXcDMNWlL37w-mUYP0&si=P5cKd-H5zo1zWg2W",
    thumbnail: "/33.jpg",
    registration_status: "closed",
    category: "  للذكور فقط  ",
  },
  {
    id: 5,
    title: "قبل أن يهل الهلال",
    description: null,
    display_date: "5/2/2026",
    type: "image",
    url: null,
    thumbnail: "/A.jpg",
    registration_status: "closed",
    category: "  للإناث فقط  ",
  },
  {
    id: 6,
    title: "فقه الصيام",
    description: "درس يوضح أحكام الصيام وما يتعلق به من مسائل فقهية مهمة.",
    display_date: "12/2/2026",
    type: "image",
    url: null,
    thumbnail: "/B.jpg",
    registration_status: "closed",
    category: "  للإناث فقط  ",
  },
  {
    id: 7,
    title: "ليطمئن قلبي",
    description: "سلسلة جلسات تدبر لسورة النور",
    display_date: "كل خميس",
    type: "image",
    url: null,
    thumbnail: "/C.jpg",
    registration_status: "closed",
    category: "  للإناث فقط   ",
  },
  {
    id: 8,
    title: "سلسلة جلسات كوني صحابية",
    description: null,
    display_date: "غير معلن عنها بعد",
    type: "image",
    url: null,
    thumbnail: "/E.png",
    registration_status: "soon",
    category: "  للإناث فقط  ",
  },
  {
    id: 9,
    title: "مسابقة إلى الجنة زمراً",
    description: "مسابقة لحفظ سورة الزمر كاملة وقراءة ملف التفسير وفهمه",
    display_date: "24/12/2025",
    type: "image",
    url: null,
    thumbnail: "/F.png",
    registration_status: "closed",
    category: "  للإناث والذكور ",
  },
];

const registrationLabel = (value) => {
  if (value === "open") return "التسجيل مفتوح";
  if (value === "soon") return "قريباً";
  if (value === "closed") return "منتهي";
  return value || "غير محدد";
};

function Lectures() {
  return (
    <div className="lectures-page">
      <div className="lectures-container">
        <h1 className="lectures-title">محاضرات وأنشطة نادي ورتل</h1>
        <p className="lectures-subtitle">محاضرات وأنشطة نادي ورتل.</p>

        <div className="lectures-grid">
          {lectures.map((lecture) => (
            <article className="lecture-card" key={lecture.id}>
              <div className="lecture-image">
                <img src={lecture.thumbnail || "/w.png"} alt={lecture.title} loading="lazy" />
              </div>
              <div className="lecture-content">
                <h2>{lecture.title}</h2>
                {lecture.description && <p>{lecture.description}</p>}
                <div className="lecture-meta">
                  {lecture.display_date && <span>{lecture.display_date}</span>}
                  {lecture.category && <span>{lecture.category}</span>}
                  <span>{registrationLabel(lecture.registration_status)}</span>
                </div>
                {lecture.url && (
                  <a className="lecture-link" href={lecture.url} target="_blank" rel="noopener noreferrer">
                    <span>{lecture.type === "playlist" ? "فتح السلسلة" : lecture.type === "video" ? "مشاهدة المحاضرة" : "فتح المحتوى"}</span>
                    <FaExternalLinkAlt aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Lectures;
