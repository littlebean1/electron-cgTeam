<template>
  <div class="videoMain">
    <div id="video-box" class="video-box">
      <video id="video" style="width: 95%; height: 95%" @ended="endVideo()"></video>
      <div id="box" style="display: none; text-align: center">
        <canvas id="canvas1" style="background: transparent; width: 95%; height: 95%"></canvas>
      </div>
      <div id="control">
        <el-button type="primary" icon="el-icon-video-play" v-if="!isPlay" @click="changePlay"></el-button>
        <el-button type="primary" icon="el-icon-video-pause" v-if="isPlay" @click="changePlay"></el-button>
        <el-button type="primary" icon="el-icon-arrow-left" @click="lastFrame"></el-button>
        <el-button type="primary" icon="el-icon-arrow-right" @click="nextFrame"></el-button>
        <div id="progress">
          <div style="position: relative; top: 17px; width: 100%; text-align: left">
            <a v-for="(item, index) in taggingList" :key="item.index" :style="tagPos[index]" @click="changeToCanvas(index)"></a>
          </div>
          <div id="timeBar"></div>
        </div>
        <div id="time">
          <span id="currentTime">
            <input v-model="curTime" disabled="true" style="width: 40px; font-size: 17px; padding: 0; background: #1d1d1d; border: 0; color: white; text-align: right">
          </span>
        </div>
        <div id="sound" class="c-icon"></div>
        <div id="mute" class="c-icon"></div>
        <div id="soundBox">
          <div id="soundBar"></div>
        </div>
        <div id="fullScreen" class="c-icon" @click="requestFullscreen"></div>
      </div>
      <div id="buttons" style="width: 100%">
        <div id="mask"></div>
        <div class="drawTop2" v-show="role !== 'Student'">
          <div>
            <el-button @click="clearAll()" class="drawTopButton2" size="small">清空</el-button>
            <el-button @click="back()" class="drawTopButton2" size="small" id="back">撤销</el-button>
            <el-button @click="clearSome2()" class="drawTopButton2" size="small">橡皮</el-button>
            <el-button @click="save()" class="drawTopButton2" size="small" v-if="isExist">保存</el-button>
            <el-button @click="updateTagging()" class="drawTopButton2" size="small" v-if="!isExist">修改</el-button>
            <el-button @click="deleteTagging()" class="drawTopButton2" size="small">删除</el-button>
          </div>
          <div class="yanse">
            线条颜色:
            <el-color-picker v-model="strokeStyle" @change="changeStrokeStyle()" size="small"></el-color-picker>
          </div>
          <div>
            <p style="color: #fff;font-size: 14px">画笔/橡皮擦粗细:</p>
            <input type="range" max="20" min="1" @change="changeWidth()" value="5" id="rangeIpt">
            <input type="text" id="rangeValue" value="5">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import flvjs from 'flv.js/dist/flv.min.js'
import axios from "axios";
import "hidpi-canvas/dist/hidpi-canvas.min"
import {mapGetters} from "vuex";

export default {
  name: 'drawVideo',
  data() {
    return {
      src: "",
      isPlay: false,
      isEnd: false,
      sumTime: 0,
      curTime: 0,
      myTimer: null,
      count: 0,
      videoElement: null,
      soundPercent: 0,
      fillStyle: "transparent",
      strokeStyle: "#000",
      box: "",
      ctx: "",
      canvas: "",
      video: "",

      imgs: [],
      backFlag: false,
      points2: [],
      beginPoint: null,
      points: [],
      isEraser: false,
      isExist: true,
      penIcon: require("../assets/img/huabi.png"),
      eraserIcon: require("../assets/img/xiangpi.png"),
      flvPlayer: null,
      taggingList: [],
      tagPos: [],
      index: 0,
    };
  },
  mounted() {
    this.videoElement = document.getElementById("video");
    this.box = document.getElementById('box')
    this.canvas = document.getElementById('canvas1')
    this.video = document.getElementById("video")
    this.ctx = this.canvas.getContext("2d");
    this.getVideoSrc()

    // this.videoElement.addEventListener('ended', function () {
    //   this.isPlay = false
    //   this.myTimer = window.clearInterval(this.myTimer);
    // }, false)
  },
  methods: {
    changeStatus() {
      if (this.role === "Teacher") {
        axios.post("/api/cgTask/submitStatus", {
          "remote_task_id": this.reviewId,
          "action": "reject",
          "score": -1,
          "url": this.callbackUrl
        }).then(res => {
          if (res.data.result === 'success')
            this.$message({
              message: '状态修改成功',
              type: 'success'
            });
          else
            this.$message({
              message: '状态修改失败',
              type: 'error'
            });
        }).catch(err => console.log(err.response));
      }
    },
    endVideo() {
      this.isPlay = false
      this.isEnd = true
      // this.videoElement.pause();
      this.myTimer = window.clearInterval(this.myTimer);
    },
    changeToCanvas(index) {
      // console.log(this.taggingList[index])
      this.index = index
      this.updateprogress(0, false, index)
      document.getElementById("mask").style.display = "none";
      if (this.isPlay)
        this.stopVideo()
      this.curTime = this.taggingList[index].frame
      if (this.isEnd) {
        this.videoElement.currentTime = this.taggingList[index].videoTime
        this.captureImage();
        this.videoElement.style.display = "none";
        document.getElementById("mask").style.display = "none";
        this.pen(this.strokeStyle)
        this.isExist = true
        this.isEnd = false
      }

      axios.get("/api/tagging/getMediaTagging", {
        params: {fileId: this.taggingList[index].fileId},
        headers: {},
        responseType: 'arraybuffer'
      }).then(res => {
        // console.log(res.data)
        let b = new Blob([res.data], {type: 'image/png'});
        let image = new Image()
        image.src = URL.createObjectURL(b)
        image.onload = () => {
          this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height)
        }
        this.isExist = false
      }).catch(err => this.$message({
        message: err,
        type: 'error'
      }));
    },
    createVideo() {
      if (flvjs.isSupported()) {
        this.flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: this.src
        });
        this.flvPlayer.attachMediaElement(this.videoElement);
        this.flvPlayer.load();
        this.videoElement.currentTime = 0
        this.curTime = 0
      }
    },
    getVideoSrc() {
      console.log(this.type)
      axios.get("/api/media/getVideoUrl", {
        params: {
          fileId: this.fileId,
          type: this.type.split("/")[1]
        },
      }).then(res => {
        if (res.data === 0) {
          this.$message({
            message: "未找到视频",
            type: 'error'
          })
        } else {
          this.src = res.data.url;
          console.log(this.src)
          this.sumTime = res.data.sumTime / 1000;
          this.enableProgressDrag();
          this.enableSoundDrag();
          this.updatesound(null, 20);

          axios.get("/api/tagging/getMediaTaggingList", {
            params: {mediaId: this.mediaId},
          }).then(res2 => {
            this.taggingList = res2.data
            for (let i = 0; i < this.taggingList.length; i++) {
              let a = this.taggingList[i].frame / Math.round(res.data.sumTime / 24)
              let b = document.getElementById("progress").clientWidth * a - 8 * i
              this.tagPos.push("position: relative; border-radius: 50%; width: 8px; height: 8px; background-color: red; transform: translateX(-50%); display: inline-block; left:" + b + "px")
            }
            if (this.taggingList.length > 0)
              document.getElementById("timeBar").style.marginTop = -15 + "px"
          }).catch(err2 => this.$message({
            message: err2,
            type: 'error'
          }));

          this.$nextTick(() => {
            this.createVideo();
          })
        }
      }).catch(err => this.$message({
        message: err,
        type: 'error'
      }));
    },
    captureImage() {
      this.canvas.style.display = "inline";
      // console.log(this.video.clientWidth)
      this.canvas.width = this.video.clientWidth;
      this.canvas.height = this.video.clientHeight;
      this.box.style.width = this.video.clientWidth + "px"
      this.box.style.height = this.video.clientHeight + "px"
      this.canvas.style.width = this.video.clientWidth + "px"
      this.canvas.style.height = this.video.clientHeight + "px"
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      // let base64 = this.canvas.toDataURL('image/png', 1)
      // let blob = this.dataURItoBlob(base64)
      // let url = URL.createObjectURL(blob);
      //
      this.box.style.display = "inline"
      // this.box.style.backgroundImage = "url(" + url + ")"
      // this.box.style.backgroundRepeat = "no-repeat"
      // this.box.style.backgroundPosition = "center center"
      // this.box.style.backgroundSize = "auto 100%"
      //
      // this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
      // this.ctx.fillStyle="transparent";
      // this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    },
    changePlay() {
      if (!this.isPlay) {
        this.playVideo()
      } else {
        this.stopVideo()
      }
    },
    playVideo() {
      this.myTimer = setInterval(this.changeCurTime, 42);
      this.isPlay = true
      this.videoElement.play();
      document.getElementById("canvas1").style.display = "none";
      this.box.style.display = "none"
      document.getElementById("mask").style.display = "";
      this.videoElement.style.display = "flex";
    },
    stopVideo() {
      this.isPlay = false
      this.videoElement.pause();
      this.myTimer = window.clearInterval(this.myTimer);
      this.captureImage();
      this.videoElement.style.display = "none";
      document.getElementById("mask").style.display = "none";
      this.pen(this.strokeStyle)
      this.isExist = true
    },
    lastFrame() {
      this.videoElement.currentTime -= (1000 / 42) * 0.001;
      // this.captureImage();
    },
    nextFrame() {
      this.videoElement.currentTime += (1000 / 42) * 0.001;
      // this.captureImage();
    },
    updateprogress(x, flag, index) {// 进度条拖拽
      let progressElement = document.getElementById("progress");
      let percent = 0;
      if (flag)
        percent = x / progressElement.clientWidth * 100
      else
        percent = this.taggingList[index].frame / Math.round(this.sumTime * 1000 / 24) * 100
      if (percent > 100) {
        percent = 100;
      } else if (percent < 0) {
        percent = 0;
      }
      document.getElementById("timeBar").style.width = percent + "%";
      if (flag)
        this.videoElement.currentTime = this.sumTime * percent / 100;
      else
        this.videoElement.currentTime = this.taggingList[index].videoTime
    },
    enableProgressDrag() {// 进度条获取坐标调用 拖拽实现方法
      let _this = this;
      let progressDrag = false;
      document.getElementById("progress").onmousedown = function (e) {
        progressDrag = true;
        _this.updateprogress(e.offsetX, true, 0);
      };
      document.getElementById("progress").onmouseup = function (e) {
        if (progressDrag) {
          progressDrag = false;
          _this.updateprogress(e.offsetX, true, 0);
        }
      };
      document.getElementById("progress").onmousemove = function (e) {
        if (progressDrag) {
          _this.updateprogress(e.offsetX, true, 0);
        }
      }
    },
    updatesound(x, n) {// 音量拖拽
      if (n) {
        this.soundPercent = n;
      } else {
        this.soundPercent = x / document.getElementById("soundBox").clientWidth * 100;
      }
      if (this.soundPercent > 100) {
        this.videoElement.volume = 100;
      }
      if (this.soundPercent < 0) {
        this.videoElement.volume = 0;
      }
      this.videoElement.volume = this.soundPercent / 100;
      document.getElementById("soundBar").style.width = this.soundPercent + "%";
      // isSound();
    },
    enableSoundDrag() {// 音量获取坐标调用 拖拽实现方法
      var soundDrag = false;
      let _this = this;
      let soundBoxElement = document.getElementById("soundBox");
      soundBoxElement.onmousedown = function (e) {
        soundDrag = true;
        _this.updatesound(e.offsetX, null);
      };
      soundBoxElement.onmouseup = function (e) {
        if (soundDrag) {
          soundDrag = false;
          _this.updatesound(e.offsetX, null);
        }
      };
      soundBoxElement.onmousemove = function (e) {
        if (soundDrag) {
          _this.updatesound(e.offsetX, null);
        }
      }
    },
    requestFullscreen() {// 全屏
      // 全屏兼容代码
      if (this.videoElement.requestFullscreen) {
        this.videoElement.requestFullscreen();
      } else if (this.videoElement.webkitRequestFullscreen) {
        this.videoElement.webkitRequestFullscreen();
      } else if (this.videoElement.mozRequestFullScreen) {
        this.videoElement.mozRequestFullScreen();
      } else if (this.videoElement.msRequestFullscreen) {
        this.videoElement.msRequestFullscreen();
      }
    },
    changeCurTime() {
      console.log(123)
      this.curTime = Math.round(this.videoElement.currentTime * 1000 / 24);
      // console.log(this.videoElement.currentTime+":"+this.sumTime);
      let percent = this.videoElement.currentTime / this.sumTime * 100;
      document.getElementById("timeBar").style.width = percent + "%";
    },

    // 画笔动作
    pen(color){
      let that = this
      that.canvas.onmousedown = function (e){
        // let x = e.pageX - that.canvas.offsetLeft
        // let y = e.pageY - that.canvas.offsetTop
        let x = e.offsetX * that.zoom
        let y = e.offsetY * that.zoom

        // console.log(x, y)
        // console.log(e.pageX, that.canvas.offsetLeft)
        // console.log(e.pageY, that.canvas.offsetTop)
        // console.log(e.offsetX, e.offsetY)

        that.points2.push({x, y});
        that.beginPoint = {x, y};
        that.backFlag = true
        document.getElementById('back').style.background = '#ccc'

        document.onmousemove = function (e){
          // let x = e.pageX - that.canvas.offsetLeft
          // let y = e.pageY - that.canvas.offsetTop
          let x = e.offsetX * that.zoom
          let y = e.offsetY * that.zoom
          that.ctx.strokeStyle = color

          // 使用贝塞尔曲线画出圆滑的曲线
          that.points2.push({x,y})
          if (that.points2.length > 3) {
            const lastTwoPoints = that.points2.slice(-2);
            const controlPoint = lastTwoPoints[0];
            const endPoint = {
              x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
              y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
            }
            that.drawLine(that.beginPoint, controlPoint, endPoint);
            that.beginPoint = endPoint;
          }
        }

        // 将每一个画笔动作存入imgs，用于撤销
        let obj = that.ctx.getImageData(0, 0, that.canvas.width, that.canvas.height)
        that.imgs.push(obj)
      }
      document.onmouseup = function () {
        that.ctx.closePath()
        document.onmousemove = null
      }
      document.getElementById('back').disabled = false
    },
    eraser() {
      // this.canvas.style.cursor = "url(" + this.eraserIcon + "), auto"
      let that = this
      that.canvas.onmousedown = function (e){
        let x1 = e.offsetX * that.zoom;
        let y1 = e.offsetY * that.zoom;
        //鼠标第一次点下的时候擦除一个圆形区域，同时记录第一个坐标点
        that.ctx.save()
        that.ctx.beginPath()
        let a = document.getElementById('rangeIpt').value/2
        that.ctx.arc(x1,y1,a,0,2*Math.PI);
        that.ctx.clip()
        that.ctx.clearRect(0,0,that.canvas.width,that.canvas.height);
        that.ctx.restore();

        document.onmousemove = function (e){
          let x2 = e.offsetX * that.zoom;
          let y2 = e.offsetY * that.zoom;
          //获取两个点之间的剪辑区域四个端点
          var asin = a*Math.sin(Math.atan((y2-y1)/(x2-x1)));
          var acos = a*Math.cos(Math.atan((y2-y1)/(x2-x1)))
          var x3 = x1+asin;
          var y3 = y1-acos;
          var x4 = x1-asin;
          var y4 = y1+acos;
          var x5 = x2+asin;
          var y5 = y2-acos;
          var x6 = x2-asin;
          var y6 = y2+acos;
          //保证线条的连贯，所以在矩形一端画圆
          that.ctx.save()
          that.ctx.beginPath()
          that.ctx.arc(x2,y2,a,0,2*Math.PI);
          that.ctx.clip()
          that.ctx.clearRect(0,0,that.canvas.width,that.canvas.height);
          that.ctx.restore();
          //清除矩形剪辑区域里的像素
          that.ctx.save()
          that.ctx.beginPath()
          that.ctx.moveTo(x3,y3);
          that.ctx.lineTo(x5,y5);
          that.ctx.lineTo(x6,y6);
          that.ctx.lineTo(x4,y4);
          that.ctx.clip()
          that.ctx.clearRect(0,0,that.canvas.width,that.canvas.height);
          that.ctx.restore();
          //记录最后坐标
          x1 = x2;
          y1 = y2;
        }
        // 将每一个画笔动作存入imgs，用于撤销
        let obj = that.ctx.getImageData(0, 0, that.canvas.width, that.canvas.height)
        that.imgs.push(obj)
      }
      document.onmouseup = function () {
        that.ctx.closePath()
        document.onmousemove = null
      }
    },
    drawLine(beginPoint, controlPoint, endPoint){
      this.ctx.beginPath();
      this.ctx.moveTo(beginPoint.x, beginPoint.y);
      this.ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
      this.ctx.stroke();
    },
    // 改变画笔/橡皮擦粗细
    changeWidth() {
      this.ctx.lineWidth = document.getElementById('rangeValue').value = document.getElementById('rangeIpt').value
    },
    // 改变画笔颜色
    changeStrokeStyle() {
      console.log(this.strokeStyle)
      this.pen(this.strokeStyle)
    },
    // 清空画布
    clearAll() {
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
      // 清空画布后重新画一个和画布同样大小的矩形，在保存时可有背景颜色
      this.ctx.fillStyle="transparent";
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      document.getElementById('back').style.background = '#999'
      this.backFlag = false
    },
    // 橡皮擦，将画笔变成白色（背景颜色）
    clearSome() {
      this.pen('#fff')
    },
    clearSome2() {
      console.log("使用橡皮")
      this.isEraser = ! this.isEraser
      // this.pen()
      if (this.isEraser)
        this.eraser()
      else
        this.pen(this.strokeStyle)
    },
    // 撤销按钮，将存入的画笔动作数组删除最后一个，再重新绘制到画布上
    back() {
      if(this.backFlag){
        let img = this.imgs.pop()
        this.ctx.putImageData(img,0,0);
        // 撤销按钮的样式
        if(this.imgs.length > 0){
          document.getElementById('back').style.background = '#181D20'
          this.backFlag = true
        }else{
          document.getElementById('back').style.background = '#999'
          this.backFlag = false
          document.getElementById('back').disabled = true
        }
      }
    },
    // 将画布存储为图片显示在页面
    save() {
      let base64Data = this.canvas.toDataURL("image/png", 1.0)
      let blob = this.dataURItoBlob(base64Data)
      let fd = new FormData()
      fd.append("file", blob)
      fd.append("mediaId", this.mediaId)
      fd.append("frame", this.curTime)
      fd.append("videoTime", this.videoElement.currentTime)
      // console.log(fd.get("file"))
      axios.post("/api/tagging/addMediaTagging", fd).then((res) => {
        if (res.data !== 0) {
          this.$message({
            message: "保存审验成功",
            type: 'success'
          });
          if (this.taggingList.length === 0)
            document.getElementById("timeBar").style.marginTop = -15 + "px"
          let list = {
            _id: res.data.id,
            mediaId: this.mediaId,
            frame: this.curTime,
            fileId: res.data.fileId,
            videoTime: this.videoElement.currentTime
          }
          // console.log("list", list)
          this.taggingList.push(list)
          this.tagPos = []
          for (let i = 0; i < this.taggingList.length; i++) {
            let a = this.taggingList[i].frame / Math.round(this.sumTime * 1000 / 24)
            let b = document.getElementById("progress").clientWidth * a - 8 * i
            this.tagPos.push("position: relative; border-radius: 50%; width: 8px; height: 8px; background-color: red; transform: translateX(-50%); display: inline-block; left:" + b + "px")
          }
          this.isExist = false
        } else
          this.$message({
            message: "保存审验失败",
            type: 'error'
          });
      }).catch(err => this.$message({
        message: err,
        type: 'error'
      }));
      this.changeStatus()
    },
    dataURItoBlob(base64Data) {
      let byteString
      if (base64Data.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(base64Data.split(',')[1])
      else
        byteString = unescape(base64Data.split(',')[1])
      let mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
      let ia = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], {type: mimeString});
    },
    deleteTagging() {
      axios.get("/api/tagging/deleteMediaTagging", {
        params: {
          mediaId: this.mediaId,
          frame: this.curTime,
          fileId: this.taggingList[this.index].fileId
        },
      }).then((res) => {
        if (res.data === 1) {
          this.$message({
            message: "删除审验成功",
            type: 'success'
          });
          this.taggingList.splice(this.index, 1)
          this.tagPos = []
          for (let i = 0; i < this.taggingList.length; i++) {
            let a = this.taggingList[i].frame / Math.round(this.sumTime * 1000 / 24)
            let b = document.getElementById("progress").clientWidth * a - 8 * i
            this.tagPos.push("position: relative; border-radius: 50%; width: 8px; height: 8px; background-color: red; transform: translateX(-50%); display: inline-block; left:" + b + "px")
          }
          if (this.taggingList.length === 0)
            document.getElementById("timeBar").style.marginTop = 0
          this.isExist = true
        } else
          this.$message({
            message: "删除审验失败",
            type: 'error'
          });
      }).catch(err => this.$message({
        message: err,
        type: 'error'
      }));
      this.changeStatus()
    },
    updateTagging() {
      let base64Data = this.canvas.toDataURL("image/png", 1.0)
      let blob = this.dataURItoBlob(base64Data)
      let fd = new FormData()
      fd.append("file", blob)
      fd.append("mediaId", this.mediaId)
      fd.append("frame", this.curTime)
      fd.append("fileId", this.taggingList[this.index].fileId)
      axios.post("/api/tagging/updateMediaTagging", fd).then((res) => {
        if (res.data === 1) {
          this.$message({
            message: "修改审验成功",
            type: 'success'
          });
        } else
          this.$message({
            message: "修改审验失败",
            type: 'error'
          });
      }).catch(err => this.$message({
        message: err,
        type: 'error'
      }));
      this.changeStatus()
    }
  },
  computed: {
    ...mapGetters([
      'mediaId', 'fileId', 'zoom', 'type', 'role', 'callbackUrl', 'reviewId',
    ])
  },
  watch: {
    '$store.state.mediaId': function () {
      console.log(222)
      this.myTimer = window.clearInterval(this.myTimer);
      this.videoElement.currentTime = 0
      this.curTime = 0

      this.flvPlayer.pause()
      this.flvPlayer.unload()
      this.flvPlayer.detachMediaElement()
      this.flvPlayer.destroy()
      this.flvPlayer = null

      this.isPlay = false
      this.videoElement.style.display = "";
      this.box.style.display = "none"
      document.getElementById("mask").style.display = "";
      document.getElementById("canvas1").style.display = "none";
      this.pen(this.strokeStyle)

      this.getVideoSrc()
    },
  },
  destroyed() {
    this.myTimer = window.clearInterval(this.myTimer);
    this.flvPlayer.pause()
    this.flvPlayer.unload()
    this.flvPlayer.detachMediaElement()
    this.flvPlayer.destroy()
    this.flvPlayer = null
  }
};
</script>

<style>
.videoMain {
  height: 100%;
  width: 100%;
}

/* 视频播放窗口 */
.video-box {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: black;
  top: 50%;
  transform: translateY(-50%);
}

/* 默认视频 */
video {
  display: flex;
}

#canvas1 {
  display: none;
}

/* 视频播放控制 */
#control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 40px;
  background-color: #1d1d1d;
}

#control div {
  cursor: pointer;
}

#control .el-button {
  width: 40px;
  height: 30px;
  padding: 8px;
  background-color: #28343B;
  color: white;
  border: none;
}

/* 图标 */
.c-icon {
  width: 24px;
  height: 24px;
  margin: 0 8px;
}

#sound {
  background: url(../assets/videoIcon/sound.png) no-repeat;
  background-size: 100%;
  margin-top: 5px;
}

#mute {
  display: none;
  background: url(../assets/videoIcon/mute.jpg) no-repeat;
  background-size: 100%;
}

#fullScreen {
  width: 18px;
  height: 18px;
  background: url(../assets/videoIcon/fullScreen.png) no-repeat;
  background-size: 100%;
}

#time {
  margin-left: 8px;
  color: white;
}

#progress {
  overflow: hidden;
  flex-grow: 1;
  height: 30px;
  border-radius: 5px;
  background-color: #333333;
  margin-left: 10px;
}

#progress li{
  content: "";
  position: absolute;
  left: 0;
  margin-top: 10px;
  width: 10px;
  height: 10px;
  border-radius: 100%;
  background: gold;
}

#timeBar {
  width: 0;
  height: 30px;
  border-right: 1px solid orange;
}

#soundBox {
  overflow: hidden;
  width: 100px;
  height: 10px;
  border-radius: 5px;
  background-color: #333333;
}

#soundBar {
  width: 0;
  height: 10px;
  background-color: tomato;
}

@media (max-width: 576px) {
  #soundBox {
    width: 70px;
  }

  #time {
    font-size: 14px;
  }
}

@media (max-width: 420px) {
  #control {
    height: 32px;
  }

  .c-icon {
    width: 18px;
    height: 18px;
    margin: 0 8px;
  }

  #fullScreen {
    width: 14px;
    height: 14px;
  }

  #time {
    font-size: 12px;
  }

  #soundBox {
    width: 50px;
  }
}

#mask {
  position:absolute;
  z-index:100;
  background:#cccccc;
  filter: alpha(Opacity=50);
  -moz-opacity:0.5;
  opacity: 0.5;
  width: 100%;
  height: 52px;
}

.drawTop2 {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 5px;
  height: 52px;
  bottom: 0;
  color: #7D98A1;
  text-align: center;

}

.drawTopButton2 {
  background-color: #181D20;
  border: 0;
}

.drawTop2 > div {
  display: flex;
  align-items: center;
  padding: 5px 5px;
}

#rangeValue{
  width: 60px;
}
</style>
