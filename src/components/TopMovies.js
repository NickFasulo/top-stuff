import React, { Component } from 'react';

class TopMovies extends Component {
  constructor() {
    super();
    this.state = { movies: [], id: '' };
  }

  componentDidMount() {
    fetch(
      `http://api.themoviedb.org/3/movie/popular?api_key=${process.env.REACT_APP_API_KEY}`
    )
      .then(res => res.json())
      .then(res => {
        this.setState({
          movies: res.results,
        });
      })
      .catch(err => alert(err));
  }

  handleClick = (event, result, id) => {
    this.props.handleData(event, result, id);
  };

  render() {
    return (
      <div className="top-header">
        <h1 className="movie-header">
          Top Twelve Movies &nbsp;<span id="emoji-header">&#127871;</span>
        </h1>
        <div className="top-items">
          {this.state.movies.slice(0, 12).map(result => (
            <div
              className="top-item"
              key={result.id}
              onClick={event => {
                this.handleClick(event, result, result.id);
              }}
            >
              <img
                src={
                  'http://image.tmdb.org/t/p/original' +
                  (result.backdrop_path || result.poster_path)
                }
                alt="Movie Cover"
              />
              <h4 key={result.id}>{result.title}</h4>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default TopMovies;
