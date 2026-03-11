const Counter1 = () => {
    const bgImage = '/assets/img/counter-bg-2.svg';
    return (
    <div className="cs_counter cs_style_1 cs_type_1 cs_accent_bg" style={{ backgroundImage: `url(${bgImage})`}} >
      <div className="container">
        <div className="row cs_gap_y_30">
          <div className="col-lg-3 col-sm-6">
            <div className="cs_numberbox cs_center_column text-center">
              <div className="cs_counter_number cs_fs_48 cs_semibold cs_white_color cs_mb_10">
                <span className="odometer" data-count-to="16"></span>16K+
              </div>
              <p className="cs_fs_24 cs_white_color mb-0">Completed Our <br/> Projects</p>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="cs_numberbox cs_center_column text-center">
              <div className="cs_counter_number cs_fs_48 cs_semibold cs_white_color cs_mb_10">
                <span className="odometer" data-count-to="180"></span>180+
              </div>
              <p className="cs_fs_24 cs_white_color mb-0">Our Expert Support <br/> Team Members</p>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="cs_numberbox cs_center_column text-center">
              <div className="cs_counter_number cs_fs_48 cs_semibold cs_white_color cs_mb_10">
                <span className="odometer" data-count-to="6"></span>6K+
              </div>
              <p className="cs_fs_24 cs_white_color mb-0">Our Worldwide <br/> Clients</p>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="cs_numberbox cs_center_column text-center">
              <div className="cs_counter_number cs_fs_48 cs_semibold cs_white_color cs_mb_10">
                <span className="odometer" data-count-to="35"></span>35+
              </div>
              <p className="cs_fs_24 cs_white_color mb-0">We are Winning <br/> Awards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
};

export default Counter1;