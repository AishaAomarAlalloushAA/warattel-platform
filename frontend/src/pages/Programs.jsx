import "./Programs.css";

const programs = [
  {
    title: "دروس تدبر",
    image: "/aa.jpg",
    description:
      "نفتح باب فهم معاني القرآن وربطها بالحياة اليومية من خلال دروس قصيرة وعميقة وسهلة التطبيق.",
  },
  {
    title: "دروس تجويد",
    image: "/hh.jpg",
    description:
      "أحكام التجويد بأسلوب واضح وعملي يساعد على القراءة الصحيحة خطوة بخطوة للمبتدئ والمتقدم.",
  },
  {
    title: "تحفيظ القرآن",
    image: "/cc.jpg",
    description:
      "خطط متابعة أسبوعية وتشجيع مستمر ضمن بيئة منظمة تساعد الطالب على الثبات والمواصلة.",
  },
  {
    title: "تعليم التلاوة",
    image: "/gg.jpg",
    description:
      "من مخارج الحروف إلى تحسين الأداء القرآني، مع متابعة وتطبيقات عملية تساعد على الإتقان.",
  },
  {
    title: "تسميع حضوري وعن بُعد",
    image: "/ee.jpg",
    description:
      "خيارات مرنة للتسميع حضورياً أو عبر التسجيل الصوتي والمكالمة المباشرة بما يناسب ظروف الطالب.",
  },
  {
    title: "أنشطة متعددة",
    image: "/ff.jpg",
    description:
      "مسابقات قرآنية ومخيمات وبرامج داعمة تعين على الالتزام بالدراسة والعبادات وبناء العادات النافعة.",
  },
];

function Programs() {
  return (
    <section className="programs-page" aria-labelledby="programs-title">
      <div className="programs-inner">
        <header className="programs-header">
          <span className="programs-kicker">رحلتك معنا</span>
          <h2 className="page-title" id="programs-title">
            ماذا نقدم؟
          </h2>
          <p>
            برامج متنوعة تجمع بين التعلم والمتابعة والمرونة، لتختار المسار الأقرب إلى احتياجك.
          </p>
        </header>

        <div className="cards">
          {programs.map((program) => (
            <article className="program-card" key={program.title}>
              <img src={program.image} alt={program.title} loading="lazy" />
              <div className="program-card-overlay" />
              <div className="program-card-content">
                <h3>{program.title}</h3>
                <p>{program.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Programs;
