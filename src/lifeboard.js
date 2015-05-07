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
      var aspect = new Aspect(rawAspect);
      aspect.aspects = self.deserializeAspects(rawAspect.aspects);
      return aspect;
    });
  },

  setAspects: function(aspects) {
    localStorage['aspects'] = JSON.stringify(aspects);
  }
}

function Aspect(raw)
{
  raw = raw || {};
  this.title = raw.title;
  this.comment = raw.comment;
  this.importance = raw.importance || 1;
  this.concern = raw.concern || 1;
  this.deleted = raw.deleted || false;
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

  delete: function() {
    this.props.aspect.deleted = !this.props.aspect.deleted;
    this.props.onChange(this.props.aspect);
  },

  maybeToggle: function(evt) {
    if (evt.keyCode == 13 && evt.ctrlKey) {
      this.toggle();
    }
  },

  render: function() {
    var aspect = this.props.aspect;
    var classes = ['aspect'];
    classes.push('importance-' + aspect.importance);
    classes.push('concern-' + aspect.concern);
    
    if (this.state.editing) {
      return <div className={classes.join(' ')} onKeyUp={this.maybeToggle}>
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
        <label>Concern:
        <input type="range" className="concern" min="1" max="5" value={aspect.concern} onChange={this.change}/>
        </label>
      </div>;
    } else {
      return <div className={classes.join(' ')} onDoubleClick={this.zoom}>
        <header>
          {aspect.title} ({aspect.aspects.length})
          <i className="fa fa-search-plus" onClick={this.zoom}></i> 
          <i className="fa fa-pencil-square-o" onClick={this.toggle}></i>
          <i className="fa fa-trash" onClick={this.delete}></i>
        </header>
        <p>{aspect.comment}</p>
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
    new Packery(document.querySelector('.aspect-list'));
  },

  filter: function(aspect) {
    return this.state.showDeleted || !aspect.deleted;
  },

  keyUp: function(evt) {
    if (evt.keyCode == 78 && evt.altKey) {
      this.newAspect();
    }
  },

  render: function() {
    if (!this.state.aspects) {
      return null;
    }
    var self = this;
    var filtered = this.state.aspects.filter(this.filter);
    var aspectListView = filtered.map(function(aspect) {
      return <AspectView aspect={aspect} onZoom={self.zoomIn} onChange={self.update}/>;
    });
    return <div onKeyUp={this.keyUp}>
      <i className="fa fa-plus-circle" onClick={this.newAspect}/>
      {this.state.path.length ? 
      <i className="fa fa-search-minus" onClick={this.zoomOut}></i> 
      : null}
      <div className="aspect-list">
        {aspectListView}
      </div>
    </div>;
  }
});

DataStore.getAspects(function(aspects) {
  React.render(<AspectList aspects={aspects}/>, document.getElementById('aspects'));
});
