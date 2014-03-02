Scratch = (function () {

function forwarder (obj) {
  return function (key) {
    return obj[key];
  };
}

var Lang = "en";

var types = (function () {

  var Defs =
    { "Value":
      [ [ "+", [ "Value", "Value" ] ]
      , [ "-", [ "Value", "Value" ] ]
      , [ "*", [ "Value", "Value" ] ]
      , [ "/", [ "Value", "Value" ] ]
      , [ "Round", [ "Value" ] ]
      ]

    , "Block":
      [ // Motion
        [ "Move", [ "Value" ] ]
      , // Looks
        [ "Show", [] ]
      , [ "Hide", [] ]
      , [ "ChangeSizeBy", [ "Value" ] ]
      ]

    , "Condition":
      [ [ "<", [ "Value", "Value" ] ]
      , [ "=", [ "Value", "Value" ] ]
      , [ ">", [ "Value", "Value" ] ]
      , [ "&&", [ "Condition", "Condition" ] ]
      , [ "||", [ "Condition", "Condition" ] ]
      , [ "Not", [ "Condition" ] ]
      ]
    };

  var ByConstructor = {};
  var ArgTypesByConstructor = {};

  for (var type in Defs) {
    Defs[type].forEach(function (constructor) {
      ByConstructor[        constructor[0]] = type;
      ArgTypesByConstructor[constructor[0]] = constructor[1];
    });
  }

  return(
    { defs: Defs
    , byConstructor: forwarder(ByConstructor)
    , argTypesByConstructor: forwarder(ArgTypesByConstructor)
    });

})();




function Label (text) {
  this.text = text;
}

function Gap (type) {
  this.type = type;
}

function gap (type) {
  return new Gap(type);
}

function PrimitiveValue (value) {
  this.type = "Value";
  this.value = value;
}

function Editor (constructor, args) {
  var self = this;

  self.constr = constructor;
  self.type   = types.byConstructor(constructor);

  self.argTypes = function () {
    return types.argTypesByConstructor(self.constr);
  };

  function checkArgs (args, argTypes) {
    for (var i = 0; i < args.length; i++)
      if (args[i] != null) {
        if (args[i].type == undefined)
          args[i] = new PrimitiveValue(args[i]);

        if (args[i].type != argTypes[i])
          throw "argument types don't match: " + args[i] + " is a " + args[i].type + " and not a " + argTypes[i];
      }
  }

  checkArgs(args, self.argTypes());
  self.args = args;

  self.parts = function () {
    var templ = template(self.constr)[Lang](self.argTypes());
    return templ;
  };

  // TODO somehow respond to changes to the arguments
};

function editor (constructor, args) {
  var args = args || [];
  return new Editor(constructor, args);
}




var template = (function () {

  function pattern () {
    var args = Array.prototype.slice.call(arguments, 0);
    return function (argTypes) {
      var result = [];
      var i = 0;
      args.forEach(function (part) {
        if (part instanceof Function)
          result.push(new part(argTypes[i++]))
        else
          result.push(new Label(part));
      });
      return result;
    }
  }

  function allLang (aPattern) {
    return { "de": aPattern
           , "en": aPattern
           };
  }

  function operator (op) {
    return allLang(pattern(Gap, op, Gap));
  }

  var Template =
    { "+":  operator("+")
    , "-":  operator("-")
    , "*":  operator("*")
    , "/":  operator("/")
    , "<":  operator("<")
    , "=":  operator("=")
    , ">":  operator(">")
    , "&&":
      { "de": pattern(Gap, "und", Gap)
      , "en": pattern(Gap, "and", Gap)
      }
    , "||":
      { "de": pattern(Gap, "oder", Gap)
      , "en": pattern(Gap, "or", Gap)
      }
    , "Not":
      { "de": pattern("nicht", Gap)
      , "en": pattern("not", Gap)
      }
    , "Move":
      { "de": pattern("gehe", Gap, "er-Schritt")
      , "en": pattern("move", Gap, "steps")
      }
    , "Show":
      { "de": pattern("zeige dich")
      , "en": pattern("show")
      }
    , "Hide":
      { "de": pattern("verstecke dich")
      , "en": pattern("hide")
      }
    , "ChangeSizeBy":
      { "de": pattern("ändere Größe um", Gap)
      , "en": pattern("change size by", Gap)
      }
    , "Round":
      { "de": pattern(Gap, "gerundet")
      , "en": pattern("round", Gap)
      }
    }

  function template (constr) {
    var templ = Template[constr];
    if (templ)
      return templ
    else
      throw "template missing for constructor " + constr;
  }

  return template;

})();




var draw = (function () {

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
    parent.appendChild(
      drawer(thing.constructor.name)(thing)
    );
  };

  return draw;

})();



// Behavior

function setLanguage (lang) {
  Lang = lang;
  var event = new CustomEvent(
    "changedLang",
    {
      detail: { lang: lang },
      bubbles: true,
      cancelable: true
    }
  );
  document.dispatchEvent(event);
}


function forAllTypes (fn) {
  for (type in types.defs) fn(type);
}

function forAllConstructors (fn) {
  forAllTypes(function (type) {
    types.defs[type].forEach(fn);
  });
}

function init (element, fn) {
  document.addEventListener("changedLang", function (e) {
    console.log(e);
    // document.getElementByClass("editor").forEach(redraw);
  });

  forAllConstructors(function(constr) {
    draw(element, editor(constr[0]));
    if (fn) fn(element);
  });
};



return(
  { editor:             editor
  , gap:                gap
  , draw:               draw
  , types:              types
  , forAllConstructors: forAllConstructors
  , init:               init
  , setLanguage:        setLanguage
  });

})();
