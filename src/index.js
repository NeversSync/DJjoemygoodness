import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import './styles/boss.css';
import './styles/App.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import PastExperience from './components/PastExperience';

ReactDOM.render(
  <Router>
    <Route exact path='/' component={App}/>
    <Route path='/past-experience' component={PastExperience} />
  </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
