import React from "react";
import "./AboutSection.css";

function AboutSection() {
  return (
    <div className="about-section" id="about-section">
      <h2 className="about-title">عن النادي</h2>

      <div className="about-boxes">
        <div className="about-box box1">
          <p className="about-text">
            يعمل النادي بثلاثة مستويات: تلاوة – انتقالي – غيبي، ليبدأ كل طالب من مستواه الحقيقي ويتقدّم بخطوات ثابتة نحو الإتقان.
          </p>
        </div>

        <div className="about-box box2">
          <p className="about-text">
            يتم التسميع داخل مصليات الكلية مع وجود بدائل مرنة مثل التسميع عبر تسجيل صوتي أو مكالمة مباشرة مع المعلّم أو المعلّمة.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutSection;