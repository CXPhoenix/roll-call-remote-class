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


const google = new auth.GoogleAuthProvider
google.addScope('https://www.googleapis.com/auth/classroom.courses.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.profile.emails')

if (!window.sessionStorage.getItem('name')) {
    loadThePage('./components/login.html')
} else {
    loadThePage(window.sessionStorage.getItem('filePath'))
}

onMount('login').then(() => {
    const signIn = document.querySelector('#googleSignIn')
    signIn.addEventListener('click', () => {
        app.auth().signInWithPopup(google)
            .then((result) => {
                console.log(result)
                const user = result.user
                const credential = result.credential
                const token = credential.accessToken
                window.sessionStorage.setItem('token', token)
                loadThePage('./components/home.html')
            })
    })
})

onMount('home').then(() => {
    const coursesList = document.querySelector('#coursesList')
    const token = window.sessionStorage.getItem('token')
    let courseBtns = []
    console.log(window.location.pathname)
    console.log(window.location.href.split('#'))
    axios({
        url: 'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&teacherId=me&key=' + apiKey,
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((res) => {
        const waiting = setInterval(() => {
            console.log(1)
            if (res.data) {
                document.querySelector('#coursesListLoader').style.display = 'none'
                document.querySelector('div').dispatchEvent(new CustomEvent('loadDone'))
            }
        }, 20);
        document.querySelector('div').addEventListener('loadDone', () => {
            clearInterval(waiting)
            res.data.courses.forEach((course) => {
                console.log(course)
                coursesList.innerHTML += `
                    <div class="col d-grid">
                        <button id=${course.id} class="btn btn-primary btn-large text-center
                        course" onclick="window.sessionStorage.setItem('courseId', event.target.id);window.sessionStorage.setItem('courseName', event.target.innerText);window.dispatchEvent(new CustomEvent('getStudentList'))">${course.name}</button>
                    </div>
                    
                `
            })
            window.addEventListener('getStudentList', () => {
                loadThePage('./components/studentList.html')
            })
        })
    }).catch((error) => {
        console.log(error)
        notificationAlert('請重新登入', { title: '注意！', comfirm: '確認' })
        .then(() => {
            loadThePage('./components/login.html')
        })
    })

})

onMount('studentList').then(() => {
    const backBtn = document.querySelector('#back')
    backBtn.addEventListener('click', () => {
        window.sessionStorage.removeItem('courseId')
        window.sessionStorage.removeItem('courseName')
        loadThePage('./components/home.html')
    })
    const students = document.querySelector('#students')
    const courseName = window.sessionStorage.getItem('courseName')
    const courseId = window.sessionStorage.getItem('courseId')
    const token = window.sessionStorage.getItem('token')
    axios({
        url: `https://classroom.googleapis.com/v1/courses/${courseId}/teachers`,
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((res) => {
        console.log('hi')
        console.log(res.data)
    })
    axios({
        url: `https://classroom.googleapis.com/v1/courses/${courseId}/students`,
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((res) => {
        const waiting = setInterval(() => {
            if (res) {
                document.querySelector('div').dispatchEvent(new CustomEvent('listloadDone'))
            }
        }, 20);
        document.querySelector('div').addEventListener('listloadDone', () => {
            clearInterval(waiting)
            console.log(res.data.students)
            if (res.data.students) {
                res.data.students.forEach((student) => {
                    console.log(student.userId)
                    axios({
                        url: `https://classroom.googleapis.com/v1/userProfiles/${student.userId}`,
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }).then((res) => {
                        console.log(res.data)
                        console.log(res.data.emailAddress)
                    }).catch((error) => {
                        console.log(error)
                    })
                    students.innerHTML += `
                    <div class="col d-grid border border-2 border-primary text-center">${student.profile.name.fullName}</div>
                `
                })
            } else {
                students.innerHTML = `
                    <span class="text-center fs-2" style="margin-top: 30vh">沒有學生</span>
                `
            }
        })
    })
})