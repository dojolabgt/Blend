import Image from "next/image";
import Link from "next/link";

const HeroBanner2 = () => {
    const bgImage = '/assets/img/hero-bg-3.svg';
    return (
    <section className="cs_hero cs_style_3 position-relative">
      <div className="cs_hero_content cs_bg_filed cs_radius_50 position-relative z-1" style={{ backgroundImage: `url(${bgImage})`}} >
        <div className="container">
          <div className="row cs_gap_y_40">
            <div className="col-lg-5 order-lg-2">
              <div className="cs_hero_thumbnail">
                <Image src="/assets/img/hero-img-2.png" alt="img" width={921} height={712}   />     
              </div>
            </div>
            <div className="col-lg-7 order-lg-1">
              <div className="cs_hero_text position-relative z-1">
                <p className="cs_hero_subtitle cs_heading_color cs_heading_font cs_mb_28">
                  <span className="cs_theme_color_4">
                  <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   />                          
                  </span>
                  <span>Supercharge Your Sales</span>
                  <span className="cs_theme_color_4">
                  <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   />
                  </span>
                </p>
                <h1 className="cs_hero_title cs_fs_64 cs_mb_18 wow fadeInDown">Get Automated With The Best <span className="cs_has_shape position-relative">CRM <Image src="/assets/img/rectangle-shape.svg" alt="img" width={190} height={86}   /></span> for Businesses</h1>
                <p className="cs_hero_desc cs_mb_30">All the generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet.</p>
                <div className="cs_btns_group">
                  <Link href="/contact" aria-label="Get started button" className="cs_btn cs_style_1 cs_bg_1 cs_fs_14 cs_bold cs_white_color text-uppercase">
                  <span>Get Started Now</span>
                  <span className="cs_btn_icon"><i className="bi bi-arrow-right"></i></span>
                  </Link>
                  <Link href="/about" aria-label="About page link" className="cs_btn cs_style_1 cs_outline cs_ cs_fs_14 cs_bold cs_heading_color text-uppercase">
                  <span>Learn More</span>
                  <span className="cs_btn_icon"><i className="bi bi-arrow-right"></i></span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="cs_hero_shape_1 position-absolute">
            <Image src="/assets/img/dna-shape.png" alt="img" width={89} height={150}   />
          </div>
          <div className="cs_hero_shape_2 position-absolute">
            <Image src="/assets/img/spring-shape-3.svg" alt="img" width={94} height={94}   />
          </div>
        </div>
      </div>
    </section>
    );
};

export default HeroBanner2;