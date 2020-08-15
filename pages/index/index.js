//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    
  },
  importFont: function() {
    wx.loadFontFace({
      family: 'Dancing Script',
      source: 'url("https://cloud-minapp-36818.cloud.ifanrusercontent.com/1k5V0aQMGnkPStxC.ttf")',
      success: console.log
    })
  },
  fetchFeedback: function() {
    let Feedback = new wx.BaaS.TableObject('feedback')
    let MyRecord = MyTableObject.create()
    let room_id
    Feedback.set(room_id).save().then(res => {
      console.log(res)
    })
  },

  getCurrentUser: function () {
    wx.BaaS.auth.getCurrentUser().then(user => {
      this.setData({user});
      return user;
    })
  },

  userInfoHandler: function (data) {
    wx.BaaS.auth.loginWithWechat(data).then(user => {
        this.setData({user});
        this.redirectToLobby();
    })
  },

  redirectToLobby: function() {
    wx.redirectTo({
      url: '/pages/lobby/lobby',
    })
  },

  onLoad: function() {
    this.importFont();
    this.getCurrentUser();
  }

})
