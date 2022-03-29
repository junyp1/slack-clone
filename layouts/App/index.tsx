import React, { FC } from 'react';
import loadable from '@loadable/component';
import { Redirect, Route, Switch } from 'react-router';

const LogIn = loadable(() => import('@pages/Login'));
const SignUp = loadable(() => import('@pages/SignUp'));
const Workspace = loadable(() => import('@layouts/Workspace'));

const App: FC = () => {
  return (
    <Switch>
      <Redirect exact path="/" to="/login"></Redirect>
      <Route path="/login" component={LogIn}></Route>
      <Route path="/signup" component={SignUp}></Route>
      <Route path="/workspace/:workspace" component={Workspace}></Route>
    </Switch>
  );
};

export default App;
