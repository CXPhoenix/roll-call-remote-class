import {
    app,
    auth,
    apiKey,
} from './functions/firebase.config.js'

import axios from 'axios'

const google = new auth.GoogleAuthProvider
google.addScope('https://www.googleapis.com/auth/classroom.courses.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.profile.emails')

const loginBtn = document.querySelector('#loginBtn')
const appArea = document.querySelector('#app')
let courseId = null
let token = null
let studentList = []

//events
loginBtn.addEventListener('click', login)
appArea.addEventListener('loginAccess', () => {
    getClassList(apiKey)
})
appArea.addEventListener('getCourse', () => {
    studentList = []
    getStudents(courseId, apiKey)
})

appArea.addEventListener('getNextPageData', (e) => {
    getNextPageStudents(courseId, apiKey, e.detail.nextPageToken)
})

appArea.addEventListener('getAllStudent', () => {
    console.log(studentList)
})
//functions
function login() {
    app.auth().signInWithPopup(google).then((res) => {
        token = res.credential.accessToken
        appArea.dispatchEvent(new CustomEvent('loginAccess'))
    })
}

function getClassList(key) {
    axios({
        url: 'https://classroom.googleapis.com/v1/courses?teacherId=me&key=' + key,
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: 'application/json'
        }
    }).then((res) => {
        console.log(Array.from(res.data.courses))
        // console.log(res.data)
        const course = Array.from(res.data.courses).filter((course) => course.name === "109-2 資訊科技 211")
        // console.log(course[0].id)
        courseId = course[0].id
        appArea.dispatchEvent(new CustomEvent('getCourse'))
    }).catch((error) => {
        console.log(error)
        alert('出現錯誤，請重新登入，或與管理員聯繫')
        // window.location.replace('./index.html')
    })
}

function getStudents(theCourseId, key) {
    axios({
        url: 'https://classroom.googleapis.com/v1/courses/' + theCourseId + '/students?&key=' + key,
        headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json"
        }
    }).then(function (res) {
        console.log(res.data)
        studentList.push(...res.data.students)
        if (res.data.nextPageToken) {
            appArea.dispatchEvent(new CustomEvent('getNextPageData', {
                detail: {
                    nextPageToken: res.data.nextPageToken
                }
            }))
        } else {
            appArea.dispatchEvent(new CustomEvent('getAllStudent'))
        }
    }).catch(function (error) {
        console.log(error)
        alert('出現了一點問題，請試著重新登入')
    })
}

function getNextPageStudents(theCourseId, key, theNextPageToken) {
    axios({
        url: 'https://classroom.googleapis.com/v1/courses/' + theCourseId + '/students?pageSize=30&pageToken=' + theNextPageToken + '&key=' + key,
        headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json"
        }
    }).then(function (res) {
        studentList.push(...res.data.students)
        if (res.data.nextPageToken) {
            appArea.dispatchEvent(new CustomEvent('getNextPageData', {
                detail: {
                    nextPageToken: res.data.nextPageToken
                }
            }))
        } else {
            appArea.dispatchEvent(new CustomEvent('getAllStudent'))
        }
    }).catch(function (error) {
        console.log(error)
        alert('出現了一點問題，請試著重新登入')
    })
}