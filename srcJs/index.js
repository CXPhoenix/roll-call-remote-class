import axios from 'axios'
import {
    app,
    auth
} from './functions/firebase.config.js'

// init page element
const loginBtn = document.querySelector('#login')
const authSelect = document.querySelector('#authSelect')

// google login init
const google = new auth.GoogleAuthProvider
google.addScope('https://www.googleapis.com/auth/classroom.courses.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.profile.emails')

// on load event
window.addEventListener('load', () => {
    console.log('load')
    checkHash()
    window.sessionStorage.clear()
})

// log in button
// check the url hash for deciding the action
loginBtn.addEventListener('click', () => {
    if (checkHash()) {
        storageHash(window.location.hash)
        GoogleLogin('./roll-call.html')
    }else if (authSelect.value === '請問你的身份？') {
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

function checkHash() {
    if (window.location.hash) {
        authSelect.style.display = 'none'
        return true
    }
    return false
}

function storageHash(urlHash) {
    urlHash = urlHash.split('#')[1].split('/')
    const rollCallCourse = urlHash[0]
    const rollCallTimestamp = urlHash[1]
    const state = urlHash[2]
    window.sessionStorage.setItem('rollCallCourse', rollCallCourse)
    window.sessionStorage.setItem('rollCallTimestamp', rollCallTimestamp)
    window.sessionStorage.setItem('state', state)
}