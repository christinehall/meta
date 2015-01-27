var App = require('./app.js.jsx')
var AppsStore = require('../stores/apps_store')
var ButtonDropdown = require('./ui/button_dropdown.js.jsx')
var DropdownMenu = require('./ui/dropdown_menu.js.jsx')
var DropdownMixin = require('../mixins/dropdown_mixin.js.jsx')
var Icon = require('./ui/icon.js.jsx')
var Jumbotron = require('./ui/jumbotron.js.jsx')
var Nav = require('./ui/nav.js.jsx')
var PaginationLinks = require('./pagination_links.js.jsx')
var ProductSearch = require('./product_search.js.jsx')
var Spinner = require('./spinner.js.jsx')
var Url = require('url')

var filters = [
  ['trending', 'Trending'],
  ['live', 'Live'],
  ['new', 'New'],
]

_.mixin({
  // _.eachSlice(obj, slice_size, [iterator], [context])
  eachSlice: function(obj, slice_size, iterator, context) {
    var collection = obj.map(function(item) { return item; }), o = [], t = null, it = iterator || function(){};

    if (typeof collection.slice !== 'undefined') {
      for (var i = 0, s = Math.ceil(collection.length/slice_size); i < s; i++) {
        it.call(context, (t = _(collection).slice(i*slice_size, (i*slice_size)+slice_size), o.push(t), t), obj);
      }
    }
    return o;
  }
});

var Apps = React.createClass({
  mixins: [DropdownMixin],

  propTypes: {
    search: React.PropTypes.string.isRequired
  },

  getDefaultProps() {
    return {
      page: 1,
      filter: 'trending'
    }
  },

  render: function() {
    var header
    var showcase = this.props.showcase

    if (!showcase) {
      header = <Jumbotron bg="ideas/ideas-header-bg-lg.jpg">
        <div className="center white">
          <h1 className="mt0 mb2">Find a product you'd like to work on,</h1>
          <h3 className="regular mt0 mb0">or <a className="underline white white-hover" href="/start">start your own</a> that others can work on with you.</h3>
        </div>
      </Jumbotron>
    } else {
      header = <div className="container py3 px4 bg-white white rounded mt4" style={{background: showcase.background}}>
        <h5 className="mt0 mb0 caps white" style={{color: 'rgba(255,255,255,.6)'}}>Trending</h5>
        <h2 className="mt0 mb0">{showcase.name}</h2>
      </div>
    }


    var filtersDropdownMenu = (
      <DropdownMenu position="right">
        {_(this.props.topics).map(f =>
          <DropdownMenu.Item label={f.name} action={"/discover?topic=" + f.slug} />
        )}
      </DropdownMenu>
    )

    return (
      <div>
        {header}

        <div className="container">
          <div className="clearfix py2 md-py3 lg-py4">
            <div className="sm-col sm-col-8 mb2 sm-mb0">
              <Nav orientation="horizontal">
                {_(filters).map(f =>
                  <Nav.Item href={"/discover?filter=" + f[0]} label={f[1]} active={this.props.filter === f[0]} />
                )}
              </Nav>
            </div>

            <div className="sm-col sm-col-4">
              <form action="/discover">
                <input type="search" className="form-control form-control-search" placeholder="Search all products" name="search" defaultValue={this.props.search} />
              </form>
            </div>
          </div>

          {this.renderApps()}
        </div>
      </div>
    )
  },

  renderApps: function() {
    if (this.state.apps == null) {
      return <Spinner />
    }
    return <div>
      {this.renderAppsList(_(this.state.apps).first(3))}
      {this.renderShowcases()}
      {this.renderAppsList(_(this.state.apps).rest(3))}
      <PaginationLinks page={this.props.page} pages={this.props.total_pages} onPageChanged={this.handlePageChanged} />
    </div>
  },

  renderAppsList: function(apps) {
    return <div className="clearfix mxn2">
      {_(apps).map(app =>
        <div className="sm-col sm-col-4 px0 sm-px2 mb3">
          <App app={app} />
        </div>
      )}
    </div>
  },

  renderShowcases: function() {
    if (!this.props.showcases || this.props.showcase) {
      return null
    }

    var renderShowcase = function(showcase) {
      return (
        <a href={"/discover?showcase=" + showcase.slug} className="block center rounded white white-hover py4 bg-gray-5" style={{
            background: showcase.background
          }}>
          <h4 className="mt1 mb1" style={{color: 'rgba(255,255,255,0.6)'}}>Top Trending</h4>
          <h4 className="mt1 mb1">{showcase.name}</h4>
        </a>
      )
    }

    return <div className="clearfix mxn2">
      <div className="sm-col sm-col-6 px2 mb3">
        {renderShowcase(this.props.showcases[0])}
      </div>
      <div className="sm-col sm-col-6 px2 mb3">
        {renderShowcase(this.props.showcases[1])}
      </div>
    </div>
  },

  handlePageChanged: function(page) {
    // this will go away once we harness the power of Routercles
    var url = Url.parse(window.location.href, true)
    url.query.page = page
    window.location = Url.format({protocol: url.protocol, host: url.host, pathname: url.pathname, query: url.query})
  },

  getInitialState: function() {
    return this.getStateFromStore()
  },

  getStateFromStore: function() {
    return {
      apps: AppsStore.getApps()
    }
  },

  componentDidMount: function() {
    AppsStore.addChangeListener(this._onChange)
  },

  componentWillUnmount: function() {
    AppsStore.removeChangeListener(this._onChange)
  },

  _onChange: function() {
    this.setState(this.getStateFromStore())
  }

})

module.exports = window.Apps = Apps
