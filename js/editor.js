function forwarder (obj) {
  return function (key) {
    return obj[key];
  };
}

Lang = "en";

Types =
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

typeByConstructor = forwarder((function (types) {
  var result = {};
  for (var type in types) {
    types[type].forEach(function (constructor) {
      result[constructor[0]] = type;
    });
  }
  return result;
})(Types));

argTypesByConstructor = forwarder((function (types) {
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

Template =
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

function constructorToClass (constructor) {
  var name =
    { "+": "Plus"
    }[constructor] || constructor;
  return "constructor-" + name;
}

function checkArgs (args, argTypes) {
  for (var i = 0; i < args.length; i = i + 1)
    if (args[i] != null)
      if (args[i].type != argTypes[i])
        throw "argument types don't match: " + args[i] + " is not a " + argTypes[i];
}

function PartialValue (constructor, args) {
  this.constr = constructor;
  this.type   = typeByConstructor(constructor);

  checkArgs(args, argTypesByConstructor(constructor));
  this.args = args;
}

function Editor (partialValue) {
  self = this;
  self.constr = partialValue.constr;
  self.type   = partialValue.type;
  self.args   = partialValue.args;

  self.argTypes = function () {
    return argTypesByConstructor(self.constr);
  };

  self.parts = function () {
    var _parts = Template[self.constr][Lang](self.argTypes());
    // fill in values? somehow?
    return _parts;
  };
};

function editor (constructor) {
  return new Editor(
           new PartialValue(constructor, [])
         );
}



// Drawing

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

function drawer (thing) {
  var drawers =
    { "Editor": drawEditor
    , "Gap":    drawGap
    , "Label":  drawLabel
    }
  if (thing != undefined)
    return drawers[thing.constructor.name];
}

function draw (parent, thing) {
  parent.appendChild(drawer(thing)(thing));
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

document.addEventListener("changedLang", function (e) {
  // document.getElementByClass("editor").forEach(redraw);
})
