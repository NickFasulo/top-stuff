import React, { Component } from 'react';

class TopGames extends Component {
  constructor() {
    super();
    this.state = { games: [], id: '' };
  }

  componentDidMount() {
    fetch('https://api.rawg.io/api/games?page_size=12')
      .then(res => res.json())
      .then(res => {
        this.setState({
          games: res.results,
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
        <h1 className="game-header">
          Top Twelve Games &nbsp;<span id="emoji-header">&#127918;</span>
        </h1>
        <div className="top-items">
          {this.state.games.map(result => (
            <div
              className="top-item"
              key={result.id}
              onClick={event => {
                this.handleClick(event, result, result.id);
              }}
            >
              <img src={result.background_image} alt="Game Cover" />
              <h4 key={result.id}>{result.name}</h4>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default TopGames;
