import Image from "next/image";
import Link from "next/link";

const Blog5 = () => {

        const blogContent = [
        {img:'/assets/img/post-img-1.jpg', title:'How to Comprehensive at SaaS Developments', category:'Development'},
        {img:'/assets/img/post-img-2.jpg', title:'6 Essential Tips for Big Commerce Stores', category:'Technology'},
        {img:'/assets/img/post-img-3.jpg', title:'Empowering Startups & Small Businesses', category:'Marketing'},
        {img:'/assets/img/post-img-4.jpg', title:'How to Comprehensive at SaaS Developments', category:'Development'},
        {img:'/assets/img/post-img-5.jpg', title:'6 Essential Tips for Big Commerce Stores', category:'Development'},
        {img:'/assets/img/post-img-6.jpg', title:'Empowering Startups & Small Businesses', category:'Development'},
      ];

    return (
        <div>
    <div className="cs_height_120 cs_height_lg_80"></div>
        <div className="container">
        <div className="row cs_row_gap_30 cs_gap_y_30">
                {blogContent.map((item, i) => (
                    <div key={i} className="col-lg-4 col-md-6">
                    <article className="cs_post cs_style_1 cs_radius_20">
                    <Link href="/blog/blog-details" aria-label="Reading details post link" className="cs_post_thumbnail cs_mb_15 position-relative overflow-hidden">
                    <Image src={item.img} alt="img" width={378} height={264}   />   
                    <span className="cs_post_category cs_heading_bg cs_fs_14 cs_medium cs_white_color position-absolute">{item.category}</span>
                    </Link>
                    <div className="cs_post_content">
                    <div className="cs_post_meta_wrapper cs_mb_12">
                    <div className="cs_post_meta">
                    <span><i className="bi bi-person"></i></span>
                    <span>Adam Smith</span>
                    </div>
                    <div className="cs_post_meta">
                    <span><i className="bi bi-calendar-check-fill"></i></span>
                    <span>11 Jan, 2025</span>
                    </div>
                    </div>
                    <h3 className="cs_post_title cs_fs_24 cs_semibold cs_mb_13"><Link href="/blog/blog-details" aria-label="Reading details post link">{item.title}</Link></h3>
                    <Link href="/blog/blog-details" aria-label="Reading details post link" className="cs_post_btn cs_heading_color">
                    <span>Learn More</span>
                    <span>
                    <i className="bi bi-arrow-right"></i>
                    </span>
                    </Link>
                    </div>
                    </article>
                    </div>
                 ))}


        </div>

        </div>
        <div className="cs_height_120 cs_height_lg_80"></div>           
        </div>
    );
};

export default Blog5;