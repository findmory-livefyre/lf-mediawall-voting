(function (Livefyre) {

  Livefyre.require(['auth', 'lfep-auth-delegate#0', 'auth-contrib#0.0.0'], function(auth, LFEPDelegate, authContrib) {
    var user = auth.get('livefyre');
    // Wire up LFEP to AppKit Auth
      auth.delegate(new LFEPDelegate({
          engageOpts: {
              app: 'client-solutions.auth.fyre.co'  //.auth.fyre.co
          }
      }));

    authContrib.createButton(auth, document.getElementById('auth-button'));
    // if (user) {
    //   console.log("You user token is: ", user.get('token'));
    //   prompt('Your token is',user.get('token'));
    // }
  });

  Livefyre.require(['streamhub-wall#3','streamhub-sdk#2','stream#0.2.2', 'streamhub-input#0.3'], function (LiveMediaWall, SDK, Stream, Input) {
      //console.log(HTTP);

      var collection = new SDK.Collection({
          "articleId": "ory-1409851747000",
          "siteId": 333682,
          "network": "client-solutions.fyre.co"
      });

      var wall = new LiveMediaWall({
        el: document.getElementById("wall"),
        postButton: true
      });

      var uploadButton = new (Input.UploadButton)({
        el: document.getElementById('upload-button')
      });

      uploadButton.render();
      uploadButton.pipe(collection);


        //get the most upvoted item
        var higestRated = new LiveMediaWall({
            el:document.getElementById('highest'),
            columns:1
        });

          var mostLiked = function(thedata){
            var highest = {};
            //set item 0
            // since our likeBy count doesnt' decrement, we need to set it to 0 if there is no likedBy array
            highest.count = (thedata.content[0].content.annotations.likedBy.length) ? thedata.content[0].content.annotations.likedBy.length : 0;
            highest.item = 0;
            //replace it if item i has a bigger number of likes
            for (var i = 1; i < thedata.content.length; i++) {
              if (thedata.content[i].content.annotations.likedBy.length > highest.count){
                highest.count = thedata.content[i].content.annotations.likedBy.length;
                highest.item = i;
              }
            }
            //return the highest item
            return highest.item;
          };

          //get most liked content from bootstrap
          // and turn it into a Stream.Readable
          var content = {};

          $.get( "https://client-solutions.bootstrap.fyre.co/api/v3.0/site/333682/article/b3J5LTE0MDk4NTE3NDcwMDA=/top/likes/", function (response) {
          }).done(function (response) {
            var likedResContent = response.data.content[mostLiked(response.data)].content;
            content = new SDK.Content(likedResContent);
            higestRated.write(content);
          });

        //only show images
        function itemsWithImages() {
          var customTransform = new Stream.Transform({});
          customTransform._transform = function (content, done) {
            if (content.attachments.length == 0) {
              done();
            } else {
              //TODO: attachment might be in array item > 0
              if (content.attachments[0].type === "photo" || content.attachments[0].type === "video") {
                return done(null, content);
              }
              done();
            }
          };

          return customTransform;
        }

        collection.createUpdater().pipe(itemsWithImages()).pipe(wall);
        collection.createArchive().pipe(itemsWithImages()).pipe(wall.more);

    });

}(Livefyre));