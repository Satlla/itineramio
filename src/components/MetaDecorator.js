import React from 'react'
import Helmet from "react-helmet";
import PropTypes from 'prop-types';

function MetaDecorator ({title, description,image}) {
  return (
    <Helmet>
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:url" content={window.location.pathname+window.location.search} />

    </Helmet>

  );
};


export default MetaDecorator;

MetaDecorator.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired
}
