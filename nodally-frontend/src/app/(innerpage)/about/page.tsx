import BreadCumb from '../../Components/Common/BreadCumb';
import Feature4 from '../../Components/Feature/Feature4';
import Review1 from '../../Components/Review/Review1';
import Analysis1 from '../../Components/Analysis/Analysis1';
import Counter1 from '../../Components/Counter/Counter1';
import Story1 from '../../Components/Story/Story1';
import Testimonial4 from '../../Components/Testimonial/Testimonial4';
import Team1 from '../../Components/Team/Team1';

const page = () => {
  return (
    <div>
            <BreadCumb
                bgimg="/assets/img/page-heading-bg.svg"
                Title="About Us"
            ></BreadCumb> 
            <Feature4></Feature4> 
            <Review1></Review1>
            <Analysis1></Analysis1>    
            <Counter1></Counter1>
            <Story1></Story1>
            <Testimonial4></Testimonial4>
            <Team1></Team1>            
    </div>
  );
};

export default page;