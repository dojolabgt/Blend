"use client"
import Link from "next/link";
import { useState } from "react";

const Project1 = () => {

      const projectContent = [
        {img:'/assets/img/project-img-1.jpg', title:'Landing Page Design', category:'App'},
        {img:'/assets/img/project-img-2.jpg', title:'Mobile App Design', category:'Branding'},
        {img:'/assets/img/project-img-3.jpg', title:'Business Page Design', category:'Development'},
        {img:'/assets/img/project-img-4.jpg', title:'Portfolio App Design', category:'Design'},
        {img:'/assets/img/project-img-5.jpg', title:'Landing Page Design', category:'Design'},
        {img:'/assets/img/project-img-6.jpg', title:'Blog Webpage Design', category:'Development'},
        {img:'/assets/img/project-img-7.jpg', title:'Brand Promoting', category:'Branding'},
        {img:'/assets/img/project-img-8.jpg', title:'Admin Page Design', category:'App'},        
      ];

      const categoryMenu = [
        {
          title: 'App',
          category: 'App',
        },
        {
          title: 'Branding',
          category: 'Branding',
        },
        {
          title: 'Development',
          category: 'Development',
        },
        {
          title: 'Design',
          category: 'Design',
        },
      ];

      const [active, setActive] = useState('all');

    return (
    <section>
      <div className="cs_height_120 cs_height_lg_80"></div>
      <div className="container cs_projects_wrapper">
          <div className=" case-study-bg">
            <div className="cs_isotop_filter cs_style_1 cs_center">
              <ul className="cs_fs_18 cs_heading_font cs_mp_0">
                <li className={active === 'all' ? 'active' : ''} onClick={() => setActive('all')} ><a href="#" data-filter="*">See All</a></li>
                {categoryMenu.map((item, index) => (
                <li onClick={() => setActive(item.category)} className={active === item.category ? 'active' : ''} key={index}><a href="#" data-filter=".app-design">{item.title}</a></li>
              ))}
              </ul>
            </div>
            <div className="cs_isotop row  cs_has_gutter_30">
              {projectContent.map((item, i) => (
              <div  key={i} className={`cs_isotop_item col-lg-3  ${ active === 'all' ? '' : !(active === item.category) ? 'd-none' : '' }`} >
                <div className="cs_project_item cs_radius_10 position-relative">
                  <img src={item.img} alt="Post image" />
                  <div className="cs_project_info cs_radius_5 position-absolute">
                    <h3 className="cs_fs_24 cs_semibold cs_mb_6"><Link href="/project/project-details">{item.title}</Link></h3>
                    <Link href="/project/project-details" className="cs_project_btn cs_fs_18 cs_theme_color_2">View Project</Link>
                  </div>
                </div>
              </div>
              ))}

            </div>
        </div>

      </div>
      <div className="cs_height_120 cs_height_lg_80"></div>
    </section>
    );
};

export default Project1;