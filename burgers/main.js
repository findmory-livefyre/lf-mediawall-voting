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
      var collection, wall, uploadButton, higestRated, content;

      collection = new SDK.Collection({
          "articleId": "ory-1409851747000",
          "siteId": 333682,
          "network": "client-solutions.fyre.co"
      });

      wall = new LiveMediaWall({
        el: document.getElementById("wall"),
        postButton: true
      });

      uploadButton = new (Input.UploadButton)({
        el: document.getElementById('upload-button')
      });

      //get the most upvoted item
      higestRated = new LiveMediaWall({
        el:document.getElementById('highest'),
        columns:1,
        initial: 1,
        minContentWidth: 400
      });

      //get most liked content from bootstrap
      // and turn it into a Stream.Readable
      content = $.get( "https://client-solutions.bootstrap.fyre.co/api/v3.0/site/333682/article/b3J5LTE0MDk4NTE3NDcwMDA=/top/likes/", function (response) {
      }).done(function (response) {
        var likedResContent = response.data.content[mostLiked(response.data)].content;
        content = new SDK.Content(likedResContent);
        higestRated.write(content);
      });


      function mostLiked (thedata) {
        var highest = {},
          i = 1;
        //set item 0
        // since our likeBy count doesnt' decrement, we need to set it to 0 if there is no likedBy array
        highest.count = (thedata.content[0].content.annotations.likedBy.length) ? thedata.content[0].content.annotations.likedBy.length : 0;
        highest.item = 0;

        //replace it if item i has a bigger number of likes
        for (i; i < thedata.content.length; i += 1) {
          if (thedata.content[i].content.annotations.likedBy.length > highest.count) {
            highest.count = thedata.content[i].content.annotations.likedBy.length;
            highest.item = i;
          }
        }
        //return the highest item
        return highest.item;
      }

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

      uploadButton.render();
      uploadButton.pipe(collection);

      collection.createUpdater().pipe(itemsWithImages()).pipe(wall);
      collection.createArchive().pipe(itemsWithImages()).pipe(wall.more);

    // widget.on('commentLiked', function (data) {
    //     console.log(data);
    // });

  });

}(Livefyre));

$(function () {
  $("#mediawall-highest").stick_in_parent().on("sticky_kit:stick", function(e) {
    var $el = $(e.target);
    console.log("has stuck!", e.target);
    $el.parent().css({
      'position': 'fixed',
      'top': 360
    });

  });
}());