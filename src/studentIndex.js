import {
    notificationAlert
} from './functions/ModalNotification.js'
import {
    loadThePage,
    onMount
} from './functions/loadPage.js'

import {
    apiKey,
    app,
    auth
} from './firebase-app/firebase.app.js'

import axios from 'axios'

import {
    routing
} from './functions/router.js'

//auth
const google = new auth.GoogleAuthProvider
google.addScope('https://www.googleapis.com/auth/classroom.courses.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.profile.emails')

const rollCallCourseId = routing()[0]
const courseRollCallTime = routing()[1]
const endCourseRollCall = false
if (routing.length === 3 && routing[2] == 'end') {
    const endCourseRollCall = true
}

if (!rollCallCourseId) {
    notificationAlert('錯誤，請與該課程老師聯繫', false, {
            title: 'ERROR',
            comfirm: '我知道了'
        })
        .then(
            window.location.href = 'https://www.google.com'
        )
}

function getUserProfile() {
    const user = app.auth().currentUser
    if (!user) {
        return false
    }
    return user
}

loadThePage('./components/login.html')

onMount('login').then(() => {
    const signInBtn = document.querySelector('#googleSignIn')
    signInBtn.addEventListener('click', () => {
        app.auth().signInWithPopup(google)
            .then((res) => {
                // console.log(res.user)
                window.sessionStorage.setItem('token', res.credential.accessToken)
                window.sessionStorage.setItem('email', res.user.email)
                notificationAlert(`${res.user.displayName} 歡迎回來`)
                    .then(() => {
                        loadThePage('./components/studentRollCall.html')
                    })
            })
    })
})

onMount('studentRollCall').then(() => {
    const rollcallArea = document.querySelector('#rollcallArea')
    const loadingIcon = document.querySelector('#loadingBar')
    const courseName = document.querySelector('#courseName')
    const rollcallBtn = document.querySelector('#rollcall')
    axios({
        url: 'https://classroom.googleapis.com/v1/courses/' + rollCallCourseId + '/students',
        headers: {
            Authorization: "Bearer " + window.sessionStorage.getItem('token'),
            Accept: "application/json"
        }
    }).then((res) => {
        // console.log(res.data.students)
        const inClass = res.data.students.filter((student) => {
            student.profile.emailAddress === window.sessionStorage.getItem('email')
        })
        // console.log(inClass)
        if (inClass.length === 0) {
            notificationAlert('趕快去問一下授課老師發生什麼事情！', false, {title: '你不在課程中耶！', comfirm: '我去問老師!'})
            .then(() => {
                loadThePage('./components/login.html')
            })
        }
    }).then(() => {
        axios({
            url: 'https://classroom.googleapis.com/v1/courses/' + rollCallCourseId,
            headers: {
                Authorization: "Bearer " + window.sessionStorage.getItem('token'),
                Accept: "application/json"
            }
        }).then((res) => {
            rollcallArea.dispatchEvent(new CustomEvent('readDone', {
                detail:{
                    courseName: res.data.name
                }
            }))
        }).catch((error) => {
            console.log(error)
            notificationAlert('課程抓取過程發生錯誤，請聯繫授課老師', false, {
                title: 'ERROR',
                comfirm: '我知道了'
            }).then(() => {
                loadThePage('./components/login.html')
            })
        })
    }).catch((error) => {
        console.log(error)
        notificationAlert('課程抓取過程發生錯誤，請聯繫授課老師', false, {
            title: 'ERROR',
            comfirm: '我知道了'
        }).then(() => {
            loadThePage('./components/login.html')
        })
    })
    rollcallArea.addEventListener('readDone', (e) => {
        courseName.innerText = e.detail.courseName
        loadingIcon.style.display = 'none'
        rollcallArea.style.display = 'block'
    })
    rollcallBtn.addEventListener('click', () => {
        let storageKey = 'rollcall-'+rollCallCourseId
        if (endCourseRollCall) {
            storageKey += '-end'
        }
        if (window.localStorage.getItem(storageKey) !== courseRollCallTime) {
            if (!endCourseRollCall) {
                window.localStorage.clear()
            }
            window.localStorage.setItem(storageKey, courseRollCallTime)
            loadThePage('./components/rollCallSuccess.html')
        } else {
            notificationAlert('你已經打過卡囉～（幫別人代打也算喔！）',false, {title: 'oops..發生錯誤了', comfirm: '我知道了'})
        }
    })
})

onMount('rollCallSuccess').then(() => {
    const successBtn = document.querySelector('#successBtn')
    successBtn.addEventListener('click', () => {
        window.location.href = 'https://www.google.com'
    })
})