import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Toolset1 = () => {

    const brandContent = [
        {img:'/assets/img/icons/slack.svg', title:'Slack'},
        {img:'/assets/img/icons/dropbox.svg', title:'Dropbox'},
        {img:'/assets/img/icons/linkedin.svg', title:'LinkedIn'},
        {img:'/assets/img/icons/hubspot.svg', title:'Hubspot'},
        {img:'/assets/img/icons/whatsapp.svg', title:'Whatsapp'},
        {img:'/assets/img/icons/discord.svg', title:'Discord'},
        {img:'/assets/img/icons/zoom.svg', title:'Zoom'},
        {img:'/assets/img/icons/github.svg', title:'Github'},
        {img:'/assets/img/icons/mailchip.svg', title:'Mailchimp'},
        {img:'/assets/img/icons/shopify.svg', title:'Shopify'},
        {img:'/assets/img/icons/googledrive.svg', title:'Google Drive'},
        {img:'/assets/img/icons/notion.svg', title:'Notion'},
      ];

    return (
 <section className="cs_gray_bg_2">
      <div className="cs_height_120 cs_height_lg_80"></div>
      <div className="container">
        <div className="cs_toolset_content cs_center_column position-relative">
          <div className="cs_toolset_logos">
            {brandContent.map((item, i) => (
            <div key={i} className="cs_iconbox cs_style_3 cs_center_column cs_white_bg cs_radius_16 text-center">
              <span className="cs_iconbox_icon cs_mb_14">
                <Image src={item.img} alt="img" width={49} height={49}   /> 
              </span>
              <p className="cs_medium mb-0">{item.title}</p>
            </div>
            ))}

          </div>
          <div className="cs_toolset_text text-center">
            <div className="cs_section_heading cs_style_1 cs_mb_20">
              <div className="cs_section_subtitle cs_fs_18 cs_heading_color cs_mb_22">
                <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   /> 
                <span>Our Toolset</span>
                <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   /> 
              </div>
              <h2 className="cs_section_title cs_fs_48 cs_semibold text-capitalize mb-0 wow fadeInUp">Technologies Behind Our Solutions.</h2>
            </div>
            <p className="cs_card_desc cs_mb_51">All the generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet.</p>
            <Link href="/integrations" aria-label="Integrations page link" className="cs_btn cs_style_1 cs_bg_1 cs_fs_14 cs_bold cs_white_color text-uppercase">
            <span>See all integrations</span>
            <span className="cs_btn_icon"><i className="bi bi-arrow-right"></i></span>
            </Link>
          </div>
        </div>
      </div>
      <div className="cs_height_120 cs_height_lg_80"></div>
    </section>
    );
};

export default Toolset1;