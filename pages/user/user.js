// pages/user/user.js
Page({
    userInfoHandler(data) {
        wx.BaaS.auth.loginWithWechat(data).then(user => {
            wx.setStorageSync('user', user);
            this.setData({user});
        })
    },

    logout: function () {
        wx.BaaS.auth.logout().then(res => {
            wx.setStorageSync('user', null);
            this.setData({user: null});
        })
    },

    onLoad: function (options) {
        this.setData({user: wx.getStorageSync('user')});
    }
})