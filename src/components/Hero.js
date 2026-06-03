import React, { useState, useEffect } from 'react';
import { ChevronRight, Truck, RotateCcw, ShieldCheck, BadgePercent } from 'lucide-react';

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
    tagline: "NEW ARRIVAL - BỘ SƯU TẬP XUÂN HÈ 2026",
    title: "JUST STYLE, JUST LIFE",
    desc: "Cùng Jusstlife định nghĩa lại phong cách sống tối giản hiện đại. Khám phá những bộ cánh chất lừ từ chất liệu Linen hữu cơ và thun 100% Cotton thoáng mát ngay hôm nay.",
    actionText: "Mua Ngay Bộ Sưu Tập"
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80",
    tagline: "FLASH SALE CUỐI TUẦN - UP TO 50%",
    title: "SĂN CỰC ĐÃ, GIÁ CỰC CHẤT",
    desc: "Hàng loạt sản phẩm best-seller từ Áo thun, quần Jean baggy đến phụ kiện cá tính đồng loạt ưu đãi sốc đến 50%. Số lượng có hạn, nhanh tay lên bạn ơi!",
    actionText: "Săn Deal Hot Ngay"
  },
  {
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
    tagline: "ABOUT US - CÂU CHUYỆN THƯƠNG HIỆU",
    title: "CẢM HỨNG TỪ SỰ ĐƠN GIẢN",
    desc: "Chúng tôi tin rằng trang phục tốt nhất là trang phục giúp bạn cảm thấy tự tin và thoải mái là chính mình. Hãy cùng tìm hiểu về triết lý thiết kế của Jusstlife.",
    actionText: "Tìm Hiểu Câu Chuyện"
  }
];

export default function Hero({ setCurrentPage }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleActionClick = (index) => {
    if (index === 2) {
      setCurrentPage('about');
    } else {
      setCurrentPage('shop');
    }
  };

  return (
    <div>
      {/* HERO SLIDER */}
      <div className="hero-section">
        {SLIDES.map((slide, idx) => (
          <div 
            key={idx} 
            className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <span className="hero-tagline">{slide.tagline}</span>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-desc">{slide.desc}</p>
              <button 
                className="hero-btn" 
                onClick={() => handleActionClick(idx)}
              >
                <span>{slide.actionText}</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}

        <div className="hero-dots">
          {SLIDES.map((_, idx) => (
            <span 
              key={idx} 
              className={`hero-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            ></span>
          ))}
        </div>
      </div>

      {/* SERVICES BAR */}
      <div className="container services-bar">
        <div className="service-card">
          <div className="service-icon">
            <Truck size={24} />
          </div>
          <div className="service-info">
            <h4>Giao Hàng Hỏa Tốc</h4>
            <p>Nhận hàng trong vòng 2h tại TP.HCM & HN</p>
          </div>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <RotateCcw size={24} />
          </div>
          <div className="service-info">
            <h4>Đổi Trả Dễ Dàng</h4>
            <p>Hỗ trợ đổi trả miễn phí trong vòng 7 ngày</p>
          </div>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <ShieldCheck size={24} />
          </div>
          <div className="service-info">
            <h4>Chính Hãng 100%</h4>
            <p>Cam kết chất lượng thiết kế chuẩn chỉnh</p>
          </div>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <BadgePercent size={24} />
          </div>
          <div className="service-info">
            <h4>Ưu Đãi Đặc Quyền</h4>
            <p>Hàng ngàn mã giảm giá cho thành viên mới</p>
          </div>
        </div>
      </div>
    </div>
  );
}
