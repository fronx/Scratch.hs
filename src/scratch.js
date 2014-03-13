var Types     = require('./types');
var draw      = require('./draw');
var serialize = require('./serialize');
var ui        = require('./ui');

window.Lang = "en";

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
  for (type in Types.defs) fn(type);
}

function forAllConstructors (fn) {
  forAllTypes(function (type) {
    Types.defs[type].forEach(fn);
  });
}

function init (element) {
  document.addEventListener("changedLang", function (e) {
    console.log(e);
  });

  function concat (aryA, aryB) { return aryA.concat(aryB); }
  var pieces = [];
  forAllTypes(function (type) {
    pieces = pieces.concat(
      Types.defs[type].map(function (constr) {
        return ui.editor(constr[0]);
      })
    )
  });
  draw(element, pieces);
};


var Scratch =
  { editor:             ui.editor
  , gap:                ui.gap
  , draw:               draw
  , types:              Types
  , init:               init
  , setLanguage:        setLanguage
  , serialize:          serialize.serialize
  , toJSON:             serialize.toJSON
  , parse:              serialize.parse
  , load:               serialize.load
  };

window.Scratch = Scratch;
module.exports = Scratch;
