import React, { Component } from 'react';
import ReactPlayer from 'react-player';
import { dateFormatter } from '../utils/dateFormatter';

class MoviePlayer extends Component {
  constructor() {
    super();
    this.state = { preview: '' };
  }

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      fetch(
        `http://api.themoviedb.org/3/movie/${this.props.id}/videos?api_key=${REACT_APP_API_KEY}`
      )
        .then(res => res.json())
        .then(res => {
          this.setState({
            preview: res.results[0].key,
          });
        })
        .catch(err => alert(err));
    }
  }

  render() {
    return (
      <>
        {this.props.data.release_date !== undefined ? (
          <div className="preview-header">
            <h1 className="movie-header">{this.props.data.title}</h1>
            <div className="player">
              <ReactPlayer
                url={'https://www.youtube.com/watch?v=' + this.state.preview}
                width="100%"
                style={{ outline: 'none' }}
                volume={0.25}
                controls
                playing
              />
              <div className="player-details">
                <div className="ratings">
                  <h3 className="movie-header2">
                    Released: &nbsp;
                    {dateFormatter(this.props.data.release_date)}
                  </h3>
                  <h3 className="movie-header2">
                    Rating: &nbsp;{this.props.data.vote_average} / 10
                  </h3>
                </div>
                <p className="movie-description">
                  &nbsp; &nbsp; {this.props.data.overview}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="preview-header">
            <h1 className="movie-header" style={{ visibility: 'hidden' }}>
              Title
            </h1>
            <div className="player-preview">
              <h1 className="movie-header">
                &larr; Click on a movie to see preview
              </h1>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default MoviePlayer;
