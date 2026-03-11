import BreadCumb from "../../Components/Common/BreadCumb";
import Pricing4 from "../../Components/Pricing/Pricing4";

const page = () => {
  return (
    <div>
            <BreadCumb
                bgimg="/assets/img/page-heading-bg.svg"
                Title="Our Pricing"
            ></BreadCumb>   
            <Pricing4></Pricing4>      
    </div>
  );
};

export default page;