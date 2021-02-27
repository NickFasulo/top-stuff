import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import { dateFormatter } from '../utils/dateFormatter';

class GamePlayer extends Component {
  constructor() {
    super();
    this.state = {
      description: '',
      id: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      fetch(
        `https://api.rawg.io/api/games/${this.props.id}`
      )
        .then(res => res.json())
        .then(res => {
          this.setState({
            description: res.description_raw,
          });
        })
        .catch(err => alert(err));
    }
  }

  render() {
    return (
      <>
        {this.props.data.clip !== undefined ? (
          <div className="preview-header">
            <h1 className="game-header">{this.props.data.name}</h1>
            <div className="player">
              <ReactPlayer
                url={this.props.data.clip.clip}
                width="100%"
                style={{ outline: 'none' }}
                volume={.1}
                controls
                playing
                loop
              />
              <div className="player-details">
                <div className="ratings">
                  <h3 className="game-header2">
                    Metacritic Score: &nbsp;{this.props.data.metacritic}
                  </h3>
                  <h3 className="game-header2">
                    User Rating: &nbsp;
                    {Math.round(this.props.data.rating * 10) / 10} / 5
                  </h3>
                </div>
                <div className="game-release-date">
                  <p>Released: {dateFormatter(this.props.data.released)}</p>
                </div>
                <p className="game-description">
                  &nbsp; &nbsp; {this.state.description}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="preview-header">
            <h1 className="game-header" style={{ visibility: 'hidden' }}>
              Title
            </h1>
            <div className="player-preview">
              <h1 className="game-header">
                &larr; Click on a game to see preview
              </h1>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default GamePlayer;
