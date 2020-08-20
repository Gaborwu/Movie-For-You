Page({

    data: {
        votes: [],
        movies_list: []
    },

    createLobby: async function () {
        wx.showLoading({title: 'Creating Lobby...'});

        let Lobby = new wx.BaaS.TableObject('lobby');
        let lobby = Lobby.create();

        let user = this.data.user;
        
        user =  { id: user.id, name: user.nickname, avatar: user.avatar, owner: true };

        let users = [user];

        let movie_list = await this.fetchRandomMovies();

        lobby.set({users, movie_list}).save().then(async res => {
            lobby = res.data;
            let movies_list = await this.fetchMovies(lobby);
            
            user['isParticipant'] = true;
            
            this.setData({lobby, user, movies_list});
            this.backgroundRefresh();
            wx.hideLoading();
        })
    },

    fetchMovies: function (lobby) {
        return new Promise(resolve => {
            let Netflix = new wx.BaaS.TableObject('netflix');
            let query = new wx.BaaS.Query();
            
            query.in('id', lobby.movie_list);
            
            Netflix.setQuery(query).find().then(res => {
                let movies_list = res.data.objects
                resolve(movies_list)
            })
        })
    },

    getCurrentUser: function () {
        return new Promise(resolve => {
            wx.BaaS.auth.getCurrentUser().then(user => {
                this.setData({user});
                resolve();
            })
        })
    },
    
    backgroundRefresh: function (id) {
        id = this.data.lobby && this.data.lobby.id ? this.data.lobby.id : id;
        setInterval(() => this.getLobby(id), 1000, id);
    },

    navigateToMovie: function(e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
          url: `../showPage/showPage?id=${id}`,
        })
    },

    getLobby: function (id) {
        id = this.data.lobby && this.data.lobby.id ? this.data.lobby.id : id;
        
        let Lobby = new wx.BaaS.TableObject('lobby')
        
        Lobby.expand(['winner']).get(id).then(res => {
            let lobby = res.data;
            this.setData({lobby});
            this.checkUserParticipation();
        })
        
        // if (this.data.movies_list.length == 0 && this.data.lobby != null) {
        //     console.log('get')
        //     this.fetchMovies(this.data.lobby).then(res => {
        //         this.setData({movies_list: res})
        //     });
        // }
    },

    GoToShow:function(e){
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
          url: '/pages/show/show?id=' + id,
        })
    },

    findWinner: function () {
        let lobby = this.data.lobby
         if (lobby.users.length * 2 != lobby.votes.length) {
            return
        };
        let res = []
        lobby.votes.forEach((e, i) => {
            let r = res.find(item => item.id == e)
            if (r != undefined) {
                r.score += 1
            } else {
                r = {}
                r.id = e
                r.score = 1
            }
            res.push(r)
        })
        // console.log(res)
        // [{id: "5f38f3fe7d4cce06a3e1d020", score: 1}]
        let winner_id
        if (res.length == lobby.users.length * 2) {
            let random = Math.floor(Math.random() * res.length);
            winner_id = res[random].id
        } else {
            winner_id = res.sort(function(a,b) {
                return a.score - b.score;
            })[0].id;
        }
        console.log(winner_id)

        let Lobby = new wx.BaaS.TableObject('lobby');
        let entry = Lobby.getWithoutData(lobby.id);

        let winner_movie = this.data.movies_list.find(item => item.id == winner_id);

        entry.set({ winner: winner_movie.id }).update().then(res => {
            this.setData({winner_movie: winner_movie})
        });
    },

    checkUserParticipation: function () {
        let user = this.data.user;
        let users = this.data.lobby.users.map(user => user.id);
        let lobby_user = this.data.lobby.users.find(item => item.id == user.id)
        if (lobby_user.submitted == true) {
            user['submitted'] = true 
        }
        user['isParticipant'] = users.includes(this.data.user.id);
        this.setData({user});
    },

    userInfoHandler: function (data) {
        wx.BaaS.auth.loginWithWechat(data).then(user => {
            this.setData({user});
            this.addUserToLobby();
        })
      },
      navigateToUserPage: function () {
        let id = this.data.user.id
        wx.navigateTo({
          url: '../user/user?id=${id}`',
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
            imageUrl: 'https://cloud-minapp-36818.cloud.ifanrusercontent.com/1k81nMfmN1HSab8S.jpg'
        }
    },

    importFont: function() {
        wx.loadFontFace({
          family: 'ShadowsIntoLight',
          source: 'url("https://cloud-minapp-36818.cloud.ifanrusercontent.com/1k81zpMB7iJxdrMb.ttf")',
        })

        wx.loadFontFace({
            family: 'Alata',
            source: 'url("https://cloud-minapp-36818.cloud.ifanrusercontent.com/1k826hUnKwIKozur.ttf")',
          })
      },
      
    fetchRandomMovies: function () {
        return new Promise(resolve => {
            let Netflix = new wx.BaaS.TableObject('netflix');
            Netflix.limit(400).find().then(async res => {
                let movies = res.data.objects;
                let movie_list = await this.createRandomMovieArray(movies);
                resolve(movie_list);
              })
        })
    },

    createRandomMovieArray: function (movies) {
        return new Promise (resolve => {
            let movies_list = []
            for (let index = movies_list.length; index < 6; index++) {
                let random = Math.floor(Math.random() * movies.length);
                if (movies_list.includes(movies[random])) {
                    random = Math.floor(Math.random() * movies.length);
                } 
                movies_list.push(movies[random].id)
            }
            resolve(movies_list)
        })
    },

    vote: function (e) {

        let user = this.data.user;
        if (!user.voted) {
            let votes = this.data.votes;
            let movies_list = this.data.movies_list;
            let id = e.currentTarget.dataset.id;
            let index = movies_list.findIndex((item => item.id === id));
    
            if (votes.includes(id)) {
                votes.pop(id);
                movies_list[index]['voted'] = false;
                this.setData({votes, movies_list})
            } else if (votes.length >= 2) {
                wx.showToast({title: 'Only two votes!'})
            } else {
                votes.push(id);
                movies_list[index]['voted'] = true;
                this.setData({votes, movies_list});
            }    
        } else {
            wx.showToast({title: 'You already voted.', icon: 'none'})
        }
    },
    navigateToLanding: function () {
        wx.redirectTo({
          url: '../index/index',
         
        })
    },
    sumbitVoteToLobby: function() {
        let lobby = this.data.lobby;
        let votes = this.data.votes;
        let Lobby = new wx.BaaS.TableObject('lobby');
        let user = this.data.user;
        Lobby.get(lobby.id).then(res => {
            // console.log(res);
            let votesArray = res.data.votes
            let user_votes = res.data.user_votes
            let lobby_users = res.data.users;
            // console.log(lobby_users)
            let lobby_user = res.data.users.find( item => item.id == user.id);
            // console.log(lobby_user)
            let lobby_user_index = res.data.users.findIndex((item => item.id === user.id));
            // console.log(lobby_user_index)
            lobby_user.submitted = true
            lobby_users[lobby_user_index] = lobby_user
            user_votes.push({user_id: user.id, movie_id: votes})
            votes.forEach(vote => votesArray.push(vote));
            let entry = Lobby.getWithoutData(lobby.id);
            entry.set({votes: votesArray, user_votes: user_votes, users: lobby_users}).update().then(res => {
                this.setData({lobby: res.data, 'user.voted': true});
            })
        })
    },

    onLoad: async function (options) {
        const id = options && options.id ? options.id : undefined;
        this.importFont();
        
        await this.getCurrentUser();

        id ? this.backgroundRefresh(id) : this.createLobby();
    }
})
