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
    auth,
    db
} from './firebase-app/firebase.app.js'

import axios from 'axios'

import {
    routing
} from './functions/router.js'

// auth
const google = new auth.GoogleAuthProvider
google.addScope('https://www.googleapis.com/auth/classroom.courses.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.profile.emails')

function getCurrentUser() {
    const user = app.auth().currentUser
    if (user) {
        console.log(user)
        return
    }
    console.log(false)
}

let nowPage = null
if (!routing()) {
    if (window.sessionStorage.getItem('name')) {
        nowPage = window.sessionStorage.getItem('filePath')
    } else {
        nowPage = './components/login.html'
    }
} else {
    nowPage = './components/login.html'
}

window.onload = () => {
    app.auth().signOut().then(() => {
        loadThePage(nowPage)
    })
}
window.addEventListener('popstate', function (e) {
    loadThePage(e.state.page)
    window.location.reload()
})

onMount('login').then(() => {
    app.auth().onAuthStateChanged((user) => {
        if (user) {
            loadThePage('./components/teacherDashBoard.html')
        } else {
            const signInBtn = document.querySelector('#googleSignIn')
            signInBtn.addEventListener('click', () => {
                app.auth().signInWithPopup(google)
                    .then((res) => {
                        window.sessionStorage.setItem('token', res.credential.accessToken)
                        notificationAlert(`${res.user.displayName} 歡迎回來`)
                            .then(() => {
                                loadThePage('./components/teacherDashBoard.html')
                                window.location.reload()
                            })
                    })
            })
        }
    })
})

onMount('teacherDashBoard').then(() => {
    console.log('teacherDahBoard')
    const loadingIcon = document.querySelector('#coursesListLoader')
    const classList = document.querySelector('#classList')
    axios({
        url: 'https://classroom.googleapis.com/v1/courses?teacherId=me&key=' + apiKey,
        headers: {
            Authorization: "Bearer " + window.sessionStorage.getItem('token'),
            Accept: "application/json"
        }
    }).then((res) => {
        console.log('y')
        if (res) {
            classList.dispatchEvent(new CustomEvent('readDone', {
                detail: {
                    courses: res.data.courses
                }
            }))
        }
    }).catch((error) => {
        app.auth().signOut().then(() => {
            loadThePage('./components/login.html')
        })
    })
    classList.addEventListener('readDone', (e) => {
        loadingIcon.style.display = 'none'
        e.detail.courses.forEach((course) => {
            const col = document.createElement('div')
            col.className = 'col d-grid text-center'
            const btn = document.createElement('button')
            btn.className = "btn btn-primary text-center"
            btn.id = course.id
            btn.innerText = course.name
            btn.onclick = (e) => {
                window.sessionStorage.setItem('courseId', e.target.id)
                window.sessionStorage.setItem('courseName', e.target.innerText)
                loadThePage('./components/studentList.html')
            }
            col.appendChild(btn)
            classList.appendChild(col)
        })
    })
})

onMount('studentList').then(() => {
    const loadingIcon = document.querySelector('#studentListLoader')
    const studentList = document.querySelector('#studentList')
    const back = document.querySelector('#back')
    const rollCallStart = document.querySelector('#rollCall-start')
    const rollCallEnd = document.querySelector('#rollCall-end')
    const getRollCallSitu = document.querySelector('#getRollCallSitu')
    document.querySelector('#courseName').innerText = window.sessionStorage.getItem('courseName')
    const students = []
    axios({
        url: 'https://classroom.googleapis.com/v1/courses/' + window.sessionStorage.getItem('courseId') + '/students',
        headers: {
            Authorization: "Bearer " + window.sessionStorage.getItem('token'),
            Accept: "application/json"
        }
    }).then((res) => {
        if (res) {
            if (res.data.students) {
                res.data.students.forEach((student) => {
                    students.push({
                        name: student.profile.name.fullName,
                        id: student.userId,
                        email: student.profile.emailAddress
                    })
                })
            }
            studentList.dispatchEvent(new CustomEvent('readDone', {
                detail: {
                    students: res.data.students
                }
            }))

        }
    }).catch((error) => {
        app.auth().signOut().then(() => {
            loadThePage('./components/login.html')
        })
    })
    studentList.addEventListener('readDone', (e) => {
        loadingIcon.style.display = 'none'
        if (e.detail.students) {
            students.sort(function (a, b) {
                return a.name - b.name
            })
            students.forEach((student) => {
                const col = document.createElement('div')
                col.className = 'col border border-3 rounded p-2 d-grid'
                const name = document.createElement('span')
                name.className = 'd-block position-relative'
                name.innerHTML = student.name + '&nbsp;&nbsp;&nbsp;'
                const badge = document.createElement('span')
                badge.className = 'badge rounded-pill bg-danger position-absolute end-10'
                badge.innerText = '尚未點名'
                badge.id = student.id
                name.appendChild(badge)
                col.appendChild(name)
                studentList.appendChild(col)
            })
        } else {
            document.querySelector('#noStudent').style.display = 'block'
        }
    })
    back.addEventListener('click', () => {
        window.sessionStorage.removeItem('courseId')
        window.sessionStorage.removeItem('courseName')
        loadThePage('./components/teacherDashBoard.html')
        window.location.reload()
    })
    rollCallStart.addEventListener('click', () => {
        window.localStorage.setItem('course', 'rollCall-start-course-' + window.sessionStorage.getItem('courseId'))
        if (!window.localStorage.getItem('rollCall-start-course-' + window.sessionStorage.getItem('courseId'))) {
            const nowDate = Date.now()
            const search = window.sessionStorage.getItem('courseId') + '-' + nowDate
            notificationAlert('確定開始點名嗎？', true, {
                    title: '點名確認',
                    comfirm: '確認'
                })
                .then(() => {
                    window.localStorage.setItem('rollCall-start-course-' + window.sessionStorage.getItem('courseId'), search)
                    if (window.localStorage.getItem('rollCall-end-course-' + window.sessionStorage.getItem('courseId'))) {
                        window.localStorage.removeItem('rollCall-end-course-' + window.sessionStorage.getItem('courseId'))
                    }
                    const batch = db.batch()
                    app.auth().onAuthStateChanged((user) => {
                        if (!user) {
                            app.auth().signInWithPopup(google).then((res) => {
                                students.forEach((student) => {
                                    const studentDB = db.collection('ClassRollCall').doc(window.sessionStorage.getItem('courseId')).collection(nowDate+'-start').doc(student.id)
                                    batch.set(studentDB, {
                                        rollcall: false
                                    })
                                })
                                batch.commit().then(() => {
                                    window.open('./rollcallqrcode.html?' + search, '_blank')
                                })
                            })
                        } else {
                            students.forEach((student) => {
                                const studentDB = db.collection('ClassRollCall').doc(window.sessionStorage.getItem('courseId')).collection(nowDate+'-start').doc(student.id)
                                batch.set(studentDB, {
                                    rollcall: false
                                })
                            })
                            batch.commit().then(() => {
                                window.open('./rollcallqrcode.html?' + search, '_blank')
                            })
                        }
                        
                    })
                    // db.collection('ClassRollCall').doc(window.sessionStorage.getItem('courseId')+students[0].id).set({
                    //     name: students[0].name,
                    //     email: students[0].email,
                    //     rollcall: false
                    // })
                })
        } else {
            window.open('./rollcallqrcode.html?' +  window.localStorage.getItem('rollCall-start-course-' + window.sessionStorage.getItem('courseId'), '_blank'))
        }
    })
    rollCallEnd.addEventListener('click', () => {
        window.localStorage.setItem('course', 'rollCall-end-course-' + window.sessionStorage.getItem('courseId'))
        if (!window.localStorage.getItem('rollCall-end-course-' + window.sessionStorage.getItem('courseId'))) {
            const nowDate = Date.now()
            const search = window.sessionStorage.getItem('courseId') + '-' + nowDate
            notificationAlert('確定開始點名嗎？', true, {
                    title: '點名確認',
                    comfirm: '確認'
                })
                .then(() => {
                    window.localStorage.setItem('rollCall-end-course-' + window.sessionStorage.getItem('courseId'), search)
                    if (window.localStorage.getItem('rollCall-start-course-' + window.sessionStorage.getItem('courseId'))) {
                        window.localStorage.removeItem('rollCall-start-course-' + window.sessionStorage.getItem('courseId'))
                    }
                    const batch = db.batch()
                    app.auth().onAuthStateChanged((user) => {
                        if (!user) {
                            app.auth().signInWithPopup(google).then((res) => {
                                students.forEach((student) => {
                                    const studentDB = db.collection('ClassRollCall').doc(window.sessionStorage.getItem('courseId')).collection(nowDate+'-end').doc(student.id)
                                    batch.set(studentDB, {
                                        rollcall: false
                                    })
                                })
                                batch.commit().then(() => {
                                    window.open('./rollcallqrcode.html?' + search, '_blank')
                                })
                            })
                        } else {
                            students.forEach((student) => {
                                const studentDB = db.collection('ClassRollCall').doc(window.sessionStorage.getItem('courseId')).collection(nowDate+'-end').doc(student.id)
                                batch.set(studentDB, {
                                    rollcall: false
                                })
                            })
                            batch.commit().then(() => {
                                window.open('./rollcallqrcode.html?' + search, '_blank')
                            })
                        }
                    })
                })
        } else {
            window.open('./rollcallqrcode.html?' +  window.localStorage.getItem('rollCall-start-course-' + window.sessionStorage.getItem('courseId'), '_blank'))
        }
    })
    getRollCallSitu.addEventListener('click', () => {

        app.auth().onAuthStateChanged((user) => {
            if (!user) {
                app.auth().signInWithPopup(google)
            }
            const date = window.localStorage.getItem(window.localStorage.getItem('course')).split('-')[1]
            db.collection('ClassRollCall').doc(window.sessionStorage.getItem('courseId')).collection(date+'-start').onSnapshot((querySnapShot) => {
                querySnapShot.forEach((doc) => {
                    const theBadge = document.getElementById(doc.id)
                    theBadge.classList.remove('bg-danger')
                    theBadge.classList.add('bg-success')
                    theBadge.innerText = '點名成功'
                })
            })
        })
    })
})