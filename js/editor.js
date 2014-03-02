Scratch = (function () {

function forwarder (obj) {
  return function (key) {
    return obj[key];
  };
}

var Lang = "en";

var Types =
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

var typeByConstructor = forwarder((function (types) {
  var result = {};
  for (var type in types) {
    types[type].forEach(function (constructor) {
      result[constructor[0]] = type;
    });
  }
  return result;
})(Types));

var argTypesByConstructor = forwarder((function (types) {
  var result = {};
  for (var type in types) {
    types[type].forEach(function (constructor) {
      result[constructor[0]] = constructor[1];
    });
  }
  return result;
})(Types));


function Label (text) {
  this.text = text;
}

function Gap (type) {
  this.type = type;
}

function Editor (constructor, args) {
  self = this;

  self.constr = constructor;
  self.type   = typeByConstructor(constructor);

  self.argTypes = function () {
    return argTypesByConstructor(self.constr);
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
    var _parts = Template[self.constr][Lang](self.argTypes());
    // fill in values? somehow?
    return _parts;
  };

  // TODO somehow respond to changes to the arguments
};

function editor (constructor) {
  return new Editor(constructor, []);
}



// Templating

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




// Drawing

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

function draw (parent, thing) {
  parent.appendChild(
    drawer(thing.constructor.name)(thing)
  );
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
  for (type in Types) fn(type);
}

function forAllConstructors (fn) {
  forAllTypes(function (type) {
    Types[type].forEach(fn);
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
  , types:              Types
  , forAllConstructors: forAllConstructors
  , init:               init
  , setLanguage:        setLanguage
  });

})();
