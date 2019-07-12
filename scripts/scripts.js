var app = new Vue({
	el:'#app',
  data:{
    dataFile:'data.json',
    cond:'',
    word:'',
    time:'12:30',
    param:'',
    menuFlag:false,
    categories:{
      group1:{
        label:'ジャンル',
        arr:{
          cat1_1:{
            label:'和食',
            flag:false
          },
          cat1_2:{
            label:'洋食',
            flag:false
          },
          cat1_3:{
            label:'中華',
            flag:false
          },
          cat1_4:{
            label:'イタリアン',
            flag:false
          },
          cat1_5:{
            label:'ラーメン',
            flag:false
          }
        }
      },
      group2:{
        label:'メイン',
        arr:{
          cat2_1:{
            label:'肉',
            flag:false
          },
          cat2_2:{
            label:'魚',
            flag:false
          }
        }
      },
      group3:{
        label:'予算',
        arr:{
          cat3_1:{
            label:'500円以下',
            flag:false
          },
          cat3_2:{
            label:'1000円以下',
            flag:false
          }
        }
      },
      group4:{
        arr:{
          cat4_1:{
            label:'近い',
            flag:false
          },
        }
      }
    },
    contents:[],
    showCat:[]
  },
  created:function(){
    this.getData()
  },
  mounted:function(){
  },
  computed:{
    wordMatch:function(){
      return '(?=.*'+this.word+')'
    },
    timeNum:function(){
    	return this.time.replace(':','')
    }
  },
  methods:{
    timeTxt:function(num,str){
      num = num+''
      var num1 = parseInt(num.substr(0,2))
          num2 = num.substr(2,2)
          prefix = ''
      if(num1>23){
        num1 = num1 -24
        prefix = (num1>0)?'翌0':'0'
        return prefix + num1 + str + num2
      }
      return num1 + str + num2
    },
    getData:function(){
      let self = this
      axios.get(self.dataFile)
        .then(function(response){
          document.getElementById('loading').remove()
          self.contents = response.data
		  self.sortBy()
          //self.urlReflect()
          self.checkUpdate()
          self.textSort()
          self.timeSort()
        })
        .catch(function(err){
          console.log('ERROR.')
        })
    },
	sortBy:function(){
      this.contents = _.sortBy(this.contents,'head')
    },
    urlReflect:function(){
      if(location.search){
        if(location.search.match(/.*?cond=/)){
          console.log(location.search.match(/cond=(.*)(?=,)/).toString().replace('cond=',''))
        }
      }
    },
    checkUpdate:function(){
      var showCat=[]
      for(group in this.categories){
        var groupArr = []
        for(cat in this.categories[group].arr){
          if(this.categories[group].arr[cat].flag === true){
            groupArr.push(this.categories[group].arr[cat].label)
          }
        }
        if(groupArr.length){
          showCat.push(groupArr)
        }
      }
      this.showCat.splice(0)
      if(showCat.length){
        this.showCat.push(showCat)
      }
      this.checkJudge()
    },
    textJudge:function(text){
      if(text.match(this.wordMatch)){
        return true
      }else{
        return false
      }
    },
    checkJudge:function(){
      this.cond = ''
      for(group in this.showCat){
        for(cat in this.showCat[group]){
          this.cond += '&&'+this.showCat[group][cat]
        }
      }
      this.cond = this.cond.replace(/&&/g,')(?=.*').replace(/,/g,'|.*').slice(1)
      if(this.cond !== '') this.cond += ')'
      this.checkSort()
    },
    checkSort:function(){
      for(item in this.contents){
        if(this.contents[item].cat.toString().match(this.cond)){
          this.contents[item].checkFlag = true
        }else{
          this.contents[item].checkFlag = false
        }
      }
      //this.updateParam()
    },
    textSort:function(){
      if(this.word !== ''){
        for(item in this.contents){
          for(text in this.contents[item]){
            if(isNaN(this.contents[item][text])){
              if(this.textJudge(this.contents[item][text].toString())){
                this.contents[item].wordFlag = true
                break
              }else{
                this.contents[item].wordFlag = false
              }
            }
          }
        }
      }else{
        for(item in this.contents){
          this.contents[item].wordFlag = true
        }
      }
      //this.updateParam()
    },
    timeSort:function(){
      if(this.time !== ''){
        for(item in this.contents){
          if(this.contents[item].open <= this.timeNum && this.contents[item].close >= this.timeNum){
            this.contents[item].timeFlag = true
          }else{
            this.contents[item].timeFlag = false
          }
        }
      }else{
        for(item in this.contents){
          this.contents[item].timeFlag = true
        }
      }
    },
    nowTime:function(){
      var now = new Date(),
          nowH = ''+now.getHours(),
          nowM = ''+now.getMinutes()
      if(nowH.length<2) nowH.length = '0' + nowH.length
      if(nowM.length<2) nowM.length = '0' + nowM.length
      var nowTime = nowH +  ':' + nowM
      this.time = nowTime
      this.timeSort()
    },
    updateParam:function(){
      var param = ''
      if(this.cond) param += '?cond=' + this.cond +','
      if(this.word) param += '?word=' + this.word +','
      if(this.time) param += '?time=' + this.time
      console.log(param)
      if(param !== ''){
        history.pushState(null,null,param)
      }else{
        var defHref = location.href.replace(/\?.*$/,"");
        history.pushState(null,null,defHref)
      }
    }
  }
})