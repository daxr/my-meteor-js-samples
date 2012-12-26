// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

// On server startup, create some players if the database is empty.
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Math.random()*10)*5});
    }
  });


Players.allow({
    update: function (userId, players, fields, modifier ){
                console.log("\nuserId:", userId, "\nplayers:", players, "\nfields:", fields, "\nmodifier", modifier);
                console.log("truth", _.filter(players, 
                        function(player){
                            console.log("player", player.name)
                            return player.name=="Nikola Tesla" || player.name=="Marie Curie";}
                            )
                    )

                //admin@localhost are only allowed to edit, Tesla and Marie Curie
                if(Meteor.userId()=="1e07a627-56f8-423e-811c-18ada545488b" && 
                    _.filter(players, 
                        function(player){ 
                            return player.name=="Nikola Tesla" || player.name=="Marie Curie";}
                            )
                    )
                    
                    return true;
                return false;
            },
    insert: function (userId, doc){
                console.log("userId", userId, doc);
                return true;
            }
})
