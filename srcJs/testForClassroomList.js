import {
    app,
    auth,
    db,
    dbFieldValue,
} from './functions/firebase.config.js'

import axios from 'axios'

const google = new auth.GoogleAuthProvider
google.addScope('https://www.googleapis.com/auth/classroom.courses.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly')
google.addScope('https://www.googleapis.com/auth/classroom.profile.emails')

const loginBtn = document.querySelector('#loginBtn')
const appArea = document.querySelector('#app')
const addBtn = document.querySelector('#addbtn')
let courseId = null
let token = null
let studentList = []

//events
loginBtn.addEventListener('click', login)

addBtn.addEventListener('click', () => testUpdate())

appArea.addEventListener('loginAccess', () => {
    // getAllStaff()
    // console.log('abc')
    setTimeLog()
    // testDB('123456')
    
})

appArea.addEventListener('done', () => {
    console.log(studentList)
})

//functions
function login() {
    app.auth().signInWithPopup(google).then((res) => {
        token = res.credential.accessToken
        appArea.dispatchEvent(new CustomEvent('loginAccess'))
        loginBtn.classList.add('disabled')
    })
}

function testDB(value) {
    const dbRef = db.collection('testDB').doc('testing')
    dbRef.update({
        timeLog: dbFieldValue.arrayUnion(value)
    })
    console.log('update done')
}

function setTimeLog() {
    const dbRef = db.collection('testDB').doc('testing')
    dbRef.set({
        timeLog: ['sample'],
    }, { merge: true })
    console.log('set done')
}

function testUpdate() {
    const dbRef = db.collection('testDB').doc('test2')
    dbRef.update({
        hi: 'hello'
    },  { merge: true })
    console.log('testUpdate done')
}