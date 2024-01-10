<template>
    <div>
        <div>
            <div style="margin: 0 0 30px 0; font-size:26px; padding-top:30px;">我的审验任务列表({{ reviewTasksLength }})</div>
        </div>
        <div style="height: 40px; margin: 30px 0 10px 0;">
            <ul>
                <li class="li-tab" v-for="(item,index) in tabsParam" @click="toggleTabs(index)" :class="{active:index == nowIndex}" :key="index"
                    style="height: 40px; margin-right:30px; width: 100px; font-size: 20px" > 
                    {{item}} 
                </li>
            </ul>
        </div>
        <el-table :data="waitReviewTasksList" border tooltip-effect="dark" style="width: 100%;" v-show="nowIndex === 0">
            <el-table-column prop="id" label="序号" width="50"/>
            <el-table-column prop="name" label="任务名" width="150"/>
            <el-table-column prop="sessionName" label="场次名" width="150"/>
            <el-table-column prop="projectName" label="项目名" width="150"/>
            <el-table-column prop="stage" label="阶段" width="100"/>
            <el-table-column prop="state" label="状态" width="100"/>
            <el-table-column label="操作" min-width="50%">
                <template slot-scope="scope">
                    <el-button type="text" @click="submitTask(scope.row)">审验</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-table :data="participantReviewTasksList" border tooltip-effect="dark" style="width: 100%;" v-show="nowIndex === 1">
            <el-table-column prop="id" label="序号" width="50"/>
            <el-table-column prop="name" label="任务名" width="150"/>
            <el-table-column prop="sessionName" label="场次名" width="150"/>
            <el-table-column prop="projectName" label="项目名" width="150"/>
            <el-table-column prop="stage" label="阶段" width="100"/>
            <el-table-column prop="state" label="状态" width="100"/>
            <el-table-column label="操作" min-width="50%">
                <template slot-scope="scope">
                    <el-button type="text" @click="submitTask(scope.row)">审验</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
  
<script>
import {mapGetters} from "vuex";
import store from "../../store";
import axios from "axios";
import { th } from "date-fns/locale";
import { it } from "node:test";
  export default {
    name: "myAssets",
    store,
    data() {
      return {
        tabsParam: ['待我审批', '我参与的'],
        nowIndex: 0,
        waitReviewTasksList: [],
        participantReviewTasksList: [],
        reviewTasksLength: 0,
      };
    },
    computed: {
        ...mapGetters([
            'projectName', 'projectId', 'currentTeam', 'currentUser', 'teamProjectsList'
        ])
    },
    mounted() {
        this.getTasksByReviewerId()
    },
    methods: {
        toggleTabs: function (index) {
            this.nowIndex = index;
            if (index == 0) {
                this.reviewTasksLength = this.waitReviewTasksList.length
            } else {
                this.reviewTasksLength = this.participantReviewTasksList.length
            }
        },
        getTasksByReviewerId() {
            let userId = "657fdd5e0d372068c4ec37f2"
            axios.get(
                "http://localhost:3000/api/task/getTasksByReviewerId", {
                    params: {
                        reviewerId: "657fdd5e0d372068c4ec37f2",
                        state: "审验"
                    },
                }
            ).then((res) => {
                res.data.forEach((item,index)=>{
                    res.data[index].id = index + 1 
                })
                this.waitReviewTasksList = res.data
                this.reviewTasksLength = this.waitReviewTasksList.length
                console.log(res.data)
            }).catch(err => console.log(err));
            axios.get(
                "http://localhost:3000/api/task/getTasksByReviewerId", {
                    params: {
                        reviewerId: "657fdd5e0d372068c4ec37f2",
                        state: ""
                    },
                }
            ).then((res) => {
                res.data.forEach((item,index)=>{
                    res.data[index].id = index + 1 
                })
                this.participantReviewTasksList = res.data
                console.log(res.data)
            }).catch(err => console.log(err));
        },
        submitTask(row) {
            console.log(row)
        },
    },
  }
  </script>
  
  <style scoped>
    .image {    
        width: 50px;    
        display: block;  
        height: 50px;
    } 
    .el-form .el-form-item {
        margin-left: 100px
    }
    .active {
        color: #0099ff;
    }
    .li-tab {
        width: 8%;
        height: 100px;
        border: 10px;
        display: inline-block;
        text-align: center;
        font-size: 22px;
        border-bottom: none; /* 初始状态没有下边框 */
    }
    li:active {
        border-bottom:2px solid #0099ff; 
    }
  </style>
  