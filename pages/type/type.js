// pages/type/type.js
Page({

    data: {
        types: []
    },
    fetchOptions: function () {
        let Questions = new wx.BaaS.TableObject('questions')
        let query = new wx.BaaS.Query()
        Questions.setQuery(query).find().then(res => {
            console.log(res)
            let types = res.data.objects;
            this.setData({types})
            this.randomType();

          })
    },
    randomType: function () {
        let types = this.data.types;   
        //const random = Math.floor(Math.random() * types.length);
        let resultArray = []
        let moviesArray = []
        for (let index = 0; index < 6; index++) {
            const random = Math.floor(Math.random() * types.length);
            if(resultArray.includes(random)){
                console.log("number is already random")
                index--;
                continue;
            }else{
                resultArray.push(random)
                moviesArray.push(types[random])
            }
            //console.log(random)
            let randomTypes = moviesArray
            this.setData({randomTypes})
        }
        console.log(resultArray);
    },

    onLoad: function (options) {
        this.fetchOptions();
    },

   
  


})