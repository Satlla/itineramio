import { useState } from 'react';
import ReactMapGl from 'react-map-gl';




function Map() {

  const [viewport, setViewport] = useState({

    latitude: 45.323,
    longitude: -74,
    zoom: 11,
  });

  return (
    <ReactMapGl

    width="100%"
    height="100%"
    mapStyle='mapbox://style s/satlla/ckvjw0oxq39va14oagd14izip'
    mapboxApiAccessToken='pk.eyJ1Ijoic2F0bGxhIiwiYSI6ImNrdmp2eTQ2NjBxY2YybnRrMnRjZGhuYXAifQ.7UClYZRxlmVaHd3pulNH5g'
    {...viewport}
    onViewportChange={nextViewport => setViewport(nextViewport)}
    >
    </ReactMapGl>
  )
}

export default Map
