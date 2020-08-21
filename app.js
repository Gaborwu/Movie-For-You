App({
  onLaunch: function() {
    wx.BaaS = requirePlugin('sdkPlugin');
    wx.BaaS.wxExtend(wx.login, wx.getUserInfo);

    wx.BaaS.init('87797df961dae655f5fc');
    wx.BaaS.auth.loginWithWechat().then(user => {
      wx.setStorageSync('user', user);
    })
  },
})