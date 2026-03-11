import Image from "next/image";
import Link from "next/link";

const Footer2 = () => {
    return (
 <footer className="cs_footer cs_style_1 cs_type_2 cs_accent_bg cs_bg_filed" data-src="assets/img/footer-bg-3.svg">
      <div className="cs_height_130 cs_height_lg_80"></div>
      <div className="container">
        <div className="cs_footer_top position-relative">
          <ul className="cs_location_list cs_mp_0">
            <li>
              <span className="cs_location_icon cs_center cs_heading_color cs_radius_100">
              <i className="bi bi-geo-alt-fill"></i></span>
              <div className="cs_location_info cs_fs_18">
                <p className="cs_fs_14 cs_theme_color_4 mb-0">ADDRESS</p>
                <p className="cs_white_color mb-0">12 Division Park, SKY <br/> 12546. Berlin</p>
              </div>
            </li>
            <li>
              <span className="cs_location_icon cs_center cs_heading_color cs_radius_100">
              <i className="bi bi-envelope-fill"></i></span>
              <div className="cs_location_info cs_fs_18">
                <p className="cs_fs_14 cs_theme_color_4 mb-0">EMAIL</p>
                <a href="mailto:help@webteck-mail.com" aria-label="Send mail link">help@webteck-mail.com</a> <br/>
                <a href="mailto:24/7@webteck-online.com" aria-label="Send mail link">24/7@webteck-online.com</a>
              </div>
            </li>
            <li>
              <span className="cs_location_icon cs_center cs_heading_color cs_radius_100">
              <i className="bi bi-telephone-fill"></i></span>
              <div className="cs_location_info cs_fs_18">
                <p className="cs_fs_14 cs_theme_color_4 mb-0">CALL</p>
                <a href="tel:+215253632156" aria-label="Make a call link">+(215) 2536-32156</a><br/>
                <a href="tel:+452369421587" aria-label="Make a call link">+(452) 3694-21587</a>
              </div>
            </li>
          </ul>
        </div>
        <div className="cs_footer_main cs_radius_30">
          <div className="cs_footer_desc">
            <div className="cs_brand">
               <Image src="/assets/img/logo-2.svg" alt="img" width={194} height={36}   />
            </div>
            <div className="cs_footer_desc_text">Their teams technical expertise is truly outstanding. They took the time to thoroughly understand our goals and requirements and then designed and implemented solutions that not only addressed our immediate challenges but also positioned us for future growth.</div>
          </div>
          <div className="cs_footer_header cs_radius_30">
            <ul className="cs_footer_menu cs_semibold cs_white_color cs_mp_0">
              <li><Link href="/" aria-label="Home page link">Home</Link></li>
              <li><Link href="/about" aria-label="About page link">About Us</Link></li>
              <li><Link href="/service" aria-label="Services page link">Services</Link></li>
              <li><Link href="/project" aria-label="Project page link">Projects</Link></li>
              <li><Link href="/blog" aria-label="Blog page link">Blog</Link></li>
              <li><Link href="/contact" aria-label="Contact page link">Contact Us</Link></li>
            </ul>
            <div className="cs_social_links cs_style_1 cs_heading_color">
                <a href="#" aria-label="Social link"><i className="bi bi-facebook"></i></a>
                <a href="#" aria-label="Social link"><i className="bi bi-linkedin"></i></a>
                <a href="#" aria-label="Social link"><i className="bi bi-instagram"></i></a>
                <a href="#" aria-label="Social link"><i className="bi bi-twitter-x"></i></a>
                <a href="#" aria-label="Social link"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
        </div>
        <div className="cs_footer_bottom position-relative">
          <div className="cs_footer_text cs_white_color text-center">Copyright &copy; <span className="cs_getting_year"></span> Saaso theme by Themeservices</div>
        </div>
      </div>
    </footer>
    );
};

export default Footer2;