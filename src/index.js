import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


function MyApp() {
  return <App />
}


ReactDOM.render(<MyApp />, document.getElementById('root'));
registerServiceWorker();


if (module.hot) {
  module.hot.accept('./index.js', () => (
    0
  ));
}