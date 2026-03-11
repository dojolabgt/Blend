import Image from "next/image";
import Link from "next/link";

const Feature4 = () => {
    return (
 <section className="position-relative">
      <div className="cs_height_120 cs_height_lg_80"></div>
      <div className="container">
        <div className="cs_card cs_style_2 position-relative z-1">
          <div className="row cs_gap_y_40">
            <div className="col-lg-6 order-lg-2">
              <div className="cs_card_thumbnail">
                <Image src="/assets/img/dashboard-2.png" alt="img" width={924} height={666}   />  
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="cs_card_content">
                <div className="cs_section_heading cs_style_1 cs_mb_34">
                  <div className="cs_section_subtitle cs_fs_18 cs_heading_color cs_mb_22">
                    <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   />   
                    <span>Appreciation feature</span>
                    <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   />   
                  </div>
                  <h2 className="cs_section_title cs_fs_48 cs_semibold wow fadeInUp">Our Priority CRM Options For The Future</h2>
                  <p className="mb-0">CRM management is comprehensive contact management, allowing businesses to centralize and organize customer information for easy access.</p>
                </div>
                <div className="cs_service_item cs_radius_15 cs_gray_bg_2 cs_mb_24 cs_active">
                  <h3 className="cs_service_title cs_fs_24 cs_semibold cs_mb_8">Sales Force Automation</h3>
                  <p className="mb-0">CRM management is comprehensive contact management, allowing businesses to centralize and organize customer information for allowing businesses to centralize and organize easy access.</p>
                </div>
                <div className="cs_service_item cs_radius_15 cs_mb_48">
                  <h3 className="cs_service_title cs_fs_24 cs_semibold cs_mb_8">Lead Management</h3>
                  <p className="mb-0">CRM management is comprehensive contact management, allowing businesses to centralize and organize customer information for allowing businesses to centralize and organize easy access.</p>
                </div>
                <div className="cs_btns_group">
                  <Link href="/contact" aria-label="Get started button" className="cs_btn cs_style_1 cs_bg_1 cs_fs_14 cs_bold cs_white_color text-uppercase">
                  <span>Get Started Free</span>
                  <span className="cs_btn_icon"><i className="bi bi-arrow-right"></i></span>
                  </Link>
                  <div className="cs_client_info_wrapper">
                    <Image src="/assets/img/customers-group.png" alt="img" width={151} height={58}   />   
                    <div>
                      <h3 className="cs_fs_30 cs_semibold mb-0">3.5k <span>+</span></h3>
                      <p className="cs_heading_color mb-0">Active Customer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="cs_height_120 cs_height_lg_80"></div>
    </section>

    );
};

export default Feature4;