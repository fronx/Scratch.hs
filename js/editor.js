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

function Editor (constructor, args) {
  self = this;

  self.constr = constructor;
  self.type   = types.byConstructor(constructor);

  self.argTypes = function () {
    return types.argTypesByConstructor(self.constr);
  };

  function checkArgs (args, argTypes) {
    for (var i = 0; i < args.length; i = i + 1)
      if (args[i] != null)
        if (args[i].type != argTypes[i])
          throw "argument types don't match: " + args[i] + " is not a " + argTypes[i];
  }

  checkArgs(args, self.argTypes());
  self.args = args;

  self.parts = function () {
    var _parts = template[self.constr][Lang](self.argTypes());
    // fill in values? somehow?
    return _parts;
  };

  // TODO somehow respond to changes to the arguments
};

function editor (constructor) {
  return new Editor(constructor, []);
}




var template = (function () {

  function pattern () {
    var args = Array.prototype.slice.call(arguments, 0);
    return function (argTypes) {
      var result = [];
      var i = 0;
      args.forEach(function (part) {
        if (part instanceof Function) {
          result.push(new part(argTypes[i]));
          i = i + 1;
        } else {
          result.push(new Label(part));
        }
      });
      return result;
    }
  }

  function allLang (aPattern) {
    return { "de": aPattern
           , "en": aPattern
           };
  }

  var Template =
    { "+": allLang(pattern(Gap, "+", Gap))
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

  return Template;

})();




var draw = (function () {

  function constructorToClass (constructor) {
    var name =
      { "+": "Plus"
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
    return(
      { "Editor": drawEditor
      , "Gap":    drawGap
      , "Label":  drawLabel
      }[guiType]);
  }

  function drawEditor (editor) {
    var element = document.createElement("div");
    addClasses(element,
      [ "editor"
      , editor.type
      , constructorToClass(editor.constr)
      ]);
    editor.parts().forEach(function (part) {
      draw(element, part);
    })
    return element;
  }

  function drawValueGap (type) {
    if (type == "Value") {
      var input = document.createElement("input");
      input.type = "text";
      addClasses(input, [ "gap", type ]);
      return input;
    }
  };

  function drawGap (gap) {
    var element = drawValueGap(gap.type) || createElement([ "gap", gap.type ]);
    return element;
  }

  function drawLabel (label) {
    var element = document.createTextNode(label.text);
    return element;
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
  , draw:               draw
  , types:              types
  , forAllConstructors: forAllConstructors
  , init:               init
  , setLanguage:        setLanguage
  });

})();
