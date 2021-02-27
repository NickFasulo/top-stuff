import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import TopGames from './components/TopGames';
import TopMovies from './components/TopMovies';
import GamePlayer from './components/GamePlayer';
import MoviePlayer from './components/MoviePlayer';
import Footer from './components/Footer';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = { data: {}, id: '' };
  }

  handleData = (event, result, id) => {
    this.setState({
      data: result,
      id: id,
    });
    event.preventDefault();
  };

  render() {
    return (
      <Router>
        <div className="App">
          <main>
            <Switch>
              <Route exact path="/">
                <div className="col1">
                  <TopGames handleData={this.handleData} />
                </div>

                <div className="col2">
                  <Link to="/movies">
                    <button type="button" className="movie-button">
                      <span id="emoji-button">&#127871;</span> Movies
                    </button>
                  </Link>
                </div>

                <div className="col3">
                  <GamePlayer data={this.state.data} id={this.state.id} />
                </div>
              </Route>

              <Route path="/movies">
                <div className="col1">
                  <TopMovies handleData={this.handleData} />
                </div>

                <div className="col2">
                  <Link to="/">
                    <button type="button" className="game-button">
                      <span id="emoji-button">&#127918;</span> Games
                    </button>
                  </Link>
                </div>

                <div className="col3">
                  <MoviePlayer data={this.state.data} id={this.state.id} />
                </div>
              </Route>
            </Switch>
          </main>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
