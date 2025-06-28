// Set route endpoint as per your environment
// client/src/utils/helper.js
// import { useState, useEffect } from 'react';
// Set route endpoint as per your environment
// client/src/utils/helper.js

// Set route endpoint as per your environment

let _route_endpoint;

if(import.meta.env.PROD) {
  // Use production endpoint
  _route_endpoint = import.meta.env.VITE_PRODUCTION_ROUTE_URL;
}
else {
  // Use local development endpoint
  _route_endpoint = import.meta.env.VITE_LOCAL_DEV_ROUTE_URL;
}

export const route_endpoint = _route_endpoint;

export default route_endpoint;
