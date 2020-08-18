
Page({
  
  getMovieData: function (id) {
    let tableName = 'movie'
    let Movie = new wx.BaaS.TableObject(tableName)
    Movie.get(id).then(res => {
      let movie = res.data
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