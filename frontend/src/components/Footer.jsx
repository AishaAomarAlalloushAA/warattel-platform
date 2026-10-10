import { FaTelegram } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__group site-footer__brand">
          <div className="site-footer__logo-wrap">
            <img src="/w.png" alt="نادي ورتل" className="site-footer__logo" />
          </div>
          <div>
            <h2>نادي ورتل</h2>
            <p>بيئة قرآنية حاضنة تساعدك على أن تصاحب القرآن علماً وعملاً.</p>
          </div>
        </div>

        <div className="site-footer__group">
          <h3>روابط سريعة</h3>
          <div className="site-footer__links">
            <a href="/#about-section">عن النادي</a>
            <a href="/#programs-section">ماذا نقدم</a>
            <a href="/lectures">المحاضرات والأنشطة</a>
            <a href="/volunteer">تطوع معنا</a>
            <a href="/feedback">آراؤكم تهمّنا</a>
          </div>
        </div>

        <div className="site-footer__group">
          <h3>تواصل معنا</h3>
          <div className="site-footer__socials">
            <a href="https://t.me/nady_w_rattel" target="_blank" rel="noreferrer">
              <FaTelegram />
              القناة العامة
            </a>
            <a href="https://t.me/ite_alep_qm_bot" target="_blank" rel="noreferrer">
              <FaTelegram />
              بوت التواصل
            </a>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} نادي ورتل. جميع الحقوق محفوظة.</span>
      </div>
    </footer>
  );
}

export default Footer;
