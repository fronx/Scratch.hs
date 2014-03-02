function forwarder (obj) {
  return function (key) {
    return obj[key];
  };
}

Lang = "en";

Types =
  { "Value":
    [ [ "Num", [ "Double" ] ]
    , [ "Str", [ "String" ] ]
    , [ "+", [ "Value", "Value" ] ]
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
  return str;
}

GAP = Object(null);

gap = forwarder(
  { "Double": "Gap<Double>"
  , "String": "Gap<String>"
  , "Value":  "Gap<Value>"
  , "Block":  "Gap<Block>"
  });

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

field = allLang(pattern(GAP));

Template =
  { "Num": field
  , "Str": field
  , "+": allLang(pattern(GAP, "+", GAP))
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


editorByType = forwarder(
  { "Value":
    function (inside) {
      return "\nEditor<Value>[ " + inside + "]\n";
    }
  , "Block":
    function (inside) {
      return "\nEditor<Block>[ " + inside + "]\n";
    }

  })

editor = function (constructor) {
  var type = typeByConstructor(constructor);
  console.log(type);
  var inside = editorInsideByConstructor(constructor);
  return editorByType(type)(inside);
}
