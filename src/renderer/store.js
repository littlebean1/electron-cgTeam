import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        userId: "",
        userName: "",
        currentUser: {},
        alias: "",
        role: "User",
        reviewId: "",
        reviewName: "",
        projectId: "",
        projectName: "",
        reviews: [],
        teams: [],
        teamProjectsList: [],
        currentTeam: {},
        currentSession: {},
        collections: [],
        mediaIdList: [],
        mediaId: "",
        fileId: "",
        projectList: "",
        projectIndex: 0,
        zoom: 0,
        link: "",
        type: "",
        callbackUrl: ""
    },
    mutations: {
        setUser (state, user) {
            // console.log(user)
            state.userId = user._id.toString()
            localStorage.setItem("userId", user._id.toString())
            state.userName = user.username
            localStorage.setItem("userName", user.username)
            state.alias = user.alias
            localStorage.setItem("alias", user.alias)
            if (user.role === "") {
                state.role = "User"
                localStorage.setItem("role", "User")
            } else {
                state.role = user.role
                localStorage.setItem("role", user.role)
            }
        },
        setReviewId (state, reviewId) {
            state.reviewId = reviewId
            localStorage.setItem("reviewId", reviewId)
        },
        setReviewName (state, reviewName) {
            state.reviewName = reviewName
            localStorage.setItem("reviewName", reviewName)
        },
        setProjectId (state, projectId) {
            state.projectId = projectId
            localStorage.setItem("projectId", projectId)
        },
        setProjectIndex (state, projectIndex) {
            state.projectIndex = projectIndex
            localStorage.setItem("projectIndex", projectIndex)
        },
        setProjectName (state, projectName) {
            state.projectName = projectName
            localStorage.setItem("projectName", projectName)
        },
        setReviews (state, reviews) {
            state.reviews = reviews
            localStorage.setItem("reviews", JSON.stringify(reviews))
        },
        setTeams (state, teams) {
            state.teams = teams
            localStorage.setItem("teams", JSON.stringify(teams))
        },
        setTeams (state, teams) {
            state.teams = teams
            localStorage.setItem("teams", JSON.stringify(teams))
        },
        setTeamProjectsList (state, teamProjectsList) {
            state.teamProjectsList = teamProjectsList
            localStorage.setItem("teamProjectsList", JSON.stringify(teamProjectsList))
        },
        setCurrentTeam (state, currentTeam) {
            state.currentTeam = currentTeam
            localStorage.setItem("currentTeam", JSON.stringify(currentTeam))
        },
        setCurrentSession (state, currentSession) {
            state.currentSession = currentSession
            localStorage.setItem("currentSession", JSON.stringify(currentSession))
        },
        setCurrentUser (state, currentUser) {
            state.currentUser = currentUser
            localStorage.setItem("currentUser", JSON.stringify(currentUser))
        },
        setCollections (state, collections) {
            state.collections = collections
            localStorage.setItem("collections", JSON.stringify(collections))
        },
        setMediaIdList (state, mediaIdList) {
            state.mediaIdList = mediaIdList
            localStorage.setItem("mediaIdList", JSON.stringify(mediaIdList))
        },
        setMediaId (state, mediaId) {
            state.mediaId = mediaId
            localStorage.setItem("mediaId", mediaId)
        },
        setFileId (state, fileId) {
            state.fileId = fileId
            localStorage.setItem("fileId", fileId)
        },
        setProjectList (state, projectList) {
            state.projectList = projectList
            localStorage.setItem("projectList", JSON.stringify(projectList))
        },
        setZoom (state, zoom) {
            state.zoom = zoom
            localStorage.setItem("zoom", zoom)
        },
        setLink (state, link) {
            state.link = link
            localStorage.setItem("link", link)
        },
        setType (state, type) {
            state.type = type
            localStorage.setItem("type", type)
        },
        setCallbackUrl (state, callbackUrl) {
            state.callbackUrl = callbackUrl
            localStorage.setItem("callbackUrl", callbackUrl)
        },
    },
    getters: {
        userName(state) {
            if (localStorage.getItem("userName"))
                state.userName = localStorage.getItem("userName")
            return state.userName
        },
        userId(state) {
            if (localStorage.getItem("userId"))
                state.userId = localStorage.getItem("userId")
            return state.userId
        },
        role(state) {
            if (localStorage.getItem("role"))
                state.role = localStorage.getItem("role")
            return state.role
        },
        alias(state) {
            if (localStorage.getItem("alias"))
                state.alias = localStorage.getItem("alias")
            return state.alias
        },
        reviewId(state) {
            if (localStorage.getItem("reviewId"))
                state.reviewId = localStorage.getItem("reviewId")
            return state.reviewId
        },
        reviewName(state) {
            if (localStorage.getItem("reviewName"))
                state.reviewName = localStorage.getItem("reviewName")
            return state.reviewName
        },
        projectId(state) {
            if (localStorage.getItem("projectId"))
                state.projectId = localStorage.getItem("projectId")
            return state.projectId
        },
        projectIndex(state) {
            if (localStorage.getItem("projectIndex"))
                state.projectIndex = localStorage.getItem("projectIndex")
            return state.projectIndex
        },
        projectName(state) {
            if (localStorage.getItem("projectName"))
                state.projectName = localStorage.getItem("projectName")
            return state.projectName
        },
        reviews(state) {
            if (localStorage.getItem("reviews"))
                state.reviews = JSON.parse(localStorage.getItem("reviews"))
            return state.reviews
        },
        teams(state) {
            if (localStorage.getItem("teams"))
                state.teams = JSON.parse(localStorage.getItem("teams"))
            return state.teams
        },
        teamProjectsList(state) {
            if (localStorage.getItem("teamProjectsList"))
                state.teamProjectsList = JSON.parse(localStorage.getItem("teamProjectsList"))
            return state.teamProjectsList
        },
        currentTeam(state) {
            if (localStorage.getItem("currentTeam"))
                state.currentTeam = JSON.parse(localStorage.getItem("currentTeam"))
            return state.currentTeam
        },
        currentSession(state) {
            if (localStorage.getItem("currentSession"))
                state.currentSession = JSON.parse(localStorage.getItem("currentSession"))
            return state.currentSession
        },
        currentUser(state) {
            if (localStorage.getItem("currentUser"))
                state.currentUser = JSON.parse(localStorage.getItem("currentUser"))
            return state.currentUser
        },
        collections(state) {
            if (localStorage.getItem("collections"))
                state.collections = JSON.parse(localStorage.getItem("collections"))
            return state.collections
        },
        mediaIdList(state) {
            if (localStorage.getItem("mediaIdList"))
                state.mediaIdList = JSON.parse(localStorage.getItem("mediaIdList"))
            return state.mediaIdList
        },
        mediaId(state) {
            if (localStorage.getItem("mediaId"))
                state.mediaId = localStorage.getItem("mediaId")
            return state.mediaId
        },
        fileId(state) {
            if (localStorage.getItem("fileId"))
                state.fileId = localStorage.getItem("fileId")
            return state.fileId
        },
        projectList(state) {
            if (localStorage.getItem("projectList"))
                state.projectList = JSON.parse(localStorage.getItem("projectList"))
            return state.projectList
        },
        zoom(state) {
            if (localStorage.getItem("zoom"))
                state.zoom = localStorage.getItem("zoom")
            return state.zoom
        },
        link(state) {
            if (localStorage.getItem("link"))
                state.link = localStorage.getItem("link")
            return state.link
        },
        type(state) {
            if (localStorage.getItem("type"))
                state.type = localStorage.getItem("type")
            return state.type
        },
        callbackUrl(state) {
            if (localStorage.getItem("callbackUrl"))
                state.callbackUrl = localStorage.getItem("callbackUrl")
            return state.callbackUrl
        },
    },
    actions: {}
})
