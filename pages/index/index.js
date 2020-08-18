//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    
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
  importFont: function() {
    wx.loadFontFace({
      family: 'Lobster',
      source: 'url("https://cloud-minapp-36818.cloud.ifanrusercontent.com/1k82NZJYI0HFldqS.ttf")',
      success: console.log
    })
  },

  onLoad: function() {
    this.importFont();
    this.getCurrentUser();
    this.importFont();
  }

})
