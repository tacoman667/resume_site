var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , resumeEmailer = require('./resume_emailer');

require('./string_extensions')

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, '/public')));
  app.use(express.static(path.join(__dirname, '/images')));
});


app.get('/', routes.myresume);

app.get('/:ext', function(req, res) {
  var extension = req.params.ext;

  var filename = "MyResume." + extension;
  switch (extension) {
    case 'pdf':
      res.download(__dirname + '/public/' + filename, filename, function(err) {
        if (err) {
          // Oh well for now
        } else {
          resumeEmailer.sendEmail(getClientIp(req), "Someone downloaded your resume in " + extension + " format.");
        }
      });
      
      break;
    case 'rtf':
      res.download(__dirname + '/public/' + filename, filename, function(err) {
        if (err) {
          // Oh well for now
        } else {
          resumeEmailer.sendEmail(getClientIp(req), "Someone downloaded your resume in " + extension + " format.");
        }
      });
      
      break;
    default:
      break;
  }
  console.log("finished processing route for extension: " + extension);
});

// gets the client ip address
function getClientIp(req) {
  var ipAddress;
  // Amazon EC2 / Heroku workaround to get real client IP
  var forwardedIpsStr = req.header('x-forwarded-for'); 
  if (forwardedIpsStr) {
    // 'x-forwarded-for' header may return multiple IP addresses in
    // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
    // the first one
    var forwardedIps = forwardedIpsStr.split(',');
    ipAddress = forwardedIps;
  }
  if (!ipAddress) {
    // Ensure getting client IP address still works in
    // development environment
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

// starts the server
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});