//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    
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

  navigateToUser: function () {
    wx.navigateTo({
      url: '../user/user'
    })
  },

  onLoad: function() {
    this.importFont();
  }

})
