<template>
    <div>
        <div style="height: 40px;">
            <div style="float: left; margin: 30px 0 30px 0; font-size:26px">我的场次({{ sessionsList.length }})</div>
            <el-dropdown>
                <el-button type="primary"  style="float: left; margin: 30px 0 0 80px; border-radius: 50px">
                    {{ this.projectName }}
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="(item, index) in this.teamProjectsList" :key="index" @click.native="handleSelect(item)">
                        {{ item.name }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <el-table :data="sessionsList" border tooltip-effect="dark" style="width: 100%;">
            <el-table-column prop="id" label="序号" width="50"/>
            <el-table-column prop="name" label="场次名" width="150"/>
            <el-table-column prop="projectName" label="项目名" width="150"/>
            <el-table-column prop="manager" label="管理员" width="100"/>
            <el-table-column prop="designer" label="设计师" width="100"/>
            <el-table-column prop="designSoftware" label="设计软件" width="100"/>
            <el-table-column prop="createTime" label="创建日期" width="250"/>
            <el-table-column label="操作" width="550">
                <template slot-scope="scope">
                    <el-button type="text" @click="toShots(scope.row)">镜头</el-button>
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
        sessionsList: []
      };
    },
    computed: {
        ...mapGetters([
            'projectName', 'projectId', 'currentTeam', 'currentUser', 'teamProjectsList'
        ])
    },
    mounted() {
        this.getSessionsByProjectId()
    },
    methods: {
        getSessionsByProjectId() {
            let projectId = this.projectId
            console.log("start getSessionsByProjectId, projectId: ", projectId)
            axios.get(
                "http://localhost:3000/api/session/getSessionsByProjectId", {
                    params: {projectId: projectId},
                }
            ).then((res) => {
                res.data.forEach((item,index)=>{
                    res.data[index].id = index+1
                })
                this.sessionsList = res.data
            }).catch(err => console.log(err));
        },
        handleSelect(item) {
            store.commit("setProjectName", item.name)
            store.commit("setProjectId", item._id)
            this.getSessionsByProjectId()
        },
        toShots(item) {
            console.log("toShots item: ", item);
            store.commit("setProjectName", item.projectName)
            store.commit("setProjectId", item.projectId)
            axios.get(
                "http://localhost:3000/api/session/getSessionsByProjectId", {
                    params: {projectId: item.projectId},
                }).then((res) => {
                    store.commit("setCurrentSession", res.data.length > 0 ? res.data[0] : null)
            }).catch(err => console.log(err));
            this.$router.push({path: '/myShots/index'});
        }
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
  