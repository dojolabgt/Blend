import BreadCumb from "../../Components/Common/BreadCumb";
import Project1 from "../../Components/Project/Project1";

const page = () => {
  return (
    <div>
            <BreadCumb
                bgimg="/assets/img/page-heading-bg.svg"
                Title="Our Projects"
            ></BreadCumb>     
            <Project1></Project1>        
    </div>
  );
};

export default page;