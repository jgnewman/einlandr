function Timer() {}

Timer.prototype = {

  start: function () {
    this.begin = Date.now()
  },

  end: function () {
    this.end = Date.now();
    return (this.end - this.begin) + ' ms';
  }

};

module.exports = Timer;
