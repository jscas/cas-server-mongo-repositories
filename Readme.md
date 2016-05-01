# cas-server-mongo-registries

This module provides both a services registry and ticket registry for the
[JSCAS server][jscas]. It requires the server to have the [Mongoose][mongoose]
data source configured.

Other than the data source, no configuration is necessary.

See the reference [server configuration][refconfig] to learn how to include
these registries in your server (plugins section).

[jscas]: https://github.com/jscas/cas-server
[mongoose]: http://mongoosejs.com/
[refconfig]: https://github.com/jscas/cas-server/blob/master/settings.example.js

## TODO

+ Include a tool to bootstrap the database (so that `autoIndex` can be disabled)
+ Include a tool to add services to the database
+ Include a tool to purge old tickets

## License

[MIT License](http://jsumners.mit-license.org/)
