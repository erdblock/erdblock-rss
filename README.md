# erdblock-rss

## Description
Show the x newest RSS articles.


## Config
| Name           | Description  | Values |
| -------------- | ------------- | ----- |
| `url`          | URL to the RSS Feed | `http://www.faz.net/rss/aktuell/` |
| `title`        | Title Of the Feed (Frontend use) | `FAZ` |
| `articles`     | Number of articles to show | `3` |
| `link`         | Link to the Web Frontend' | `http://www.faz.net` |


## Example
````javascript
var rss = require("erdblock-rss")()
rss.locals.config.title.setValue("Alpha")
rss.locals.config.url.setValue("http://blog.janniklorenz.de/rss/")
rss.locals.config.link.setValue("http://www.example.com/a")
rss.locals.config.articles.setValue("3")
erdblock.addPlugin(rss)
````
