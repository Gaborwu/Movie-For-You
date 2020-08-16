Page({

    data: {
        votes: []
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

    fetchMovies: function () {
        let Movies = new wx.BaaS.TableObject('movie')
        let query = new wx.BaaS.Query()
        Movies.setQuery(query).find().then(res => {
            console.log(res)
            let movies = res.data.objects;
            this.setData({movies})
            this.randomMovies();
          })
    },
    randomMovies: function () {
        let Movies = this.data.movies;   
        //const random = Math.floor(Math.random() * types.length);
        let resultArray = []
        let moviesArray = []
        for (let index = 0; index < 6; index++) {
            const random = Math.floor(Math.random() * Movies.length);
            if(resultArray.includes(random)){
                console.log("number is already random")
                index--;
                continue;
            }else{
                resultArray.push(random)
                moviesArray.push(Movies[random])
            }
            //console.log(random)
            let randomMovies = moviesArray
            this.setData({randomMovies})
        }
    },

    vote: function (e) {
        let votes = this.data.votes;
        let randomMovies = this.data.randomMovies;
        let id = e.currentTarget.dataset.id;
        let index = randomMovies.findIndex((item => item.id === id));

        if (votes.includes(id)) {
            votes.pop(id);
            randomMovies[index]['voted'] = false;
            this.setData({votes, randomMovies})
        } else if (votes.length >= 2) {
            wx.showToast({title: 'Only two votes!'})
        } else {
            votes.push(id);
            randomMovies[index]['voted'] = true;
            this.setData({votes, randomMovies});
        }    
    },

    onLoad: async function (options) {
        const id = options && options.id ? options.id : undefined;
        
        await this.getCurrentUser();
        
        id ? this.backgroundRefresh(id) : this.createLobby();
        this.fetchMovies();
    }
})

// 1. Start styling the lobby page
// 2. Hardcode an array of movies for users to vote on. 
// 3. Add that as a data point in your lobby object in local data
// 4. As a user, I can see 6 movies in the lobby
// 5. As a user, I can vote on 2 movies
// 6. As an owner, I can stop the voting || As a user, I can see a countdown of when voting ends
// 7. As a user, I can see more details about a movie