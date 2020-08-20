// pages/user/user.js
Page({

    data: {

    },
    getCurrentUser: function () {
            wx.BaaS.auth.getCurrentUser().then(user => {
                this.setData({user});
            })
    },

    onLoad: function (options) {
        this.getCurrentUser();

    },

})