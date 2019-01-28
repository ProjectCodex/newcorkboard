import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Redirect, Link } from 'react-router-dom';
import './App.css';

const PrivateRoute = ({component: Component, user, ...rest}) => (
  <Route {...rest} render={
    props => user
      ? <Component {...props} {...rest} user={user} />
      : <Redirect to={ {pathname: '/login', state: {from: props.location} } }/>
  } />
);

const Loading = props => (
  <React.Fragment>
    {
      props.user
      ? <h1>Loading</h1>
      : props.children
    }
  </React.Fragment>
);

// demo component
const Login = props => (
  <React.Fragment>
    {props.user
    ? <h3>Welcome back {props.user.firstName}</h3>
    : <a href="http://localhost:3001/auth/google"><button>Click here to sign in</button></a>}
  </React.Fragment>
);

// demo component
const Dashboard = () => (
  <h3>Protected Content</h3>
);

// demo component
const Home = () => (
  <div>
    <Link to="/login">Login Page</Link>
    <Link to="/dashboard">User Dashboard</Link>
  </div>
);

class App extends Component {
  constructor(props) {
    super(props);
    // console.log(props);
    this.state = {
      user: null,
      loading: true
    }
  }

  componentDidMount() {
    fetch('/api/me')
    .then(res => res.json())
    .then(res => {
      console.log(res);
      if (res.error) {
        this.setState({
          loading: false
        })
      } else {
        this.setState({
          loading: false,
          user: res.user
        })
      }
    })
    // .catch(err => console.log(err));
  }

  render() {
    return (
      <Loading user={this.state.loading}>
          <Router>
            <div className="App">
              <header>
                {
                  this.state.user
                  ? <React.Fragment>
                    <h3>Welcome {this.state.user.firstName}</h3>
                    <a href="http://localhost:3001/auth/logout"><button>Logout?</button></a>
                  </React.Fragment>
                  : <a href="http://localhost:3001/auth/google"><button>Login</button></a>
                }
              </header>
                <Route exact path="/" component={Home} />
                <Route exact path="/login" render={(props)=> <Login {...props} user={this.state.user} />} />
                <PrivateRoute user={this.state.user} exact path='/dashboard' component={Dashboard}/>
            </div>
          </Router>
      </Loading>
    );
  }
}

export default App;
