var DataStore = {
  getAspects: function (callback) {
    if (!localStorage['aspects']) {
      callback([]);
      return;
    }
    var raw = JSON.parse(localStorage['aspects']);
    callback(this.deserializeAspects(raw));
  },

  deserializeAspects: function(rawAspects) {
    var self = this;
    return rawAspects.map(function(rawAspect) {
      var aspect = new Aspect(rawAspect.title, rawAspect.comment, rawAspect.importance,
                             rawAspect.health);
      aspect.aspects = self.deserializeAspects(rawAspect.aspects);
      return aspect;
    });
  },

  setAspects: function(aspects) {
    localStorage['aspects'] = JSON.stringify(aspects);
  }
}

function Aspect(title, comment, importance, health)
{
  this.title = title;
  this.comment = comment;
  this.importance = importance || 0;
  this.health = health || 5;
  this.aspects = [];
};

var AspectView = React.createClass({
  getInitialState: function() {
    return {editing: !this.props.aspect.title};
  },

  change: function(evt) {
    var value = evt.target.value;
    var key = evt.target.className;
    var aspect = this.props.aspect;
    aspect[key] = value;
    this.setState({aspect: aspect});
  },

  zoom: function() {
    if (this.props.onZoom) {
      this.props.onZoom(this.props.aspect);
    }
  },

  toggle: function() {
    if (this.state.editing && this.props.onChange) {
      this.props.onChange(this.props.aspect);
    }
    this.setState({editing: !this.state.editing});
  },

  render: function() {
    var aspect = this.props.aspect;
    var classes = ['aspect'];
    classes.push('importance-' + aspect.importance);
    classes.push('health-' + aspect.health);
    
    if (this.state.editing) {
      return <div className={classes.join(' ')}>
        <header>
          <i className="fa fa-eye" onClick={this.toggle}></i>
        </header>
        <label>Title:
        <input placeholder="title" className="title" value={aspect.title} onChange={this.change}/>
        </label>
        <label>Comment:
        <textarea placeholder="comment" className="comment" value={aspect.comment} onChange={this.change}/>
        </label>
        <label>Importance:
        <input type="range" className="importance" min="1" max="5" value={aspect.importance} onChange={this.change}/>
        </label>
        <label>Health:
        <input type="range" className="health" min="1" max="5" value={aspect.health} onChange={this.change}/>
        </label>
      </div>;
    } else {
      return <div className={classes.join(' ')}>
        <header>
          {aspect.title}
          <i className="fa fa-pencil-square-o" onClick={this.toggle}></i>
        </header>
        <p>{aspect.comment}</p>
        {aspect.aspects.length ?
        <button onClick={this.zoom}>Zoom</button> 
        : null }
      </div>;
    }
  }
});

var AspectList = React.createClass({
  getInitialState: function() {
    return {
      path: [],
      aspects: this.props.aspects,
      root: this.props.aspects
    }
  },

  zoomIn: function(aspect) {
    var path = this.state.path;
    path.push(this.state.aspects);
    this.setState({
      path: path,
      aspects: aspect.aspects
    })
  },

  zoomOut: function() {
    var path = this.state.path;
    var aspects = path.pop();
    this.setState({path: path, aspects: aspects});
  },

  update: function(aspect) {
    DataStore.setAspects(this.state.root);
    this.setState({aspects: this.state.aspects});
  },

  newAspect: function() {
    var aspects = this.state.aspects;
    var newAspect = new Aspect();
    aspects.push(newAspect);
    this.setState({aspects: aspects});
  },

  componentDidUpdate: function() {
    this.pack();
  },

  componentDidMount: function() {
    this.pack();
  },

  pack: function() {
    new Packery(this.getDOMNode());
  },

  render: function() {
    if (!this.state.aspects) {
      return null;
    }
    var self = this;
    var aspectListView = this.state.aspects.map(function(aspect) {
      return <AspectView aspect={aspect} onZoom={self.zoomIn} onChange={self.update}/>;
    });
    return <div className="aspect-list">
      {this.state.path.length ? 
      <button onClick={this.zoomOut}>Zoom Out</button> 
      : null}
      {aspectListView}
      <i className="fa fa-plus-square" onClick={this.newAspect}/>
    </div>;
  }
});

DataStore.getAspects(function(aspects) {
  React.render(<AspectList aspects={aspects}/>, document.getElementById('aspects'));
});
