var express = require('express');
var fs = require('fs');
var resumeEmailer = require('./resume_emailer');
require('./string_extensions');


var app = express();


app.use('/public', express.static(__dirname + "/public"));
app.use('/images', express.static(__dirname + "/images"));

app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var contents = fs.readFileSync(__dirname + "/public/myresume.html", "UTF-8");
  res.end(contents);
  //sendEmail(getClientIp(req));
});

app.get('/:ext', function(req, res) {
  var extension = req.params.ext;

  var filename = "myresume." + extension;
  switch (extension) {
    case 'pdf':
      res.download(__dirname + '/public/' + filename, filename);
      resumeEmailer.sendEmail(getClientIp(req), "Someone downloaded your resume in " + extension + " format.");
      break;
    case 'rtf':
      res.download(__dirname + '/public/' + filename, filename);
      resumeEmailer.sendEmail(getClientIp(req), "Someone downloaded your resume in " + extension + " format.");
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
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});