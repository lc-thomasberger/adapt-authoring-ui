const {Module} = require('adapt-authoring-core');
const {Hook} = require('adapt-authoring-core');
const path = require('path');

/**
* The main entry-point for the Adapt authoring tool web-app/front-end
*/
class WebApp extends Module {
  preload(app, resolve, reject) {
    this.hooks = {
      beforeRenderHomeRoute: new Hook.AsyncWaterfallHook(),
      afterRenderHomeRoute: new Hook.AsyncParallelHook()
    };

    if(!app.server) {
      console.warn(`${this.name}: Cannot initialise, server isn't running`);
      resolve();
    }
    this.initialiseRenderer(app.server);
    this.initialiseRouter(app.server);

    resolve();
  }

  initialiseRenderer(server) {
    var express = server.expressApp;
    express.set('views', path.normalize(path.join(__dirname, '..', 'views')));
    express.set('view engine', 'hbs');
  }

  initialiseRouter(server) {
    /**
    * Instance of the root (/) Express router
    * @type {Express~Router}
    */
    this.router = server.createRouter('/');
    this.router.get('/', async (req, res, next) => {
      console.log('execute async waterfall hook:');
      let result1 = await this.hooks.beforeRenderHomeRoute.call({data: 'test'});
      console.log('async hook done', result1);

      this.handleHomeRoute(req, res, next);

      console.log('execute async parallel hook:');
      let result2 = await this.hooks.afterRenderHomeRoute.call({data: 'test'});
      console.log('async hook done', result2);
    });
  }

  handleHomeRoute(req, res, next) {
    res.render('index', {});
    // next();
  }
}

module.exports = WebApp;
