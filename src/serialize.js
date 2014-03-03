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

module.exports = serialize;
