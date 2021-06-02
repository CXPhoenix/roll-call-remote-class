import axios from 'axios'
import {
    app,
    auth
} from './functions/firebase.config.js'

// init page element
const loginBtn = document.querySelector('#login')
const authSelect = document.querySelector('#authSelect')
const loginBtnArea = document.querySelector('#isLogin')

// google login init
const google = new auth.GoogleAuthProvider
// google.addScope('https://www.googleapis.com/auth/classroom.courses.readonly')
// google.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly')
// google.addScope('https://www.googleapis.com/auth/classroom.profile.emails')

// on load event
window.addEventListener('load', () => {
    console.log('load')
    if (checkSearch()) {
        authSelect.style.display = 'none'
        setTips(loginBtnArea, '請使用已加入課程的帳號進行登入點名！')
    } else {
        google.addScope('https://www.googleapis.com/auth/classroom.courses.readonly')
        google.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly')
        google.addScope('https://www.googleapis.com/auth/classroom.profile.emails')
    }
    // window.sessionStorage.clear()
})

// log in button
// check the url hash for deciding the action
loginBtn.addEventListener('click', () => {
    if (checkSearch()) {
        storageSearch(window.location.Search)
        GoogleLogin('./roll-call.html')
    } else if (authSelect.value === '請問你的身份？') {
        alert('請一定要選擇一個身份喔！')
    } else {
        GoogleLogin(authSelect.value)
    }
})

//functions
function GoogleLogin(page) {
    app.auth().signInWithPopup(google).then((res) => {
        const token = res.credential.accessToken
        const idToken = res.credential.idToken

        window.sessionStorage.setItem('token', token)
        // window.sessionStorage.setItem('idToken', idToken)
        window.sessionStorage.setItem('displayName', res.user.displayName)

        window.location.replace(page)
    })
}

function checkSearch() {
    if (window.location.search) {
        return true
    }
    return false
}

function storageSearch(urlSearch) {
    urlSearch = urlSearch.split('?')[1].split('-')
    const rollCallCourse = urlSearch[0]
    const rollCallTimestamp = urlSearch[1]
    const state = urlSearch[2]
    window.sessionStorage.setItem('rollCallCourse', rollCallCourse)
    window.sessionStorage.setItem('rollCallTimestamp', rollCallTimestamp)
    window.sessionStorage.setItem('state', state)
}

function setTips(parentNode, tipsText) {
    const tipArea = document.createElement('div')
    tipArea.className = 'text-center mt-1 mb-3'
    
    const tipSpan = document.createElement('span')
    tipSpan.className = 'border border-danger border-3 m-2 p-2 fs-4'
    tipSpan.innerText = tipsText
    
    tipArea.appendChild(tipSpan)
    parentNode.appendChild(tipArea)
}