import Image from "next/image";
import Link from "next/link";

const Services2 = () => {

        const teamContent = [
        {img:'/assets/img/services-icon1.svg', title:'Sales Automation', content:'CRM management is comprehensive contact management, allowing businesses to centralize and organize customer information'},
        {img:'/assets/img/services-icon2.svg', title:'Contact Management', content:'CRM management is comprehensive contact management, allowing businesses to centralize and organize customer information'},
        {img:'/assets/img/services-icon3.svg', title:'Task Management', content:'CRM management is comprehensive contact management, allowing businesses to centralize and organize customer information'},
        {img:'/assets/img/services-icon4.svg', title:'Project Management', content:'CRM management is comprehensive contact management, allowing businesses to centralize and organize customer information'},
        {img:'/assets/img/services-icon5.svg', title:'Email Automation', content:'CRM management is comprehensive contact management, allowing businesses to centralize and organize customer information'},
        {img:'/assets/img/services-icon6.svg', title:'Complete Visibility', content:'CRM management is comprehensive contact management, allowing businesses to centralize and organize customer information'},
      ];


    return (
<section className="position-relative">
      <div className="cs_height_120 cs_height_lg_80"></div>
      <div className="container">
        <div className="cs_section_heading cs_style_1 cs_center_column cs_mb_47 text-center position-relative z-1">
          <div className="cs_section_subtitle cs_fs_18 cs_heading_color cs_mb_22">
            <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   />   
            <span>Our Services</span>
            <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   />   
          </div>
          <h2 className="cs_section_title cs_fs_48 cs_semibold wow fadeInUp">Examining Essential Services</h2>
          <p className="mb-0">CRM management is comprehensive contact management, allowing businesses to centralize <br/> and organize customer information for easy access.</p>
        </div>
        <div className="row cs_row_gap_30 cs_gap_y_30 position-relative z-2">

        {teamContent.map((item, i) => (
          <div key={i} className="col-xl-4 col-md-6">
            <div className="cs_iconbox cs_style_4 cs_radius_15 position-relative overflow-hidden">
              <div className="cs_iconbox_content cs_radius_15 position-relative">
                <div className="cs_iconbox_header cs_mb_17">
                  <span className="cs_iconbox_icon cs_heading_color">
                    <Image src={item.img} alt="img" width={60} height={60}   />  
                  </span>
                  <h3 className="cs_iconbox_title cs_fs_24 cs_semibold mb-0"><Link href="/service/service-details" aria-label="Service details page link">{item.title}</Link></h3>
                </div>
                <div className="cs_iconbox_info">
                  <p className="cs_mb_25">{item.content}</p>
                  <Link href="/service/service-details" aria-label="Service details page link" className="cs_btn cs_style_1 cs_fs_14 cs_bold cs_heading_color text-uppercase">
                  <span>READ MORE</span>
                  <span className="cs_btn_icon"><i className="bi bi-arrow-right"></i></span>
                  </Link>
                </div>
              </div>
              <div className="cs_service_shape position-absolute">
                <Image src="/assets/img/service-shape-2.svg" alt="img" width={323} height={218}   />   
              </div>
            </div>
          </div>
           ))}
         


        </div>
        <div className="cs_service_shape_1 position-absolute start-0 bottom-0">
          <Image src="/assets/img/service-shape-1.svg" alt="img" width={1905} height={1445}   /> 
        </div>
      </div>
      <div className="cs_height_120 cs_height_lg_80"></div>
    </section>
    );
};

export default Services2;