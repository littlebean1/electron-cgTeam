<template>
    <div>
        <div style="height: 40px;">
            <div style="float: left; margin: 30px 0 30px 0; font-size:26px">渲染作业信息：</div>
        </div>
        <el-table :data="reviewTasksList" border tooltip-effect="dark" style="width: 100%;">
            <el-table-column prop="id" label="序号" width="50"/>
            <el-table-column prop="name" label="任务名" width="150"/>
            <el-table-column prop="sessionName" label="场次名" width="150"/>
            <el-table-column prop="projectName" label="项目名" width="150"/>
            <el-table-column prop="stage" label="阶段" width="100"/>
            <el-table-column prop="state" label="状态" width="100"/>
            <el-table-column label="操作" min-width="50%">
                <template slot-scope="scope">
                    <el-button type="text" @click="submitTask(scope.row)">提交</el-button>
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
        reviewTasksList: []
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
        getTasksByReviewerId() {
            let userId = "657fdd5e0d372068c4ec37f2"
            axios.get(
                "http://localhost:3000/api/task/getTasksByReviewerId", {
                    params: {reviewerId: "657fdd5e0d372068c4ec37f2"},
                }
            ).then((res) => {
                res.data.forEach((item,index)=>{
                    res.data[index].id = index + 1 
                })
                this.reviewTasksList = res.data
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
  </style>
  