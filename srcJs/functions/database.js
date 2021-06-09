import { db } from './firebase.config.js'

const collection = 'CourseRollCall'

export function createRollCall(courseId, timestamp, timeout = 10) {
    const timeoutTime = timestamp + (timeout*60*1000)
    const dbRef = db.collection(collection).doc(courseId).collection(String(timestamp))
    dbRef.doc('info').set({
        timeout: timeoutTime
    })
    dbRef.doc('rollCall').set({
        studentId: 'studentClassRoomId'
    })
}


export function setCourseState(courseId, state) {
    const dbRef = db.collection(collection).doc(courseId)
    dbRef.set({
        state: state,
    }, {
        merge: true
    })
}

export function setLastRollCall(courseId, timestamp) {
    const dbRef = db.collection(collection).doc(courseId)
    dbRef.set({
        lastRollCall: timestamp,
    }, {
        merge: true
    })
}


export function studentRollCall(courseId, timestamp, studentId, rollCallTime) {
    const nowTime = new Date().getTime()
    const rollCallData = {}
    rollCallData[String(studentId)] = rollCallTime
    console.log(rollCallData)
    const dbRef = db.collection(collection).doc(courseId).collection(String(timestamp)).doc('rollCall')
    dbRef.set(rollCallData, { merge: true })
}