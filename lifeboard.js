var dataStore = {
  getAspects: function () {
    var raw = JSON.parse(localStorage['aspects']);
    return this.deserializeAspects(raw);
  },

  deserializeAspects: function(rawAspects) {
    var aspects = [];
    var self = this;
    rawAspects.forEach(function(rawAspect) {
      var aspect = new Aspect(rawAspect.title, rawAspect.comment, rawAspect.importance,
                             rawAspect.health);
      aspect.aspects = self.deserializeAspects(rawAspect.aspects);
    });
    return aspects;
  },

  setAspects: function(aspects) {
    localStorage['aspects'] = JSON.stringify(aspects);
  },
}

function Aspect(title, comment, importance, health)
{
  this.title = title;
  this.comment = comment;
  this.importance = importance || 0;
  this.health = health || 100;
  this.aspects = [];
};

var AspectView = React.createClass({
  getInitialState: function() {
    return {editing: false};
  },

  render: function() {
    var aspect = this.props.aspect;
    var classes = ['aspect'];
    
    if (this.state.editing) {
      return <div className="aspect">
        
    }
  }
});
