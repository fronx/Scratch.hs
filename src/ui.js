var Types = require('./types');

function Label (text) {
  this.text = text;
}

function Gap (type) {
  this.type = type || "auto";
}

function gap (type) {
  return new Gap(type);
}

function PrimitiveValue (value) {
  this.type = "Value";
  this.value = value;
}

function checkArgs (args, argTypes) {
  for (var i = 0; i < args.length; i++)
    if (args[i] != null) {
      if (args[i].type == undefined)
        args[i] = new PrimitiveValue(args[i]);
      if (args[i].type == "auto")
        args[i].type = argTypes[i];
      if (args[i].type != argTypes[i])
        throw "argument types don't match: " + args[i] + " is a " + args[i].type + " and not a " + argTypes[i];
    }
}

function Editor (constructor, args) {
  var self = this;

  function argTypes () {
    return Types.argTypesByConstructor(self.constr);
  }
  self.constr = constructor;
  checkArgs(args, argTypes());
  self.type   = Types.byConstructor(constructor);
  self.args   = args;

  self.parts = function () {
    return template(self.constr)[Lang](argTypes());
  };

  self.setArg = function (i, arg) {
    self.args[i] = arg;
    checkArgs(self.args, argTypes());
    return self;
  }
};

function editor (constructor, args) {
  var args = args || [];
  return new Editor(constructor, args);
}


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


module.exports.Label  = Label;
module.exports.Gap    = Gap;
module.exports.gap    = gap;
module.exports.Editor = Editor;
module.exports.editor = editor;
module.exports.PrimitiveValue = PrimitiveValue;

module.exports.template = template;
