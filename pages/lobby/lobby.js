Page({

    data: {

    },

    createLobby: function () {
        let Lobby = new wx.BaaS.TableObject('lobby');
        let lobby = Lobby.create();

        let user = this.data.user;
        user =  { id: user.id, name: user.nickname, avatar: user.avatar };

        let users = [user];

        lobby.set({users}).save().then(res => {
            lobby = res.data;
            user = this.data.user;
            user['isParticipant'] = true;
            this.setData({lobby, user})
            this.backgroundRefresh();
        })
    },

    getCurrentUser: function () {
        return new Promise(resolve => {
            wx.BaaS.auth.getCurrentUser().then(user => {
                this.setData({user});
                resolve(user);
            })
        })
    },
    
    backgroundRefresh: function (id) {
        id = this.data.lobby && this.data.lobby.id ? this.data.lobby.id : id;
        setInterval(() => this.getLobby(id), 1000, id);
    },

    redirectToType: function() {
        wx.redirectTo({
          url: '../type/type',
        })
    },

    getLobby: function (id) {
        id = this.data.lobby && this.data.lobby.id ? this.data.lobby.id : id;
        let Lobby = new wx.BaaS.TableObject('lobby')
        Lobby.get(id).then(res => {
            let lobby = res.data;
            this.setData({lobby});
            this.checkUserParticipation();
        })
    },

    checkUserParticipation: function () {
        let user = this.data.user;
        let users = this.data.lobby.users.map(user => user.id);

        user['isParticipant'] = users.includes(this.data.user.id);

        this.setData({user});
    },

    userInfoHandler: function (data) {
        wx.BaaS.auth.loginWithWechat(data).then(user => {
            this.setData({user});
            this.addUserToLobby();
        })
      },

    addUserToLobby: function () {
        let lobby = this.data.lobby;
        let users = lobby.users;

        let user = this.data.user;
        user =  { id: user.id, name: user.nickname, avatar: user.avatar };

        users.push(user);
        
        let Lobby = new wx.BaaS.TableObject('lobby');
        let entry = Lobby.getWithoutData(lobby.id);

        entry.set({users}).update().then(this.getLobby(lobby.id));
    },

    onShareAppMessage: function () {
        const id = this.data.lobby.id;
        return {
            title: "Let's Netflix and Chill",
            path: `pages/lobby/lobby?id=${id}`,
            imageUrl: 'https://cloud-minapp-36818.cloud.ifanrusercontent.com/1k5V1CDOoCY9ZknJ.png'
        }
    },

    onLoad: async function (options) {
        const id = options && options.id ? options.id : undefined;
        
        await this.getCurrentUser();
        
        id ? this.backgroundRefresh(id) : this.createLobby();
    }
})