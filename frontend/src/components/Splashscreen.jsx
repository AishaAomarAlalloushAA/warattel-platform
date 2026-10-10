import React from "react";
import { FaHeart } from "react-icons/fa";

function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="hero-shell">
        <div className="hero-copy">
          <span className="hero-eyebrow">نادي ورتل القرآني</span>
          <h1>صُحبةٌ تُعينك على أن تعيش مع القرآن</h1>
          <p>
            بيئة قرآنية حاضنة تجمع التلاوة والحفظ والتعلّم في رحلة واضحة، هادئة،
            ومتدرجة تناسب مستوى كل طالب وطالبة.
          </p>

          <div className="hero-actions">
            <a className="hero-primary-action" href="/volunteer">
              <FaHeart aria-hidden="true" style={{ marginInlineEnd: "8px" }} />
              <span>تطوع معنا</span>
            </a>
            <a className="hero-secondary-action" href="#about-section">
              تعرّف على النادي
            </a>
          </div>

          <div className="hero-points" aria-label="مزايا النادي">
            <span>تلاوة متقنة</span>
            <span>حفظ متدرّج</span>
            <span>صحبة محفّزة</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-logo-card">
            <span className="hero-logo-halo" />
            <img src="/w.png" className="splash-logo" alt="" />
            <div className="hero-logo-caption">
              <strong>ورتل</strong>
              <span>نقرأ القرآن كما أُنزل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
