(function() {
  
	var jQuery = require('jquery');
	var jsdom = require('jsdom');
	var fs = require('fs');

  module.exports.sendEmail = function(ip_address, subject) {
	  //http://whatismyipaddress.com/ip/<ip_address>
	  // or
	  // http://www.iptrackeronline.com/index.php?ip_address=<ip_address>

	  var ipLookupUrl = "http://www.iptrackeronline.com/index.php?ip_address=" + ip_address;

	  jsdom.env({
	    html: ipLookupUrl,
	    scripts: ["http://code.jquery.com/jquery.js"],
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
	    subject = "Someone looked at your resume";
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
	    body: "Your resume was just viewed!\n" + data,
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

}());