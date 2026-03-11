import BreadCumb from '../../Components/Common/BreadCumb';
import Contact from '../../Components/Contact/Contact';

const page = () => {
  return (
    <div>
            <BreadCumb
                bgimg="/assets/img/page-heading-bg.svg"
                Title="Contact Us"
            ></BreadCumb>  
            <Contact></Contact>       
    </div>
  );
};

export default page;