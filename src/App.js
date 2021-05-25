import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import "upkit/dist/style.min.css";
//component
import Home from "./pages/Home";
//redux
import { Provider } from "react-redux";
import store from "./app/store";

//import listener funct
import {listen} from './app/listener';

function App() {

  React.useEffect(() => {
    listen();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/" component={Home} />
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
