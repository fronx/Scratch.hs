var React     = require('react');
var ui        = require('./ui');
var serialize = require('./serialize');

function constructorToClass (constructor) {
  var name =
    { "+": "Plus"
    , "-": "Minus"
    , "*": "Mult"
    , "/": "Div"
    , "<": "LessThan"
    , "=": "EqualTo"
    , ">": "GreaterThan"
    , "&&": "And"
    , "||": "Or"
    }[constructor] || constructor;
  return "constructor-" + name;
}

var RGap = React.createClass({
  handleChange: function (evt) {
    evt.cancelBubble = true;
    this.props.onUserInput(evt.target.innerText);
  },
  handleDrop: function (evt) {
    evt.cancelBubble = true;
    evt.preventDefault();
    var data = evt.dataTransfer.getData(this.acceptedType());
    evt.dataTransfer.setData('gap', serialize.toJSON(this.props.uiElem));
    this.props.onReplace(serialize.load(data));
    // evt.dataTransfer.clearData(this.acceptedType());
  },
  acceptedType: function () {
    return ('text/json-' + this.props.uiElem.type).toLowerCase();
  },
  handleDragOver: function (evt) {
    if (evt.dataTransfer.types.indexOf(this.acceptedType()) != -1) {
      evt.preventDefault();
      // evt.dataTransfer.dropEffect = 'move';
    }
  },
  componentDidMount: function() {
    this.getDOMNode().addEventListener('input', this.handleChange);
    this.getDOMNode().addEventListener('drop', this.handleDrop);
    this.getDOMNode().addEventListener('dragover', this.handleDragOver);
  },
  componentWillUnmount: function() {
    this.getDOMNode().removeEventListener('input', this.handleChange);
    this.getDOMNode().removeEventListener('drop', this.handleDrop);
    this.getDOMNode().removeEventListener('dragover', this.handleDragOver);
  },
  render: function () {
    var arg = this.props.arg;
    if (!arg || arg.value) {
      if (arg) arg = arg.value;
      return React.DOM.span(
        { contentEditable: this.props.uiElem.type == "Value"
        , className:
            [ "gap"
            , this.props.uiElem.type
            ].join(' ')
        }, arg);
    } else {
      return rclass(arg.constructor.name)(
        { uiElem: arg
        , updateParent: this.props.updateParent
        });
    }
  }
});

var RLabel = React.createClass({
  render: function () {
    return React.DOM.span({}, this.props.uiElem.text);
  }
});

var RPrimitiveValue = RGap;

function rclass (guiType) {
  var drawers =
    { "Array":           RList
    , "Editor":          REditor
    , "Gap":             RGap
    , "Label":           RLabel
    , "PrimitiveValue":  RPrimitiveValue
    }
  if (drawers[guiType])
    return drawers[guiType]
  else
    throw "unknown guiType: " + guiType;
}

var REditor = React.createClass({
  dragType: function () {
    return ('text/json-' + this.props.uiElem.type).toLowerCase();
  },
  handleDragStart: function (evt) {
    evt.stopPropagation();
    // evt.dataTransfer.effectAllowed = 'move';
    var data = serialize.toJSON(this.props.uiElem);
    evt.dataTransfer.setData(this.dragType(), data);
  },
  componentDidMount: function() {
    this.getDOMNode().addEventListener('dragstart', this.handleDragStart);
  },
  componentWillUnmount: function() {
    this.getDOMNode().removeEventListener('dragstart', this.handleDragStart);
  },
  render: function () {
    var editor = this.props.uiElem;
    var elemArgs =
      { className:
          [ "editor"
          , editor.type
          , constructorToClass(editor.constr)
          ].join(' ')
      , draggable: true
      };
    var parts = editor.parts();
    var bodyArgs = [];

    for (var i = 0, gapIndex = -1, arg = null;
         i < parts.length;
         i++)
    {
      var part = parts[i];

      if (part instanceof ui.Gap) {
        gapIndex++;
        if (editor.args[gapIndex] &&
            !(editor.args[gapIndex] instanceof ui.Gap))
          arg = editor.args[gapIndex]
        else
          arg = null;
      }

      var handleChange = function (idx, part, parent) {
        return function (value) {
          if (part instanceof ui.Gap) {
            parent.props.uiElem.setArg(idx, value);
            parent.props.updateParent();
          }
        }
      }(gapIndex, part, this);

      bodyArgs.push(
        rclass(part.constructor.name)(
          { uiElem: part
          , arg: arg
          , onUserInput: handleChange
          , onReplace: handleChange
          , updateParent: this.props.updateParent
          }));
    }
    var args = [ elemArgs ].concat(bodyArgs);
    return React.DOM.div.apply(this, args);
  }
});

var RList = React.createClass({
  getInitialState: function () {
    return this.props;
  },
  handleChange: function () {
    this.setState(this.state);
  },
  render: function () {
    var self = this;
    var children = this.state.uiElem.map(function (item) {
      return rclass(item.constructor.name)(
        { uiElem: item
        , updateParent: self.handleChange
        });
    });
    var args = [ {} ].concat(children);
    return React.DOM.div.apply(this, args);
  }
});

function draw (domElement, thing) {
  var reactElem = rclass(thing.constructor.name)(
                    { uiElem: thing
                    });
  return React.renderComponent(reactElem, domElement);
}

module.exports = draw;
