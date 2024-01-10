<template>
    <el-container class="contain" direction="vertical">
      <el-header height="60px">
        <el-row :gutter="10">
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <img :src="logo"/>
          </el-col>
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <el-button type="primary" icon="el-icon-folder" @click="toIndex" class="header_folder"/>
          </el-col>
          <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4">
            <div class="proName">
              <p>PROJECT: {{ this.projectName }}</p>
              <p>{{ this.reviewName }}</p>
            </div>
          </el-col>
          <el-col :xs="1" :sm="17" :md="17" :lg="17" :xl="17">
            <el-button type="primary" icon="el-icon-share" class="header_share" @click="shareLink">Share Link</el-button>
          </el-col>
          <el-col :xs="1" :sm="1" :md="1" :lg="1" :xl="1">
            <el-tooltip effect="dark" :content="this.alias" placement="bottom">
              <el-avatar icon="el-icon-user-solid" class="header_head"/>
            </el-tooltip>
          </el-col>
        </el-row>
      </el-header>
      <el-container class="center">
        <div class="center_head">
          <div class="center_head_left">
            <el-row type="flex">
              <el-col :span="4">
                <el-button type="primary" v-if="!isShowList" icon="el-icon-s-unfold" @click="changeIsShowList"/>
                <el-button type="primary" v-if="isShowList" icon="el-icon-s-fold" @click="changeIsShowList"/>
              </el-col>
            </el-row>
          </div>
          <div class="center_head_center">
            <el-radio-group>
              <el-button type="primary" class="infoIcon">
                {{ this.mediaName }}
                <el-tooltip effect="dark" :content=this.mediaType placement="bottom">
                  <i class="el-icon-info"/>
                </el-tooltip>
              </el-button>
              <el-button type="primary" icon="el-icon-download" class="infoIcon" v-show="false"/>
            </el-radio-group>
          </div>
          <div class="center_head_right">
            <el-button type="primary" icon="el-icon-s-comment" class="infoIcon" @click="changeIsShowComment"/>
          </div>
        </div>
        <div class="center_main">
          <el-container>
            <el-aside width="250px" v-if="isShowList">
              <div class="center_left">
                <el-table :data="mediaList"
                          highlight-current-row
                          @current-change="handleCurrentChange"
                          :show-header="false"
                          :row-style="{height: '70px'}"
                          :cell-style="{padding: '0', background: '#151A1D', color: '#DAE0E3', border: '0'}"
                          class="left_table"
                          :height="tableHeight"
                >
                  <el-table-column width="17px">
                    <template slot-scope="scope">
                      <div style="font-size: smaller; margin-left: -5px; width: 15px">
                        {{ scope.$index + 1 }}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column width="120px" style="max-height: 70px; padding-left: 0px">
                    <template slot-scope="scope">
                      <el-image
                          :src="'data:image/png;base64,'+scope.row.buffer"
                          style="height: 70px"
                          :fit="fit"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column>
                    <template slot-scope="scope">
                      <el-tooltip effect="dark" :content=scope.row.name placement="right">
                        <p style="line-height: 25px; font-size: small; font-family: Arial">{{ scope.row.name }}</p>
                      </el-tooltip>
                      <p style="line-height: 25px; font-size: small; font-family: Arial">{{ scope.row.userName }}</p>
                      <el-button size="mini" icon="el-icon-delete-solid" @click="deleteMedia(scope.$index, scope.row)"
                                 class="delButton"/>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-aside>
            <el-main>
              <div class="center_center">
                <draw-image v-if="isImage"></draw-image>
                <!-- <draw-video v-if="isVideo"></draw-video> -->
              </div>
              <div class="center_right" v-show="isShowComment">
                <div class="center_right_top">
                  <div style="padding-top: 5px; padding-bottom: 5px" v-show="role === 'Teacher'">
                    <el-button type="primary" icon="el-icon-check" style="padding: 13px; background-color: #409EFF; color: #FFFFFF" @click="dialogVisible2 = true">通过</el-button>
                    <el-button type="danger" icon="el-icon-close" style="padding: 13px; background-color: #F56C6C; color: #FFFFFF; margin-top: 3px" @click="doBack">翻修</el-button>
                  </div>
                  <div v-for="(item, index) in comments" :key="item.index">
                    <el-card>
                      <div slot="header" style="text-align: left; padding-left: 5px">
                        <p style="height: 25px; line-height: 25px; font-size: 15px; color: #C4CDD4">
                          {{ item.user.userName }}
                          <el-button icon="el-icon-check" v-if="!item.isUpdate" style="float: right; font-size: 20px; margin-right: 10px; margin-top: 5px" @click="updateComment(item, index)"></el-button>
                        </p>
                        <p style="height: 15px; line-height: 15px; font-size: 8px; color: #6C8393" v-if="item.isUpdate">
                          {{ (item.updateTime.length === 0) ? item.createTime : item.updateTime }}
                        </p>
                      </div>
                      <div v-if="item.isUpdate">
                        <p style="min-height: 26px; max-height: 46px; line-height: 20px; font-size: 15px; text-align: left; color: #C4CDD4; padding: 2px">
                          {{ item.content }}
                        </p>
                        <div style="height: 24px; text-align: right" v-if="showCommentButton(item)">
                          <el-button-group>
                            <el-button icon="el-icon-delete" size="mini" @click="deleteComment(item, index)"></el-button>
                            <el-button icon="el-icon-edit" size="mini" @click="changeIsUpdate(item, index)"></el-button>
                          </el-button-group>
                        </div>
                      </div>
                      <div v-if="!item.isUpdate">
                        <el-input
                            type="textarea"
                            v-model="item.content"
                            maxlength="50"
                        >
                        </el-input>
                      </div>
                    </el-card>
                  </div>
                </div>
                <div class="center_right_bottom">
                  <el-card class="box-card" body-style="padding: 0">
                    <el-form ref="form" :model="form" size="medium">
                      <div class="card_top">
                        <el-avatar shape="square" icon="el-icon-user-solid" size="small"/>
                        <el-button icon="el-icon-check" @click="addComment" class="comment_submit"/>
                      </div>
                      <div class="card_contain">
                        <el-form-item>
                          <el-input
                              type="textarea"
                              :rows="2"
                              placeholder="Add a Comment(less than 50)"
                              v-model="form.comment"
                              maxlength="50"
                              show-word-limit
                          >
                          </el-input>
                        </el-form-item>
                      </div>
                    </el-form>
                  </el-card>
                </div>
              </div>
            </el-main>
          </el-container>
        </div>
  
        <el-dialog
            title="打分"
            :visible.sync="dialogVisible2"
            width="15%">
          <span>
            <el-input-number v-model="score" controls-position="right" :min="0" :max="100" size="large"></el-input-number>
          </span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible2 = false">取 消</el-button>
            <el-button type="primary" @click="submitStatus">确 定</el-button>
          </span>
        </el-dialog>
      </el-container>
  
    </el-container>
  </template>
  
  <script>
  import logo from "../../assets/cgyun_logo.png";
  import axios from "axios"
  import store from "../../store";
  import {mapGetters} from 'vuex'
  import drawImage from "../../components/drawImage.vue";
//   import drawVideo from "../../components/drawVideo.vue";
  import Vue from "vue"
  
  export default {
    name: "review",
    store,
    components: {
      drawImage,
    //   drawVideo,
    },
    // inject:['reload'],
    data() {
      return {
        // projectName: "xxx",
        // reviewName: "abc-Review",
        // role: "Teacher",
        // alias: "aaa",
        logo: logo,
        mediaList: [],
        fit: 'contain',
        isShowList: true,
        isShowComment: true,
        form: {
          comment: '',
        },
        isImage: false,
        isVideo: false,
        comments: {},
        dialogVisible2: false,
        mediaName: null,
        mediaType: null,
        tableHeight: window.innerHeight - 100 + "px",
        score: 0,
      };
    },
    methods: {
      submitStatus() {
        axios.post("/api/cgTask/submitStatus", {
          "remote_task_id": this.reviewId,
          "action": "approve",
          "score": this.score,
          "url": this.callbackUrl
        }).then(res => {
          if (res.data.result === 'success') {
            this.dialogVisible2 = false
            this.$message({
              message: '提交成绩成功',
              type: 'success'
            });
          } else
            this.$message({
              message: '提交成绩失败',
              type: 'error'
            });
        }).catch(err => console.log(err.response));
      },
      doBack() {
        axios.post("/api/cgTask/submitStatus", {
          "remote_task_id": this.reviewId,
          "action": "reject",
          "score": -2,
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
      },
      shareLink() {
        let url = this.link;
        let oInput = document.createElement('input');
        oInput.value = url;
        document.body.appendChild(oInput);
        oInput.select(); // 选择对象;
        document.execCommand("Copy"); // 执行浏览器复制命令
        this.$message({
          message: '复制成功',
          type: 'success'
        });
        oInput.remove()
      },
      toIndex() {
        store.commit('setReviewId', '')
        store.commit('setReviewName', '')
        store.commit('setMediaIdList', '')
        store.commit('setMediaId', '')
        this.$router.push({path: '/index'});
      },
      updateComment(item, index){
        axios.post(
            "/api/comment/updateComment", {
              "id": item._id,
              "content": item.content
            }
        ).then((res) => {
          if (res.data.type === 1) {
            this.$message({
              showClose: true,
              message: "评论修改成功",
              type: "success"
            })
            item.updateTime = res.data.info.time
            item.isUpdate = !item.isUpdate
            Vue.set(this.comments, index, item)
          }
        }).catch(err => console.log(err));
      },
      changeIsUpdate(item, index) {
        item.isUpdate = !item.isUpdate
        Vue.set(this.comments, index, item)
      },
      showCommentButton(item) {
        return item.user.userId === this.userId;
      },
      changeIsShowList() {
        this.isShowList = !this.isShowList;
      },
      handleCurrentChange(val) {
        console.log("handleCurrentChange",val);
        store.commit("setMediaId", val._id)
        store.commit("setFileId", val.fileId)
        store.commit("setType", val.type)
        this.mediaName = val.name
        this.mediaType = val.type
        this.form.comment = ''
        if (val.type.split("/")[0] === "image") {
          this.isImage = true
          this.isVideo = false
        } else if (val.type.split("/")[0] === "video") {
          this.isImage = false
          this.isVideo = true
        }
      },
      deleteMedia(index, row) {
        axios.post(
            "/api/media/deleteMedia",
            {"id": row._id, "fileId": row.fileId, "reviewId": this.reviewId},
        ).then((res) => {
          if (res.data === 1) {
            this.$message({
              showClose: true,
              message: row.name + " 删除成功",
              type: "success"
            })
            this.mediaList.splice(index, 1)
          } else
            this.$message({
              showClose: true,
              message: row.name + " 删除失败",
              type: "error"
            })
        }).catch(err => console.log(err));
      },
      changeIsShowComment() {
        this.isShowComment = !this.isShowComment;
      },
      getComment() {
        // axios.get(
        //     "http://localhost:3000//api/comment/getComment",
        //     {params: {mediaId: this.mediaId}},
        // ).then((res) => {
        //   this.comments = res.data
        //   for (let i = 0; i < this.comments.length; i++)
        //     this.comments[i].isUpdate = true
        // }).catch(err => console.log(err));
      },
      addComment() {
        let list = {
          "user": {"userId": this.userId, "userName": this.alias},
          "mediaId": this.mediaId,
          "content": this.form.comment,
        }
        axios.post(
            "http://localhost:3000/api/comment/addComment", list
        ).then((res) => {
          if (res.data.type === 1) {
            this.$message({
              showClose: true,
              message: "评论成功",
              type: "success"
            })
            this.comments.push({
              "content": this.form.comment,
              "createTime": res.data.info.time,
              "mediaId": this.mediaId,
              "updateTime": '',
              "user": {"userId": this.userId, "userName": this.alias},
              "_id": res.data.info.id
            })
            this.form.comment = ''
          }
        }).catch(err => console.log(err));
      },
      deleteComment(item, index) {
        this.$confirm('此操作将永久删除该评论, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          axios.post(
              "/api/comment/deleteComment", {"_id": item._id}
          ).then((res) => {
            if (res.data === 1) {
              this.$message({
                showClose: true,
                message: "删除评论成功",
                type: "success"
              })
              this.comments.splice(index, 1)
            } else
              this.$message({
                type: 'error',
                message: '删除失败'
              });
          }).catch(err => console.log(err));
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      getMediaList() {        
        console.log(this.mediaIdList)
        return new Promise((resolve, reject) => {
          axios.post(
              "http://localhost:3000/api/media/getReviewMedia",
              {"id": ["658bdf2a06b04d7e3442eefc","658beed1a1411e13ec330300","658bf736ccea145e08bdf361"]},
          ).then((res) => {
            resolve(res.data);
          }).catch(err => reject(err.data)); 
        })
      },
    //   onResize() {
    //     // console.log(123)
    //     this.reload()
    //   },
    },
    mounted() {
      // console.log(this.callbackUrl)
      window.addEventListener('resize', this.onResize)
      store.commit("setZoom", 1 / window.devicePixelRatio)
      // if (window.sessionStorage.getItem("token") !== null)
        this.getMediaList().then(data => {
          this.mediaList = data;
          console.log(data)
          store.commit("setMediaId", this.mediaList[0]._id)
          store.commit("setFileId", this.mediaList[0].fileId)
          store.commit("setType", this.mediaList[0].type)
          if (this.mediaList[0].type.split("/")[0] === "image") {
            this.isImage = true
            this.isVideo = false
          } else if (this.mediaList[0].type.split("/")[0] === "video") {
            this.isImage = false
            this.isVideo = true
          }
          this.mediaName = this.mediaList[0].name
          this.mediaType = this.mediaList[0].type
          this.getComment()
        });
      // else
      //   window.location.href = 'http://cgyun.cn'
    },
    computed: {
      ...mapGetters([
        'mediaIdList', 'userId', 'mediaId', 'projectName', 'reviewName', 'reviewId', 'link', 'role', 'alias', 'callbackUrl'
      ])
    },
    watch: {
      '$store.state.mediaId': function () {
        this.getComment()
      }
    }
  }
  </script>
  
  <style>
  .contain {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #E7EEF3;
    padding: 0;
    margin: 0;
    overflow-y: auto;
  }
  .contain::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }
  
  .el-header {
    color: #333;
    background-color: #1F272C;
  
    text-align: left;
    padding-top: 10px;
  
    img {
      margin-left: -10px;
      width: 37px;
      height: 37px;
      float: left;
    }
  
    .header_folder {
      background-color: #263238;
      border: none;
      color: #8397A1;
      float: left;
    }
  
    .proName {
      width: 200px;
      height: 40px;
      color: #61808F;
      font-size: 15px;
      line-height: 20px;
      font-family: sans-serif;
      float: right;
    }
  
    .header_share {
      background-color: #263238;
      border: none;
      color: #8397A1;
      float: right;
    }
  
    .header_head {
      border: none;
      width: 40px;
      height: 40px;
      float: right;
    }
  }
  
  .center {
    flex: 1;
    background-color: #1F272C;
    display: flex;
    flex-direction: column;
  
    .center_head {
      height: 30px;
      width: 100%;
      display: flex;
      flex-direction: row;
      margin-top: 1px;
      margin-bottom: 1px;
  
      .center_head_left {
        width: 250px;
        /*background-color: red;*/
        overflow: auto;
        overflow-x: hidden;
  
        .el-button {
          width: 40px;
          height: 30px;
          padding: 8px;
          background-color: #28343B;
          color: #96A6AF;
          border: none;
        }
      }
  
      .center_head_center {
        flex: 1;
        /*background-color: green;*/
      }
  
      .center_head_right {
        width: 40px;
  
        .infoIcon {
          background-color: #263238;
          border: none;
          color: #8397A1;
          font-size: 15px;
          padding: 8px;
          width: 40px;
        }
      }
  
      .infoIcon {
        background-color: #263238;
        border: none;
        color: #8397A1;
        font-size: 15px;
        padding: 8px;
      }
    }
  
    .center_main {
      background-color: #E9EEF3;
      width: 100%;
      height: 100%;
      flex: 1;
  
      .el-container {
        height: 100%;
        width: 100%;
  
        a {
          text-decoration: none;
          color: #8397A1;
        }
  
        .el-aside {
          .center_left {
            width: 100%;
            height: 100%;
            background-color: #151A1D;
            opacity: 0.8;
          }
  
          /deep/ .el-table__body-wrapper::-webkit-scrollbar{
            width: 5px;
            background-color: #151A1D;
          }
          /deep/ .el-table__body-wrapper {
            background-color: #151A1D;
          }
          /deep/ .el-table__body-wrapper::-webkit-scrollbar-thumb{
            border-radius: 2px;
            height: 50px;
            background: black;
            width: 0;
          }
          /deep/ .el-table__body-wrapper::-webkit-scrollbar-track{
            box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
            border-radius: 2px;
            background: rgba(0,0,0,0.4);
            width: 0;
          }
  
          .delButton {
            padding: 3px;
            float: right;
            position: absolute;
            top: 5px;
            right: 6px;
            background-color: transparent;
            border: 0;
          }
        }
  
        .el-main {
          color: #333;
          text-align: center;
          display: flex;
          flex-direction: row;
          padding: 0;
          background-color: black;
  
          .center_center {
            flex: 1;
            height: 100%;
            border-left: 1px solid #1F272C;
            border-right: 1px solid #1F272C;
          }
  
          .center_right {
            width: 270px;
            height: 100%;
            display: flex;
            flex-direction: column;
            background-color: #161B1E;
  
            .center_right_top {
              flex: 1;
  
              .el-card {
                min-height: 90px;
                max-height: 150px;
                background-color: #2B343B;
                border: 0;
                margin: 2px;
              }
  
              /deep/ .el-card__header {
                border: 0;
                height: 40px;
                padding: 0;
              }
  
              /deep/ .el-card__body {
                padding: 0;
              }
  
              .el-button {
                padding: 5px;
                color: #6C8393;
                background-color: transparent;
                border: 0;
  
                :hover {
                  color: white;
                }
              }
            }
  
            .center_right_bottom {
              height: 100px;
  
              .box-card {
                width: 268px;
                height: 100px;
                position: absolute;
                bottom: 0;
                right: 0;
                background-color: #648493;
  
                .card_top {
                  height: 38px;
                  width: 268px;
  
                  .comment_submit {
                    padding: 0;
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    background-color: #648493;
                    color: black;
                    border: none;
                  }
  
                  .el-avatar {
                    position: absolute;
                    top: 5px;
                    left: 5px;
                  }
                }
  
                .card_contain {
                  height: 57px;
                  width: 260px;
                  margin-left: 3px;
                  background-color: #000000;
                  border-radius: 5px;
                  color: #516A75;
  
                  /deep/ .el-input__count {
                    background-color: transparent;
                  }
  
                  /deep/ .el-textarea__inner {
                    background-color: #000000;
                    line-height: 1.7;
                    color: #5C6266;
                    border: none;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  .el-table::before {
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0;
  }
  
  </style>
  