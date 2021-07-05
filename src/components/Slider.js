import React from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

function Slider({image1, image2 }) {
  return (
  
                <Carousel>
                    <div>
                        <img src={image1} />
                    </div>
                    <div>
                        <img src={image2} />
                    </div>
                    <div>
                        <img src="https://picsum.photos/700/400?img=3" />
                    </div>
                </Carousel>
            </div>

  )
}

export default Slider;
