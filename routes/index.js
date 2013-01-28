var fs = require('fs');


exports.myresume = function(req, res){
  var analytics = JSON.parse(fs.readFileSync("./google_analytics.json", "UTF-8"));
  res.render("myresume", { title: 'Jeremy Hardin - My Resume', analyticsKey: analytics.key });
};