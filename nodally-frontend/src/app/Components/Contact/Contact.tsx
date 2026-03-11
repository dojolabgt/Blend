import Image from "next/image";

const Contact = () => {
    const bgImage = '/assets/img/contact-img-1.jpg';
    return (
        <div>
    <section>
      <div className="cs_height_120 cs_height_lg_80"></div>
      <div className="container">
        <div className="row cs_gap_y_30 align-items-center">
          <div className="col-lg-6">
            <div className="cs_contact_desc">
              <ul className="cs_contact_info_list cs_mp_0">
                <li>
                  <div className="cs_iconbox cs_style_6">
                    <span className="cs_iconbox_icon cs_center cs_radius_100 position-relative">
                      <Image src="/assets/img/icons/call.svg" alt="img" width={30} height={30}   />  
                    </span>
                    <div className="cs_iconbox_info">
                      <p className="cs_white_color cs_heading_font cs_mb_4">Call Us 7/24</p>
                      <a href="tel:+2085550112" aria-label="Phone call button" className="cs_fs_24 cs_bold cs_white_color cs_heading_font">+208-555-0112</a>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="cs_iconbox cs_style_6">
                    <span className="cs_iconbox_icon cs_center cs_radius_100 position-relative">
                      <Image src="/assets/img/icons/email.svg" alt="img" width={30} height={30}   />  
                    </span>
                    <div className="cs_iconbox_info">
                      <p className="cs_white_color cs_heading_font cs_mb_4">Make a Quote</p>
                      <a href="mailto:Infotek@gmail.com" aria-label="Phone call button" className="cs_fs_24 cs_bold cs_white_color cs_heading_font">Infotek@gmail.com</a>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="cs_iconbox cs_style_6">
                    <span className="cs_iconbox_icon cs_center cs_radius_100 position-relative">
                      <Image src="/assets/img/icons/location.svg" alt="img" width={32} height={32}   />  
                    </span>
                    <div className="cs_iconbox_info">
                      <p className="cs_white_color cs_heading_font cs_mb_4">Location</p>
                      <p className="cs_fs_24 cs_bold cs_white_color cs_heading_font mb-0">4517 Washington ave.</p>
                    </div>
                  </div>
                </li>
              </ul>
              <a  aria-label="Click to play video" className="cs_video cs_style_1 cs_center cs_video_open cs_bg_filed position-relative"  style={{ backgroundImage: `url(${bgImage})`}} >
              </a>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="cs_contact_form_wrapper">
              <h2 className="cs_fs_36 cs_semibold cs_mb_21">Ready to Get Started?</h2>
              <p className="cs_mb_26">Nullam varius, erat quis iaculis dictum, eros urna varius eros, ut blandit felis odio in turpis. Quisque rhoncus, eros in auctor ultrices,</p>
              <form action="https://api.web3forms.com/submit" method="POST" className="cs_contact_form row cs_gap_y_20" id="cs_form">
                <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />
                <div className="col-sm-6">
                  <label htmlFor="name">Your Name*</label>
                  <input type="text" name="name" id="name" placeholder="Your Name" className="cs_form_field cs_radius_8" />
                </div>
                <div className="col-sm-6">
                  <label htmlFor="email">Your Email*</label>
                  <input type="email" name="email" id="email" placeholder="Email Address" className="cs_form_field cs_radius_8" />
                </div>
                <div className="col-sm-12">
                  <label htmlFor="message">Message*</label>
                  <textarea name="comment" rows={6} id="message" placeholder="Write Message" className="cs_form_field cs_radius_8"></textarea>
                </div>
                <div className="col-md-12">
                  <button type="submit" aria-label="Submit button" className="cs_btn cs_style_1 cs_bg_1 cs_semibold cs_white_color text-capitalize">
                  <span>Send Message</span>
                  <span className="cs_btn_icon"><i className="bi bi-arrow-right"></i></span>
                  </button>
                  <div id="cs_result" className="cs_result"></div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="cs_height_120 cs_height_lg_80"></div>
    </section>
    <div className="cs_location_map">
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d158857.8398865339!2d-0.2664029591612951!3d51.52873980508483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a00baf21de75%3A0x52963a5addd52a99!2sLondon%2C%20UK!5e0!3m2!1sen!2sbd!4v1745143522273!5m2!1sen!2sbd"  loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
    </div>            
        </div>
    );
};

export default Contact;