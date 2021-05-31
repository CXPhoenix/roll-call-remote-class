import {
    apiKey,
    app,
    db
} from './functions/firebase.config.js'
import axios from 'axios'
import {
    createRollCall,
    setLastRollCall
} from './functions/database.js'

// init page elements
const loader = document.querySelector('#studentListLoader')
const functionButtons = document.querySelector('#functionButtons')
const studentListArea = document.querySelector('#studentList')
const rollCallTimeOut = document.querySelector('#rollCallTimeOut')
const lastRollCallTimeArea = document.querySelector('#lastRollCallTimeArea')
const lastRollCallTime = document.querySelector('#lastRollCallTime')
document.querySelector('#courseName').innerText = window.sessionStorage.getItem('courseName')

// init roll call btn
const courseStart = document.querySelector('#courseStart')

// init course info
const courseId = window.sessionStorage.getItem('courseId')
let state = false
let lastRollCall = null
let rollCallList = ['studentId']
getState(courseId)

// onload events
// from getState() CustomEvent
window.addEventListener('getState', (e) => {
    // state = e.detail.state
    lastRollCall = e.detail.lastRollCall
    if (lastRollCall) {
        const date = new Date(lastRollCall)
        const time = checkTimeFormate(date.getMonth() + 1) + '/' + checkTimeFormate(date.getDate()) + " (" + DayFormate(date.getDay()) + ") " + checkTimeFormate(date.getHours()) + ':' + checkTimeFormate(date.getMinutes())
        lastRollCallTime.innerText = time
    } else {
        lastRollCallTime.innerText = '尚未點過名'
    }
    // if (state) {
    //     courseStart.classList.add('disabled')
    // }

})

if (!window.sessionStorage.getItem('token')) {
    alert('請務必要從首頁登入！')
    window.location.replace('./index.html')
}

if (!window.sessionStorage.getItem('courseName')) {
    window.location.replace('./classlist.html')
}

// leave page event
// window.addEventListener('beforeunload', () => {
//     window.sessionStorage.removeItem('courseName')
//     window.sessionStorage.removeItem('courseId')
// })

// get student list

app.auth().onAuthStateChanged((user) => {
    if (!user) {
        alert('請重新登入')
        window.location.replace('./index.html')
    }
    console.log(user.displayName + ' in the course ' + window.sessionStorage.getItem('courseName'))
    getStudentList()
})

// build students' list area
// from getStudentList() CustomEvent
studentListArea.addEventListener('getList', (e) => {
    loader.style.display = 'none'
    lastRollCallTimeArea.style.display = 'block'
    const students = e.detail.students
    students.sort(function (a, b) {
        return a.profile.name.familyName - b.profile.name.familyName
    })
    e.detail.students.forEach((student) => {
        // console.log(student)
        studentListArea.appendChild(buildSpan(student.userId, student.profile.name.fullName, student.profile.emailAddress))
    })
})

// from getRollCallState() Custom Event
studentListArea.addEventListener('getRollCall', (e) => {
    const rollCallData = e.detail.doc
    const rollCallStudents = e.detail.docProperty
    const addList = rollCallStudents.filter((docName) => !rollCallList.includes(docName))
    console.log(addList)
    addList.forEach((student) => {
        const theBadgeId = '#badge-' + student
        const badge = document.querySelector(theBadgeId)
        if (badge) {
            badge.classList.replace('bg-danger', 'bg-success')
            badge.innerText = '點名成功'
        }
    })
    rollCallList.push(...addList)
    console.log(rollCallList)
})

// roll call
rollCallTimeOut.addEventListener('input', function (e) {
    if (e.target.value === '') {
        e.target.value = 0
    } else if (e.target.value[0] === '0') {
        e.target.value = e.target.value[1]
    }
    const patern = /^[0-9]*$/;
    if (!patern.exec(e.target.value)) {
        alert('請規定整數時間喔～')
        e.target.value = e.target.value.slice(0, -1)
    }
})

courseStart.addEventListener('click', function () {
    const courseId = window.sessionStorage.getItem('courseId')
    if (!state) {
        if (rollCallTimeOut.value === '0') {
            alert('時間不能為 0 喔～')
            return
        }
        const nowTime = new Date()
        const timeStamp = nowTime.getTime()
        const showDate = checkTimeFormate(nowTime.getMonth() + 1) + '/' + checkTimeFormate(nowTime.getDate()) + "(" + DayFormate(nowTime.getDay()) + ")"
        const showTime = checkTimeFormate(nowTime.getHours()) + ' : ' + checkTimeFormate(nowTime.getMinutes())
        const rollCallNow = confirm(['現在時間', showDate + "  " + showTime, '是否確認要進行【上課】點名？'].join('\n'))
        if (rollCallNow) {
            const path = './roll-call-link.html?' + urlKey(true, timeStamp)
            // setCourseState(courseId, true)
            setLastRollCall(courseId, timeStamp)
            createRollCall(window.sessionStorage.getItem('courseId'), timeStamp, parseInt(rollCallTimeOut.value))
            window.open(path, '_blank')
            // courseStart.classList.add('disabled')
            buildBadge()
            getRollCallState(courseId, timeStamp)
            const time = checkTimeFormate(nowTime.getMonth() + 1) + '/' + checkTimeFormate(nowTime.getDate()) + " (" + DayFormate(nowTime.getDay()) + ") " + checkTimeFormate(nowTime.getHours()) + ':' + checkTimeFormate(nowTime.getMinutes())
            lastRollCallTime.innerText = time
            alert(['【提醒老師】', '在點名期間請不要「關閉」或「重新整理」這個網頁喔！'].join('\n'))
        }
        // state = true
    }
})


//functions
function getState(courseId) {
    const dbRef = db.collection('CourseRollCall').doc(courseId)
    let theState = null
    let lastRollCall = null
    dbRef.get().then((doc) => {
        if (doc.exists) {
            theState = doc.data().state
            lastRollCall = doc.data().lastRollCall
        } else {
            theState = false
        }
        window.dispatchEvent(new CustomEvent('getState', {
            detail: {
                state: theState,
                lastRollCall: lastRollCall
            }
        }))
    })
}

function getRollCallState(courseId, timestamp) {
    const dbRef = db.collection('CourseRollCall').doc(courseId).collection(String(timestamp)).doc('rollCall')
    dbRef.onSnapshot((doc) => {
        // console.log(Object.getOwnPropertyNames(doc.data()))
        studentListArea.dispatchEvent(new CustomEvent('getRollCall', {
            detail: {
                doc: doc.data(),
                docProperty: Object.getOwnPropertyNames(doc.data()),
            }
        }))
    })
}

function getStudentList() {
    axios({
        url: 'https://classroom.googleapis.com/v1/courses/' + window.sessionStorage.getItem('courseId') + '/students?key=' + apiKey,
        headers: {
            Authorization: "Bearer " + window.sessionStorage.getItem('token'),
            Accept: "application/json"
        }
    }).then(function (res) {
        functionButtons.style.display = 'flex'
        if (!res.data.students) {
            // no student in course
            loader.style.display = 'none'
            courseStart.classList.add('disabled')
            // courseEnd.classList.add('disabled')
            studentListArea.appendChild(noStudent())
            return
        }
        studentListArea.dispatchEvent(new CustomEvent('getList', {
            detail: {
                students: res.data.students
            }
        }))
    }).catch(function (error) {
        console.log(error)
        alert('出現了一點問題，請試著重新登入')
        window.location.replace('./index.html')
    })
}


function noStudent() {
    const col = document.createElement('div')
    col.className = 'col d-grid p-1 text-center mx-auto'
    col.style.marginTop = '7vh'
    //fade-in animate
    col.setAttribute('data-aos', 'zoom-in-up')
    col.setAttribute('data-aos-once', 'true')

    const a = document.createElement('a')
    a.className = 'fs-3 fw-bold'
    a.href = './classlist.html'
    a.innerText = '沒有學生在課程中'

    col.appendChild(a)
    return col
}

function buildSpan(id, title, email) {
    const col = document.createElement('div')
    col.className = 'col d-grid p-2'

    //fade-in animate
    col.setAttribute('data-aos', 'fade-down')
    col.setAttribute('data-aos-once', 'true')

    const div = document.createElement('div')
    div.className = 'border border-0 rounded p-2 shadow'

    const span = document.createElement('span')
    span.id = id
    span.setAttribute('email-data', email)
    span.innerHTML = title + '&nbsp;&nbsp;'
    span.className = 'fs-4 text-wrap d-inline-block'
    div.appendChild(span)

    const badge = document.createElement('span')
    badge.id = 'badge-' + id
    badge.className = 'student'
    // badge.innerText = '尚未點名'
    div.appendChild(badge)

    col.appendChild(div)
    return col
}

function buildBadge() {
    Array.from(document.querySelectorAll('.student')).forEach((badge) => {
        badge.className = 'badge bg-danger'
        badge.innerText = '尚未點名'
    })
}

function clearBadge() {
    Array.from(document.querySelectorAll('.student')).forEach((badge) => {
        badge.className = ''
        badge.innerText = ''
    })
}

function setBadgeToSuccess(userId) {
    const badgeId = 'badge-' + userId
    badge = document.querySelector('#' + badgeId)
    badge.classList.replace('bg-danger', 'bg-success')
    badge.innerText = '點名成功'
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

function urlKey(isStart = true, timeStamp) {
    let sessionKey = null
    if (isStart) {
        sessionKey = 'start'
    } else {
        sessionKey = 'end'
    }
    return [window.sessionStorage.getItem('courseId'), timeStamp, sessionKey].join('-')
}