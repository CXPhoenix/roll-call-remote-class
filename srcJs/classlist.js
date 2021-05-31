import axios from 'axios'
import {
    app,
    apiKey
} from './functions/firebase.config.js'


// init page elements
const userName = document.querySelector('#userName')
const courseListArea = document.querySelector('#courseList')
const loader = document.querySelector('#coursesListLoader')
const logoutbtn = document.querySelector('#logoutbtn')
let isLogoutbtnPress = false

// for animate
let counter = 0

// show teacher's name
userName.innerText = window.sessionStorage.getItem('displayName')

// on load event
if (!window.sessionStorage.getItem('token')) {
    alert('請務必要從首頁登入！')
    window.location.replace('./index.html')
}

app.auth().onAuthStateChanged((user) => {
    if (user) {
        if (!window.sessionStorage.getItem('displayName')) {
            userName.innerText = user.displayName
        }
        getClassList(apiKey)
    } else {
        if (!isLogoutbtnPress) {
            alert('請重新登入')
            window.location.replace('./index.html')
        }
    }
})

// build course list area
courseListArea.addEventListener('getList', (e) => {
    loader.style.display = 'none'
    // console.log(e.detail.courses)
    e.detail.courses.forEach((course) => {
        courseListArea.appendChild(buildButton(course.id, course.name))
    })
})

// logout
logoutbtn.addEventListener('click', logout)

// functions
function getClassList(key) {
    axios({
        url: 'https://classroom.googleapis.com/v1/courses?teacherId=me&key=' + key,
        headers: {
            Authorization: 'Bearer ' + window.sessionStorage.getItem('token'),
            Accept: 'application/json'
        }
    }).then((res) => {
        if (!res.data.courses) {
            loader.style.display = 'none'
            courseListArea.appendChild(noCourse())
            return
        }
        courseListArea.dispatchEvent(new CustomEvent('getList', {
            detail: {
                courses: res.data.courses
            }
        }))
    }).catch((error) => {
        console.log(error)
        alert('出現錯誤，請重新登入，或與管理員聯繫')
        window.location.replace('./index.html')
    })
}

function noCourse() {
    const col = document.createElement('div')
    col.className = 'col d-grid p-1 text-center mx-auto fade-up'
    col.style.marginTop = '7vh'
    col.setAttribute('data-aos', 'zoom-in-up')
    col.setAttribute('data-aos-once', 'true')

    const a = document.createElement('a')
    a.className = 'fs-3 fw-bold'
    a.href = './index.html'
    a.innerText = '沒有開設任何課程'

    col.appendChild(a)
    return col
}


function buildButton(id, title) {
    const col = document.createElement('div')
    col.className = 'col d-grid'
    
    //fade-in animate
    col.setAttribute('data-aos', 'fade-down')
    col.setAttribute('data-aos-once', 'true')

    const btn = document.createElement('button')
    btn.id = id
    btn.className = 'btn btn-primary text-truncate p-2'
    btn.onclick = function () {
        window.sessionStorage.setItem('courseId', id)
        window.sessionStorage.setItem('courseName', title)
        window.location.assign('./classStudentList.html')
    }

    const text = document.createElement('span')
    text.className = 'fs-4'
    text.innerText = title

    btn.appendChild(text)

    col.appendChild(btn)
    counter += 1
    return col
}

function logout() {
    app.auth().signOut().then(() => {
        isLogoutbtnPress = true
        alert('成功登出！')
        window.location.replace('./index.html')
    })

}