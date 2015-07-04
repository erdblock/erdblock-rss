/* @flow */

var fs = require("fs")
var jade = require("jade")
var is = require("is_js")
var express = require("express")
var async = require('async')
var FeedParser = require('feedparser')
var request = require('request')
var CronJob = require('cron').CronJob

module.exports = function(){
	var app = express()

	app.locals.title = "RSS"

	app.locals.configId = function(){
		return app.locals.config.url.value
	}

	app.locals.config = {
		url: {
			label: 'URL',
			value: null,
			setValue: function(v){
				this.value = v
				app.generate()
			},
			type: 'text',
			isValid: function(value){
				if (is.not.url(value) || value.substring(0,4).toUpperCase() != "HTTP"){
					return "value is not a URL"
				}
				else{
					return null
				}
			}
		},
		title: {
			label: 'Title',
			value: '',
			setValue: function(v){
				this.value = v
				app.generate()
			},
			type: 'text',
			isValid: function(value){
				return null
			}
		},
		link: {
			label: 'Link',
			value: '',
			setValue: function(v){
				this.value = v
				app.generate()
			},
			type: 'text',
			isValid: function(value){
				if (is.not.url(value) || value.substring(0,4).toUpperCase() != "HTTP"){
					return "value is not a URL"
				}
				else{
					return null
				}
			}
		},
		articles: {
			label: 'Number of articles',
			value: 5,
			setValue: function(v){
				this.value = parseInt(v)
				app.generate()
			},
			type: 'text',
			isValid: function(value){
				if (is.not.number(parseInt(value))){
					return "value must be a number"
				}
				else {
					return null
				}
			}
		}
	}

	var render = jade.compileFile(__dirname + "/views/index.jade")
	var renderLoading = jade.compileFile(__dirname + "/views/loading.jade")

	app.use("/public", express.static(__dirname + "/public", {
		maxAge: "7d"
	}))

	app.html = function() {
		if (app.locals.results != null) {
			return render( app.locals )
		} else {
			return renderLoading( app.locals )
		}
	}
	app.less = function(){
		return fs.readFileSync(__dirname + "/stylesheets/style.less").toString()
	}

	app.generate = function() {
		if (app.locals.config.articles.value == null || app.locals.config.url.value == null || app.locals.config.url.value == "" || app.locals.config.articles.value == "") {
			//console.log("Error at erdblock-rss: not all values set")
			return
		}

		async.parallel(
			{
				items: function(callback){
					var req = request(app.locals.config.url.value)
					var feedparser = new FeedParser()

					req.on('error', function (error) {
						console.log("Error at erdblock-rss "+error)
					})
					req.on('response', function (res) {
						var stream = this
						if (res.statusCode != 200) {
							return this.emit('error', new Error('Bad status code'))
						}
						stream.pipe(feedparser)
					})

					feedparser.on('error', function(error) {
						//console.log("Error at erdblock-rss "+error)
					})

					var array = []
					feedparser.on('readable', function() {
						var stream = this
						var meta = this.meta
						var item

						if (array.length < app.locals.config.articles.value) {
							while (item = stream.read()) {
								array[array.length] = item
							}
						}
						else {
							callback(null, array)
							feedparser.stop()
						}
					})
				},
			},
			function(err, results) {
				if (err != null) {
					//callback("Error at erdblock-rss ERROR", null)
					return
				}
				app.locals.results = results
				//callback(null, render( config ))
			}
		)

		function get(url, callback) {
			var headers = {
				'User-Agent':	  'Erdblock/0.1',
				'Content-Type':   'text/html',
				'charset':        'utf-8',
			}
			var options = {
				  url:    url,
				  method: 'GET',
				  headers: headers,
				  gzip: true,
			}
			request(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					callback(body)
				   }
			  })
		}
	}

	new CronJob('0 31 * * * *',
		app.generate,
		null,
		true
	)

	return app
}
