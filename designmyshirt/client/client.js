Meteor.startup(function () {
  // create a wrapper around native canvas element (with id="c")
  window.canvas = new fabric.Canvas('c');
  window.canvas.selection = false;
  window.canvas.setBackgroundImage('tempimg/t_shirts.jpg',
    window.canvas.renderAll.bind(canvas));

  window.canvas.on('object:modified', function (e) {
    var data;

    if (e.target.type === 'image') {
      data = _.pick(e.target.toJSON(), [
        'angle', 'flipX', 'flipY', 'left', 'top', 'opacity', 'src',
        'scaleX', 'scaleY', 'type'
      ]);
    }
    else if (e.target.type === 'text') {
      data = _.pick(e.target.toJSON(), [
        'angle', 'left', 'top', 'opacity', 'fill', 'fontFamily',
        'fontSize', 'fontStyle', 'fontWeight', 'scaleX', 'scaleY', 'type',
        'strokeStyle', 'strokeWidth', 'textDecoration', 'text'
      ]);
    }

    CanvasObjects.update({_id: e.target._id}, data);
  });

  window.canvas.on('object:selected', function (e) {
    console.log(e.target._id);
    Session.set('selectedObject', e.target._id);

    if (e.target.type === 'text') {
      Session.set('textSelected', true);
    }
    else {
      Session.set('textSelected', false);
    }
  });

  window.canvas.on('selection:cleared', function (e) {
    console.log('selection cleared');
    Session.set('selectedObject', null);
    Session.set('textSelected', false);
  });

  $('#add-text-btn').popover({
    html: true,
    placement: 'bottom',
    title: 'Add text',
    content: $('#text-controls').html()
  });

  $('#obj-remove-btn').tooltip({
    placement: 'bottom',
    title: 'Remove object'
  });
});

var submitText = function () {
  var text = $('#text-to-add').val();

  $('#add-text-btn').popover('hide');

  if (text) {
    var textObj = new fabric.Text(text, { left: 100, top: 100 });
    textObj.setColor('white');

    var data = _.pick(textObj, [
      'angle', 'left', 'top', 'opacity', 'fill', 'fontFamily',
      'fontSize', 'fontStyle', 'fontWeight', 'scaleX', 'scaleY', 'type',
      'strokeStyle', 'strokeWidth', 'textDecoration', 'text'
    ]);

    CanvasObjects.insert(data);
  }
};

Template.panel.events({
  'click #add-img-btn': function () {
    var pics = ['tempimg/01.png',
                'tempimg/02.png',
                'tempimg/03.png'
               ];

    var randNum = fabric.util.getRandomInt(0, pics.length-1);
    fabric.Image.fromURL(pics[randNum], function (oImg) {
      oImg.set({
        left: fabric.util.getRandomInt(0, window.canvas.width),
        top: fabric.util.getRandomInt(0, window.canvas.height),
        angle: fabric.util.getRandomInt(0, 359)
      });
      oImg.scale(0.5);
      var data = _.pick(oImg.toJSON(), [
        'angle', 'flipX', 'flipY', 'left', 'top', 'opacity', 'src',
        'scaleX', 'scaleY', 'type'
        ]);
      CanvasObjects.insert(data);
    });
  },

  'click #clear-canvas-btn': function () {
    CanvasObjects.find({}).fetch().forEach(function (obj) {
      CanvasObjects.remove({_id: obj._id});
    });
  },

  'click #obj-remove-btn': function () {
    CanvasObjects.remove({_id: Session.get('selectedObject')});
  },

  'click #confirm-add-text-btn': function () {
    submitText();
  },

  'click #cancel-add-text-btn': function () {
    $('#add-text-btn').popover('hide');
  },

  'keypress #text-to-add': function (e) {
    if (e.which === 13) {
      submitText();
    }
  }
});

Template.panel.created = function () {
  var objCursor = CanvasObjects.find({});
  objCursor.observe({
    added: function (doc) {
      if (doc.type === 'image') {
        fabric.Image.fromObject(doc, function (oImg) {
          oImg.perPixelTargetFind = true;
          oImg.lockUniScaling = true;
          window.canvas.add(oImg);
        });
      }
      else if (doc.type === 'text') {
        var textObj = new fabric.Text.fromObject(doc);
        textObj.lockUniScaling = true;
        window.canvas.add(textObj);
      }
    },

    changed: function (newDoc, oldDoc) {
      window.canvas.forEachObject(function (canvasObj) {
        if (canvasObj._id === newDoc._id) {
          if (canvasObj.type === 'image') {
            canvasObj.set({
              angle: newDoc.angle,
              flipX: newDoc.flipX,
              flipY: newDoc.flipY,
              left: newDoc.left,
              top: newDoc.top,
              opacity: newDoc.opacity,
              scaleX: newDoc.scaleX,
              scaleY: newDoc.scaleY
            });
          }
          else if (canvasObj.type === 'text') {
            canvasObj.set({
              angle: newDoc.angle,
              left: newDoc.left,
              top: newDoc.top,
              opacity: newDoc.opacity,
              fill: newDoc.fill,
              fontFamily: newDoc.fontFamily,
              fontSize: newDoc.fontSize,
              fontStyle: newDoc.fontStyle,
              fontWeight: newDoc.fontWeight,
              scaleX: newDoc.scaleX,
              scaleY: newDoc.scaleY,
              strokeStyle: newDoc.strokeStyle,
              strokeWidth: newDoc.strokeWidth,
              textDecoration: newDoc.textDecoration,
              text: newDoc.text
            });
          }

          // Fixes bounding box
          canvasObj.setCoords();
          window.canvas.renderAll();
        }
      });
    },

    removed: function (oldDoc) {
      window.canvas.forEachObject(function (canvasObj) {
        if (canvasObj._id === oldDoc._id) {
          window.canvas.remove(canvasObj);
        }
      });
    }
  });
};

Template.panel.helpers({
  selectedObject: function () {
    return Session.get('selectedObject');
  },

  textSelected: function () {
    return Session.equals('textSelected', true);
  }
});
