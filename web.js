var express = require('express');
var fs = require('fs');
var jQuery = require('jquery');
var jsdom = require('jsdom');


var app = express.createServer(express.logger());


app.use('/public', express.static(__dirname + "/public"));
app.use('/images', express.static(__dirname + "/images"));

app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var contents = fs.readFileSync("./public/resume.html", "UTF-8");
  res.end(contents);
  //sendEmail(getClientIp(req));
});

app.get('/:ext', function(req, res) {
  var extension = req.params.ext;

  var filename = "resume." + extension;
  switch (extension) {
    case 'pdf':
      res.download('./public/' + filename, filename);
      sendEmail(getClientIp(req), "Someone downloaded your resume in " + extension + " format.");
      break;
    case 'rtf':
      res.download('./public/' + filename, filename);
      sendEmail(getClientIp(req), "Someone downloaded your resume in " + extension + " format.");
      break;
    default:
      break;
  }
  console.log("finished processing route for extension: " + extension);
});

String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

function sendEmail(ip_address, subject) {
  //http://whatismyipaddress.com/ip/<ip_address>
  // or
  // http://www.iptrackeronline.com/index.php?ip_address=<ip_address>

  var ipLookupUrl = "http://www.iptrackeronline.com/index.php?ip_address=" + ip_address;

  jsdom.env({
    html: ipLookupUrl,
    scripts: ["http://code.jquery.com/jquery.js"],
    config: {
      FetchExternalResources: false,
      ProcessExternalResources: false
    },
    done: function (errors, window) {
      var tbl = window.$('div:contains("Information about IP Address")').next();
      
      var info = {};
      info.city = valueFromCell("City", tbl);
      info.state = valueFromCell("Region (code)", tbl);
      info.country = valueFromCell("Country", tbl);
      info.areaCode = valueFromCell("Areacode", tbl);
      info.organization = valueFromCell("Organization", tbl);
      info.isp = valueFromCell("ISP", tbl);
      
      console.log("Oranization: {0}".format(info.organization));

      var msg = "Information provided by: {0}\n\n".format(ipLookupUrl);
      msg += "Organization: {0}\n".format(info.organization);
      msg += "ISP: {0}\n".format(info.isp);
      msg += "City: {0}\n".format(info.city);
      msg += "State: {0}\n".format(info.state);
      msg += "Country: {0}\n".format(info.country);
      msg += "Area Code: {0}\n".format(info.areaCode);
      
      sendEmailWithData(msg, subject);
    }
  });
}

function valueFromCell(name, tbl) {
  var selector = 'td:contains("' + name + '")';
  return tbl.find(selector).find("input").val();
}

// composes the email using data for the email body and sends it
function sendEmailWithData(data, subject) {
  if (!subject) {
    subject = "Someone looked at your resume at jeremyhardin.com";
  }
  var email = require('mailer');

  var options = getEmailOptions(data, subject);

  email.send(
    options,
    function(err, result){
      if(err){ console.log(err); }
    }
  );
}

// composes the options to be used for sending an email
function getEmailOptions(data, subject) {
  var sendOptions = {
    subject : subject,
    body: "Your resume was just viewed at jeremyhardin.com!\n" + data,
    callback: function(err, data) {
      if (!err) {
        console.log("email failed!");
      } else {
        console.log("email sent!");
      }
    }
  };

  var emailServerOptions = fs.readFileSync("./emailServerOptions.json", "UTF-8");
  var options = jQuery.extend(JSON.parse(emailServerOptions), sendOptions);

  return options;
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
var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});