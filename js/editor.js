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


label = function (str) {
  return document.createTextNode(str);
}

addClasses = function (element, classes) {
  classes.forEach(function (cssClass) {
    element.classList.add(cssClass);
  })
}

createElement = function (classes) {
  var element = document.createElement("div");
  addClasses(element, classes);
  return element;
}

GAP = Object(null);


valueGap = function (type) {
  if (type == "Value") {
    var input = document.createElement("input");
    input.type = "text";
    addClasses(input, [ "gap", type ]);
    return input;
  }
};

gap = function (type) {
  return valueGap(type) || createElement([ "gap", type ])
}

pattern = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  return function (argTypes) {
    var result = [];
    var i = 0;
    args.forEach(function (part) {
      if (part === GAP) {
        result.push(gap(argTypes[i]));
        i = i + 1;
      } else {
        result.push(label(part));
      }
    });
    return result;
  }
}

allLang = function (aPattern) {
  return { "de": aPattern
         , "en": aPattern
         };
}

Template =
  { "+": allLang(pattern(GAP, "+", GAP))
  , "Move":
    { "de": pattern("gehe", GAP, "er-Schritt")
    , "en": pattern("move", GAP, "steps")
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
    { "de": pattern("ändere Größe um", GAP)
    , "en": pattern("change size by", GAP)
    }
  , "Round":
    { "de": pattern(GAP, "gerundet")
    , "en": pattern("round", GAP)
    }
  }

editorInsideByConstructor = function (constructor) {
  var argTypes = argTypesByConstructor(constructor);
  return Template[constructor][Lang](argTypes);
};

constructorToClass = function (constructor) {
  var name =
    { "+": "Plus"
    }[constructor] || constructor;
  return "constructor-" + name;
}

editor = function (constructor) {
  var type = typeByConstructor(constructor);
  var inside = editorInsideByConstructor(constructor);

  var element = document.createElement("div");
  addClasses(element,
    [ "editor"
    , type
    , constructorToClass(constructor)
    ]);
  inside.forEach(function (part) {
    element.appendChild(part);
  })
  return element;
}
