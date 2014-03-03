var Util = require('./util');
var forwarder = Util.forwarder;

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

module.exports.defs = Defs;
module.exports.byConstructor = forwarder(ByConstructor);
module.exports.argTypesByConstructor = forwarder(ArgTypesByConstructor);
