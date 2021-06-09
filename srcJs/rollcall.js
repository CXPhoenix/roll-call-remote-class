import {
    app,
    apiKey,
    db
} from './functions/firebase.config.js'
import axios from 'axios'
import {
    studentRollCall
} from './functions/database.js'

const displayName = window.sessionStorage.getItem('displayName')
const token = window.sessionStorage.getItem('token')
const courseId = window.sessionStorage.getItem('rollCallCourse')
const timeStamp = window.sessionStorage.getItem('rollCallTimestamp')
const state = window.sessionStorage.getItem('state')

const rollCallArea = document.querySelector('#rollCallArea')
const courseNameLoader = document.querySelector('#courseNameLoader')
const rollCallBtn = document.querySelector('#rollCallBtn')
let userId = null
let timeout = null
let alreadyRollCall = false

// on load event
window.addEventListener('load', function () {
    checkSignIn()
    // getRollCallTimeout(courseId, timeStamp)
    getUserId()
})

// from checkSignIn() CustomEvent
window.addEventListener('login-success', function () {
    document.querySelector('#userName').innerText = displayName
    checkInCourse(courseId)
    getRollCallTimeout(courseId, timeStamp)
    if (window.localStorage.getItem(courseId) === String(timeStamp)) {
        rollCallBtn.classList.add('disabled')
        rollCallAbandom('哼哼，你已經點過名囉～')
        alreadyRollCall = true
    } else {
        window.localStorage.clear()
    }
    // getCourseName(courseId)
})

// for test
// window.addEventListener('rollCallError', function () {
//     alert('登入失敗：\n你是不是沒有得到正確的網址？\n請詢問你的任課老師喔～')
//     window.location.replace('./index.js')
// })

// from checkSignIn() CustomEvent
window.addEventListener('login-fail', function () {
    alert('請務必一定要登入喔～')
    window.location.replace('./index.js')
})

//from getUserId() CustomEvent
window.addEventListener('getUserId', (e) => {
    userId = e.detail.userId
})

//from getRollCallTimeout() CustomEvent
window.addEventListener('getTimeout', (e) => {
    timeout = e.detail.timeout
    const now = new Date().getTime()
    if (now > timeout) {
        rollCallAbandom('點名時間已經過囉～')
    }
})

//from checkInCourse() CustomEvent
rollCallArea.addEventListener('checked', function () {
    getCourseName(courseId)
})

// show roll call btn
//from getCourseName() CustomEvent
rollCallArea.addEventListener('onload', function () {
    courseNameLoader.style.display = 'none'
    document.querySelector('#courseName').innerText = window.sessionStorage.getItem('rollCallCourseName')
    rollCallArea.style.display = 'block'
})

// roll call
rollCallBtn.addEventListener('click', function () {
    const nowTime = new Date()
    const date = checkTimeFormate(nowTime.getMonth() + 1) + '/' + checkTimeFormate(nowTime.getDate()) + ' (' + DayFormate(nowTime.getDay()) + ')'
    const time = checkTimeFormate(nowTime.getHours()) + ':' + checkTimeFormate(nowTime.getMinutes())
    const timestamp = nowTime.getTime()
    let showTime = date + ' ' + time
    if (alreadyRollCall) {
        alert('拍謝啦～就算破解也沒用～')
        return
    }
    const rollCallComfirm = window.confirm(['按下點名鍵時間為：', showTime, '確認是否點名？'].join('\n'))
    if (rollCallComfirm) {
        if (timestamp < timeout) {
            studentRollCall(courseId, timeStamp, userId, timestamp)
            alert('點名成功，點名時間為：' + showTime)
            rollCallAbandom('恭喜你點名成功囉～')
            window.localStorage.setItem(courseId, timeStamp)
            return
        }
        alert('點名時間已經過囉～')
        rollCallAbandom('點名時間已經過囉～')
    }
})

//fucnctions
function checkSignIn() {
    app.auth().onAuthStateChanged((user) => {
        // console.log(user)
        if (user) {
            window.dispatchEvent(new CustomEvent('login-success'))
            return
        }
        window.dispatchEvent(new CustomEvent('login-fail'))
    })
}

function checkInCourse(theCourseId) {
    axios({
        url: 'https://classroom.googleapis.com/v1/courses/' + theCourseId + '/students/me' + '?key=' + apiKey,
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: 'application/json'
        }
    }).then((res) => {
        window.sessionStorage.setItem('userId', res.data.userId)
        rollCallArea.dispatchEvent(new CustomEvent('checked'))
    }).catch((error) => {
        console.log(error)
        alert('你似乎不在課程中，或是你的登入有問題！\n請重新登入！')
        window.location.replace('https://www.google.com')
    })
}

function getCourseName(theCourseId) {
    axios({
        url: 'https://classroom.googleapis.com/v1/courses/' + theCourseId + '?key=' + apiKey,
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: 'application/json'
        }
    }).then((res) => {
        window.sessionStorage.setItem('rollCallCourseName', res.data.name)
        rollCallArea.dispatchEvent(new CustomEvent('onload'))
    }).catch((error) => {
        console.log(error)
        alert('發生了一些錯誤，請重新登入，或聯繫管理員')
        window.location.replace('./index.html')
    })
}

function getUserId() {
    axios({
        url: 'https://classroom.googleapis.com/v1/userProfiles/me?key=' + apiKey,
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: 'application/json'
        }
    }).then((res) => {
        // console.log(res.data.id)
        window.dispatchEvent(new CustomEvent('getUserId', {
            detail: {
                userId: res.data.id
            }
        }))
    }).catch((error) => {
        console.log(error)
        alert('發生了一些錯誤，請重新登入，或聯繫管理員')
        window.location.replace('./index.html')
    })
}

function getRollCallTimeout(theCourseId, theTimestamp) {
    const dbRef = db.collection('CourseRollCall').doc(theCourseId).collection(String(theTimestamp)).doc('info')
    dbRef.get().then((doc) => {
        if (doc.exists) {
            const limitTime = doc.data().timeout
            window.dispatchEvent(new CustomEvent('getTimeout', {
                detail: {
                    timeout: limitTime
                }
            }))
        }
    })
}

function rollCallAbandom(msg) {
    const timeoutArea = document.createElement('div')
    timeoutArea.className = 'text-center'

    const timeoutSpan = document.createElement('span')
    timeoutSpan.className = 'fs-2 text-danger border border-danger border-2 p-2'
    timeoutSpan.innerText = msg

    timeoutArea.appendChild(timeoutSpan)
    rollCallArea.appendChild(timeoutArea)

    rollCallBtn.classList.add('disabled')
}

function checkTimeFormate(i) {
    if (i < 10) {
        return '0' + i
    }
    return i
}

function DayFormate(day) {
    const dayTransfer = {
        1: '一',
        2: '二',
        3: '三',
        4: '四',
        5: '五',
        6: '六',
        7: '日'
    }
    return dayTransfer[day]
}