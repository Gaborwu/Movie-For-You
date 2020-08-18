
Page({
  data: {
    movie: ''
  },
  getMovieData: function (id) {
    let tableName = 'netflix'
    let Netflix = new wx.BaaS.TableObject(tableName)
    Netflix.get(id).then(res => {
      let movie = res.data
      console.log(movie)
      this.setData({movie})
    })
  },
  importFont: function() {
    wx.loadFontFace({
      family: 'Lato',
      source: 'url("https://cloud-minapp-36818.cloud.ifanrusercontent.com/1k7CRndA2wGAY3DN.zip")',
      success: console.log
    })
  },
  onLoad: function (options) {
    let id = options.id;
    this.getMovieData(id);
  }
})