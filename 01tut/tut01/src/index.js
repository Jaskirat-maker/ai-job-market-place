import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// this is because we are using app.js file and have created the separed style css file
// for the each component 
//  then imported  the file of the css in this 

import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
 // document.getElementById('root')
);


