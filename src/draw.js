var Gap = require('./ui').Gap;

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

function addClasses (element, classes) {
  classes.forEach(function (cssClass) {
    element.classList.add(cssClass);
  })
}

function createElement (classes) {
  var element = document.createElement("div");
  addClasses(element, classes);
  return element;
}

function drawer (guiType) {
  var drawers =
    { "Editor":          drawEditor
    , "Gap":             drawGap
    , "Label":           drawLabel
    , "PrimitiveValue":  drawPrimitiveValue
    }
  if (drawers[guiType])
    return drawers[guiType]
  else
    throw "unknown guiType: " + guiType;
}

function drawEditor (editor) {
  var element = document.createElement("div");
  addClasses(element,
    [ "editor"
    , editor.type
    , constructorToClass(editor.constr)
    ]);
  var parts = editor.parts();
  var argIndex = 0;
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] instanceof Gap && editor.args[argIndex])
      draw(element, editor.args[argIndex++])
    else
      draw(element, parts[i]);
  }
  return element;
}

function drawValueGap (type, value) {
  if (type == "Value") {
    var input = document.createElement("span");
    input.setAttribute("contenteditable", "true");
    if (value) input.innerHTML = value;
    addClasses(input, [ "gap", type ]);
    return input;
  }
};

function drawGap (gap) {
  var element = drawValueGap(gap.type) || createElement([ "gap", gap.type ]);
  return element;
}

function drawLabel (label) {
  return document.createTextNode(label.text);
}

function drawPrimitiveValue (primitiveValue) {
  return drawValueGap(primitiveValue.type, primitiveValue.value);
}

function draw (parent, thing) {
  if (thing instanceof Array)
    thing.forEach(function (thingy) {
      draw(parent, thingy);
      parent.appendChild(document.createElement('br'));
    })
  else
    parent.appendChild(
      drawer(thing.constructor.name)(thing)
    );
};

module.exports = draw;
