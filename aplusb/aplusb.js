if (Meteor.isClient) {

    Meteor.startup(function (){
           Session.set("number", Math.floor(Math.random()*10) + 1);
           Session.set("range", Math.floor(Math.random()*10) + 1);
           Session.set("repeat", Math.floor(Math.random()*10) + 1);
       });
    
    Template.generator.events({
        //update session when values changes 
        'blur input': function (event) {
            Session.set(event.target.id, event.target.value);
        }
  });

    Template.generator.number = function(){
        return Session.get("number");
    };

    Template.generator.range = function(){
        return Session.get("range");
    };

    Template.generator.repeat = function(){
        return Session.get("repeat");
    };

    Template.generated_table.items = function (){
        var number = Session.get("number");
        var range = Session.get("range");
        var repeat = Session.get("repeat");

        var items = []
        for (var i=0;i<repeat; i++){
            items.push({left:_.random(1,range), right: number});
        }
        return items;
    }

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
