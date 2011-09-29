function calcLeft(x, y) {
  return (y % 2) * 18 + (x + 1) * 36;
}

function calcTop(x, y) {
  return (y + 1) * 32;
}

function makeCircle(color, x, y) {
  var c = new fabric.Circle({
    left: calcLeft(x, y),
    top: calcTop(x, y),
    strokeWidth: 3,
    radius: 12,
    fill: color,
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

(function() {

  var canvas = new fabric.Canvas('c');
  var width = 10, height = 12;

  _.each(_.range(height), function(y) { 
    _.each(_.range(width), function(x) {
      canvas.add(makeCircle("#fff", x, y));
    });
  });

  var Player = function(color) {
    this.x = randomBelow(width);
    this.y = randomBelow(height);
    this.color = color;
    this.circle = makeCircle(this.color, this.x, this.y);
    canvas.add(this.circle);

    this.move = function(direction) {
      if (direction == 'Left') {
        this.x = this.x == 0 ? width - 1 : this.x - 1;
      } else if (direction == 'Right') {
        this.x = this.x == width - 1 ? 0 : this.x + 1;
      } else if (direction == 'Up') {
        this.y = this.y == 0 ? height - 1 : this.y - 1;
      } else if (direction == 'Down') {
        this.y = this.y == height - 1 ? 0 : this.y + 1;
      }
      this.circle.left = calcLeft(this.x, this.y);
      this.circle.top = calcTop(this.x, this.y);
    }
  }

  var me = new Player(randomColor()); 
   
  var others = new Array();
  var player = function(color) {
    if (others[color] == undefined) {
      others[color] = new Player(color);
    }
    return others[color];
  }

  var socket = new WebSocket("ws://localhost:8088/");
  socket.onmessage = function(msg) {
    console.log(msg.data);
    var up = JSON.parse(msg.data);
    other = player(up.color);
    other.color = up.color;
    other.x = up.x;
    other.y = up.y;
    other.move('there');
    canvas.renderAll();
  }

  key('left, right, up, down', function(event){
    me.move(event.keyIdentifier);
    canvas.renderAll();
    socket.send(JSON.stringify({ 
      action: "move",
      color: me.color,
      x: me.x, 
      y: me.y
    }));
  });

  canvas.renderAll();

})();

