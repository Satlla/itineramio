import React from 'react'
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';

function Faq({faq, index, toggleFAQ}) {
  return (
		<div
			className={"faq " + (faq.open ? 'open' : '')}
			key={index}
			onClick={() => toggleFAQ(index)}
		>
			<div className="faq-question">
				{faq.question}
        <div>
          <p className="distance">{faq.distance}</p>
        </div>

			</div>
			<div className="faq-answer">
				{faq.answer}


			</div>
		</div>
	)
}

export default Faq
