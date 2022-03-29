import App from '@layouts/App';
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.querySelector('#app'),
);
