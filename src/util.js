function forwarder (obj) {
  return function (key) {
    return obj[key];
  };
}

module.exports.forwarder = forwarder;
