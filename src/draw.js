var React = require('react');
var ui = require('./ui');

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
  componentDidMount: function() {
    this.getDOMNode().addEventListener('input', this.handleChange);
  },
  componentWillUnmount: function() {
    this.getDOMNode().removeEventListener('input', this.handleChange);
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
        { uiElem: arg }
      );
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
  getInitialState: function () {
    return this.props;
  },
  render: function () {
    var editor = this.state.uiElem;
    var elemArgs =
      { className:
          [ "editor"
          , editor.type
          , constructorToClass(editor.constr)
          ].join(' ')
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
          if (part instanceof ui.Gap)
            parent.state.uiElem.setArg(idx, value)
        }
      }(gapIndex, part, this);

      bodyArgs.push(
        rclass(part.constructor.name)(
          { uiElem: part
          , arg: arg
          , onUserInput: handleChange
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
  render: function () {
    var children = this.state.uiElem.map(function (item) {
      return rclass(item.constructor.name)({ uiElem: item });
    });
    var args = [ {} ].concat(children);
    return React.DOM.div.apply(this, args);
  }
});

function draw (domElement, thing) {
  var reactElem = rclass(thing.constructor.name)(
                    { uiElem: thing });
  return React.renderComponent(reactElem, domElement);
}

module.exports = draw;
