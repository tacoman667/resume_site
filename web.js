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
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  //app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, '/public')));
  app.use(express.static(path.join(__dirname, '/images')));
});

var pdfDocumentName = 'resume.pdf';

app.get('/', routes.myresume);

app.get('/:ext', function(req, res) {
  var extension = req.params.ext;

  switch (extension) {
    case 'pdf':
      var fullURL = req.protocol + "://" + req.get('host');
      renderPdf(fullURL, 'pdf', function() {
        res.sendfile('./public/' + pdfDocumentName, function (err) {
          if (err) {
            console.log(err);
          }
        });
        console.log("pdf sent to client");
      });
      break;
    case 'rtf':
      res.download(__dirname + '/public/resume.rtf', 'resume.rtf', function(err) {
        if (err) {
          console.log(err);
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

function renderPdf(url, fileType, callback) {
  var phantom = require('node-phantom');

  if (fs.existsSync('./public/' + pdfDocumentName)) { 
    fs.unlinkSync('./public/' + pdfDocumentName);
    console.log("pdf deleted");
  }

  phantom.create(function(error, ph) {
    ph.createPage(function(err, page) {
      page.set('paperSize', {
        format: "Letter",
        orientation: "portrait",
        border: "1cm"
      });
      page.open(url, function(err, status) {
        page.render('./public/' + pdfDocumentName, function(err) {
          if (err) { console.log(err); }
          console.log("pdf rendered");
          page.close();
          setTimeout(function() {
            callback();
            ph.exit();
          }, 200);
        });
      });
    });
  },{phantomPath:require('phantomjs').path});
}

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