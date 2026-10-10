import React from "react";
import "./AboutClub.css";

const features = [
  {
    number: "01",
    title: "مستويات متدرجة",
    description: "تلاوة، انتقالي وغيبي بحسب مستوى كل طالب وخطته المناسبة.",
  },
  {
    number: "02",
    title: "طرق تسميع مرنة",
    description: "متابعة حضورية أو عن بُعد بما يحافظ على الاستمرارية والالتزام.",
  },
  {
    number: "03",
    title: "بيئة إيمانية حاضنة",
    description: "مجتمع داعم ومحفز يرافق الطالب في رحلته مع القرآن.",
  },
];

function AboutClub() {
  return (
    <section className="about-club" id="about-section" aria-labelledby="about-club-title">
      <div className="about-club-container">
        <blockquote className="about-club-hadith">
          <span className="about-club-hadith-label">هَدْيٌ نبوي</span>
          <p>«خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ»</p>
          <cite>رواه البخاري</cite>
        </blockquote>

        <header className="about-club-header">
          <span className="section-kicker">عن نادي ورتل</span>
          <h2 id="about-club-title">صحبةٌ مع القرآن تمتد إلى الحياة</h2>
          <p className="about-club-description">
            نادٍ قرآني متفاعل يهدف إلى إيجاد بيئة حاضنة تجمع الراغبين والراغبات
            بمصاحبة القرآن، لصنع جيل يحمل القرآن في قلبه وأفعاله.
          </p>
        </header>

        <div className="about-club-grid">
          {features.map((feature) => (
            <article className="about-club-card" key={feature.number}>
              <span className="about-club-number">{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AboutClub;
