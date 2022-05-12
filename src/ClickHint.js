import React from 'react';
class ClickHint extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let classes = 'click-point-hint';
    if (this.props.dismissed) {
      classes += " dismissed";
    }
    return (
      <div
        className={classes}
        aria-hidden={this.props.dismissed}>
        Click a point<br />
        to learn more
      </div>
    )
  }
}

export default ClickHint;
