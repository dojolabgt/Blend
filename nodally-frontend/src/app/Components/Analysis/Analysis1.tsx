import Image from 'next/image';
import React from 'react';

const Analysis1 = () => {
    return (
<section className="position-relative">
      <div className="cs_height_120 cs_height_lg_80"></div>
      <div className="container">
        <div className="cs_card cs_style_1 cs_type_3">
          <div className="row cs_gap_y_50 position-relative z-1">
            <div className="col-lg-6">
              <div className="cs_card_thumbnail position-relative">
                <Image src="/assets/img/dashboard.png" alt="img" width={631} height={461}   />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="cs_card_content">
                <div className="cs_section_heading cs_style_1 cs_mb_27">
                  <div className="cs_section_subtitle cs_fs_18 cs_heading_color cs_mb_22">
                    <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   /> 
                    <span>Customizations & Analysis</span>
                    <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   />
                  </div>
                  <h2 className="cs_section_title cs_fs_48 cs_semibold wow fadeInLeft">We Make It Easy To Track All User Analytics</h2>
                  <p className="cs_card_desc mb-0">All the generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet.</p>
                </div>
                <div className="cs_iconbox_wrapper_1">
                  <div className="cs_iconbox cs_style_1 cs_type_1">
                    <span className="cs_iconbox_icon cs_center cs_accent_bg">
                      <Image src="/assets/img/icons/advanced-tracking.svg" alt="img" width={51} height={50}   />
                    </span>
                    <div className="cs_iconbox_info">
                      <h3 className="cs_fs_20 cs_semibold cs_mb_1">Advanced tracking</h3>
                      <p className="mb-0">All the generators on the Internet tend to repeat predefined chunks as</p>
                    </div>
                  </div>
                  <div className="cs_iconbox cs_style_1 cs_type_1">
                    <span className="cs_iconbox_icon cs_center cs_bg_1">
                      <Image src="/assets/img/icons/in-depth.svg" alt="img" width={39} height={50}   />
                    </span>
                    <div className="cs_iconbox_info">
                      <h3 className="cs_fs_20 cs_semibold cs_mb_1">In-depth monitoring</h3>
                      <p className="mb-0">All the generators on the Internet tend to repeat predefined chunks as</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="cs_star_shape_5 position-absolute">
          <Image src="/assets/img/3d-shape-2.png" alt="img" width={104} height={100}   />
        </div>
      </div>
      <div className="cs_height_120 cs_height_lg_80"></div>
    </section>
    );
};

export default Analysis1;