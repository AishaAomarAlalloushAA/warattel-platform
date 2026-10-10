import { FaCommentDots, FaTelegram } from "react-icons/fa";

const contactLinks = [
  {
    href: "https://t.me/nady_w_rattel",
    title: "القناة العامة",
    meta: "أخبار النادي والإعلانات",
    icon: FaTelegram,
    external: true,
  },
  {
    href: "https://t.me/ite_alep_qm_bot",
    title: "بوت تواصل ذكور",
    meta: "للاستفسارات والتواصل",
    icon: FaTelegram,
    external: true,
  },
  {
    href: "https://t.me/ite_alep_qw_bot",
    title: "بوت تواصل إناث",
    meta: "للاستفسارات والتواصل",
    icon: FaTelegram,
    external: true,
  },
  {
    href: "/feedback",
    title: "آراؤكم تهمّنا",
    meta: "شاركنا رأيك أو اقتراحك مباشرة",
    icon: FaCommentDots,
    external: false,
  },
];

function ContactSection() {
  return (
    <section id="contact-section" className="contact-section" aria-labelledby="contact-title">
      <div className="contact-container">
        <h2 className="contact-title" id="contact-title">
          كن جزءاً من عائلة نادي ورتل
        </h2>
        <p className="contact-subtitle">
          اختر قناة التواصل المناسبة لك، وتابع الأنشطة والمواعيد أو أرسل استفسارك ورأيك مباشرة.
        </p>

        <div className="contact-links">
          {contactLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="contact-card"
                key={link.href}
              >
                <span className="contact-icon-wrap" aria-hidden="true">
                  <Icon className="contact-icon" />
                </span>
                <span className="contact-copy">
                  <span className="contact-text">{link.title}</span>
                  <span className="contact-meta">{link.meta}</span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
