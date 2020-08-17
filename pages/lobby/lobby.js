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
        
        user =  { id: user.id, name: user.nickname, avatar: user.avatar };

        let users = [user];

        let movie_list = await this.fetchRandomMovies();

        lobby.set({users, movie_list}).save().then(async res => {
            lobby = res.data;
            let movies_list = await this.fetchMovies(lobby);
            user = this.data.user;
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
        if (this.data.movies_list.length == 0 && this.data.lobby != null) {
            console.log('get')
            this.fetchMovies(this.data.lobby).then(res => {
                this.setData({movies_list: res})
            });
        }
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

    fetchRandomMovies: function () {
        return new Promise(resolve => {
            let Netflix = new wx.BaaS.TableObject('netflix');
            Netflix.limit(600).find().then(async res => {
                let movies = res.data.objects;
                let movie_list = await this.createRandomMovieArray(movies);
                resolve(movie_list);
              })
        })
    },

    createRandomMovieArray: function (movies) {
        return new Promise (resolve => {
            let movies_list = []
            for (let index = 0; index < 6; index++) {
                const random = Math.floor(Math.random() * movies.length);
                if (movies_list.includes(movies[random])) {
                    index--;
                    continue;
                } else {
                    movies_list.push(movies[random].id)
                }
                resolve(movies_list)
            }
        })
    },

    // submitMovieList: function () {
    //     let movie_list = this.data.randomMovies;
    //     let lobby = this.data.lobby
    //     let Lobby = new wx.BaaS.TableObject('lobby');
    //     let entry = Lobby.getWithoutData(lobby.id);
    //     entry.set(movie_list).update().then( res=> {
    //         console.log(res)
    //     }
    //     );
        
    // },
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

    sumbitVoteToLobby: function() {
        let lobby = this.data.lobby;
        let votes = this.data.votes;
        let Lobby = new wx.BaaS.TableObject('lobby');
        Lobby.get(lobby.id).then(res => {
            console.log(res);
            let votesArray = res.data.votes
            votes.forEach(vote => votesArray.push(vote));
            let entry = Lobby.getWithoutData(lobby.id);
            entry.set({votes: votesArray}).update().then(res => {
                this.setData({lobby: res.data, 'user.voted': true});
            })
        })
    },

    onLoad: async function (options) {
        const id = options && options.id ? options.id : undefined;
        
        await this.getCurrentUser();
        id ? this.backgroundRefresh(id) : this.createLobby();
        // let movie_list = await this.fetchRandomMovies();
        // console.log(movie_list)
        // this.setData({movies_list: movie_list})
    }
})

// 1. Start styling the lobby page
// 2. Hardcode an array of movies for users to vote on. 
// 3. Add that as a data point in your lobby object in local data
// 4. As a user, I can see 6 movies in the lobby
// 5. As a user, I can vote on 2 movies
// 6. As an owner, I can stop the voting || As a user, I can see a countdown of when voting ends
// 7. As a user, I can see more details about a movie