import BreadCumb from "../../Components/Common/BreadCumb";
import Toolset1 from "../../Components/Toolset/Toolset1";

const page = () => {
  return (
    <div>
            <BreadCumb
                bgimg="/assets/img/page-heading-bg.svg"
                Title="Integrations"
            ></BreadCumb>
            <Toolset1></Toolset1>      
    </div>
  );
};

export default page;