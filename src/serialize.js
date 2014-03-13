function serializeEditor (editor) {
  return [ "Editor"
         , editor.constr
         , serialize(editor.args)
         ];
}

function serializeGap (gap) {
  return [ "Gap", gap.type ];
}

function serializePrimitiveValue (primitiveValue) {
  return [ "PrimitiveValue", primitiveValue.value ];
}

function serialize (code) {
  if (code instanceof Array)
    return code.map(function (_code) { return serialize(_code); });

  return (
    { "Editor":          serializeEditor
    , "Gap":             serializeGap
    , "PrimitiveValue":  serializePrimitiveValue
    }[code.constructor.name](code));
}

var ui = require('./ui');

function parseGap (type) {
  return ui.gap(type);
}

function parseEditor (constr, args) {
  return ui.editor(constr, parse(args));
}

function parsePrimitiveValue (value) {
  return value;
}

function parse (code) {
  if (code instanceof Array && code[0] instanceof Array)
    return code.map(parse);

  var parser =
    { "Editor":          parseEditor
    , "Gap":             parseGap
    , "PrimitiveValue":  parsePrimitiveValue
    }[code[0]];

  if (parser)
    return parser.apply(this, code.slice(1))
  else
    throw "no parser found for: " + JSON.stringify(code);
}

function toJSON (code) {
  return JSON.stringify(serialize(code));
}

function load (text) {
  return parse(JSON.parse(text));
}

module.exports.parse     = parse;
module.exports.serialize = serialize;
module.exports.toJSON    = toJSON;
module.exports.load      = load;
