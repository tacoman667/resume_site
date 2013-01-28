This is just a little website that will serve up a static html page that I use for hosting my resume on heroku.

It will serve up links for an rtf version and a pdf version. Should someone click those links, an email will go out to the owner of this site as defined in an emailServerOptions.json file. The email will contain a url to a free site that will serve up information about the IP address from whom downloaded the resume. Information is also parsed from this site into the email for quick reference.

Contents of the emailServerOptions.json file:
```
{
	"host" : "smtp.example.com",
    "port" : "25",             
    "domain" : "smtp.example.com",
    "to" : "sample@example.com",
    "from" : "sample@example.com",
    "authentication" : "login",
    "username" : "sample@example.com",
    "password" : "p@ssw0rd"
}
```

Contents of the google_analytics.json file:
```
{
	"key" : "<your key here>"
}
```