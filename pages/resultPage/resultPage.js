Page({
  getMovieFromBaas: function() {
    let tableName = 'movie'
    let query = new wx.BaaS.Query()
    query.in('id', ['5f33ee0c7ce5155207790ede'])
    let Movie = new wx.BaaS.TableObject(tableName)
    Movie.setQuery(query).find().then(res => {
      let movies = res.data.objects
      this.setData({movies})
    })
    },

    GoToShow:function(){
      wx.navigateTo({
        url: '../showPage/showPage',
      })
    },
    
    onLoad: function(){
      this.getMovieFromBaas()
    }

})