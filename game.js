function calcLeft(x, y) {
  return (y % 2) * 18 + (x + 1) * 36;
}

function calcTop(x, y) {
  return (y + 1) * 32;
}

function makeCircle(x, y) {
  var c = new fabric.Circle({
    left: calcLeft(x, y),
    top: calcTop(x, y),
    strokeWidth: 3,
    radius: 12,
    fill: '#fff',
    stroke: '#666'
  });
  c.hasControls = c.hasBorders = false;
  c.lockMovementX = c.lockMovementY = true;
  c.lockScalingX = c.lockScalingY = true;
  c.lockRotation = true;
  return c;
}

function randomBelow(max) {
  return ~~(Math.random() * max);
}

function randomColor() {
  return "#000".replace(/0/g, function(){ return randomBelow(16).toString(16); });
}

// http://javascript.crockford.com/prototypal.html
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

(function() {

  var canvas = new fabric.Canvas('c');
  var width = 10, height = 12;
  var field = _.map(_.range(height), function(y) { 
    return _.map(_.range(width), function(x) {
      var circle = makeCircle(x, y);
      canvas.add(circle);
      return circle;
    });
  });

  var other = Object();
  other.circle = makeCircle(0, 0);
  other.circle.fill = '#fff';
  canvas.add(other.circle);  

  var me = {
    x: randomBelow(width),
    y: randomBelow(height),
    c: randomColor()
  };
  me.circle = makeCircle(me.x, me.y);
  me.circle.fill = me.c;
  canvas.add(me.circle);
  canvas.renderAll();

  var socket = new WebSocket("ws://localhost:8088/");
  socket.onmessage = function(msg) {
    console.log(msg.data);
    var up = JSON.parse(msg.data);
    other.circle.left = calcLeft(up.x, up.y);
    other.circle.top = calcTop(up.x, up.y);
    other.circle.fill = up.c;
    canvas.renderAll();
  }

  key('left, right, up, down', function(event){
    if (event.keyIdentifier == 'Left') {
      me.x = me.x == 0 ? width - 1 : me.x - 1;
    } else if (event.keyIdentifier == 'Right') {
      me.x = me.x == width - 1 ? 0 : me.x + 1;
    } else if (event.keyIdentifier == 'Up') {
      me.y = me.y == 0 ? height - 1 : me.y - 1;
    } else if (event.keyIdentifier == 'Down') {
      me.y = me.y == height - 1 ? 0 : me.y + 1;
    }
    me.circle.left = calcLeft(me.x, me.y);
    me.circle.top = calcTop(me.x, me.y);
    canvas.renderAll();
    socket.send(JSON.stringify({ 
      x: me.x, 
      y: me.y,
      c: me.c
    }));
  });

})();

