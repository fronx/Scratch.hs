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
  render: function () {
    var editor = this.props.uiElem;
    var elemArgs =
      { className:
          [ "editor"
          , editor.type
          , constructorToClass(editor.constr)
          ].join(' ')
      };
    var parts = editor.parts();
    var bodyArgs = [];
    var argIndex = 0;
    var arg = null;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] instanceof ui.Gap && editor.args[argIndex] && !(editor.args[argIndex] instanceof ui.Gap))
        arg = editor.args[argIndex++]
      else
        arg = null;

      bodyArgs.push(
        rclass(parts[i].constructor.name)(
          { uiElem: parts[i]
          , arg: arg
          }));
    }
    var args = [ elemArgs ].concat(bodyArgs);
    return React.DOM.div.apply(this, args);
  }
});

var RList = React.createClass({
  render: function () {
    var items = this.props.uiElem;
    var children = items.map(function (item) {
      return rclass(item.constructor.name)({ uiElem: item });
    });
    var args = [ {} ].concat(children);
    return React.DOM.div.apply(this, args);
  }
});

function draw (domElement, thing) {
  React.renderComponent(
    rclass(thing.constructor.name)({ uiElem: thing }),
    domElement);
}

module.exports = draw;
