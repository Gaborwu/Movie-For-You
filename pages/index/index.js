//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    
  },
  importFont: function() {
    wx.loadFontFace({
      family: 'Dancing Script',
      source: 'url("https://cloud-minapp-36450.cloud.ifanrusercontent.com/1k5TkIviCFoo6hkB.ttf")',
      success: console.log
    })
  },
 onLoad: function() {
    this.importFont()
 }

})
