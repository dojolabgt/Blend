import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Blog2 = () => {

        const blogContent = [
        {img:'/assets/img/post-img-7.jpg', title:'Blind users are used to test websites and apps.', category:'Development'},
        {img:'/assets/img/post-img-8.jpg', title:'Gatsby Headaches was written by Juan Diego Rodríguez.', category:'Technology'},
        {img:'/assets/img/post-img-9.jpg', title:'How To Build Server was written by Sriram Thiagarajan.', category:'Marketing'},
      ];

    return (
<section className="cs_gray_bg_2">
      <div className="cs_height_120 cs_height_lg_80"></div>
      <div className="container">
        <div className="cs_section_heading cs_style_1 cs_mb_40 text-center">
          <div className="cs_section_subtitle cs_fs_18 cs_heading_color cs_mb_22">
            <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   />  
            <span>Blog & Articles</span>
            <Image src="/assets/img/icons/star-1.svg" alt="img" width={15} height={15}   />  
          </div>
          <h2 className="cs_section_title cs_fs_48 cs_semibold mb-0 wow fadeInUp">Our Latest News and Articles</h2>
        </div>
        <div className="row cs_row_gap_30 cs_gap_y_30">
            {blogContent.map((item, i) => (
          <div key={i} className="col-lg-4">
            <article className="cs_post cs_style_2 cs_radius_20">
              <Link href="/blog/blog-details" aria-label="Reading details post link" className="cs_post_thumbnail cs_radius_20 cs_mb_15 position-relative overflow-hidden">
              <Image src={item.img} alt="img" width={412} height={298}   />  
              </Link>
              <div className="cs_post_content">
                <div className="cs_post_meta_wrapper cs_mb_18">
                  <div className="cs_post_meta cs_fs_14 cs_medium text-uppercase">
                    <span>{item.category}</span>
                  </div>
                  <div className="cs_post_meta cs_fs_14">
                    <span>June 20, 2025</span>
                  </div>
                </div>
                <h3 className="cs_post_title cs_fs_24 cs_semibold cs_mb_19"><Link href="/blog/blog-details" aria-label="Reading details post link">{item.title}</Link></h3>
                <div className="cs_post_btn_wrapper">
                  <Link href="/blog/blog-details" aria-label="Reading details post link" className="cs_post_btn cs_fs_14 cs_black text-uppercase">
                  <span>Read More</span>
                  <span> <i className="bi bi-arrow-right"></i></span>
                  </Link>
                </div>
              </div>
            </article>
          </div>
            ))}


        </div>
      </div>
      <div className="cs_height_120 cs_height_lg_80"></div>
    </section>
    );
};

export default Blog2;