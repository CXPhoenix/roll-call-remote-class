import fontawsome from '@fortawesome/fontawesome'
import { faChevronLeft, faSignOutAlt, faSchool, faChalkboardTeacher } from '@fortawesome/fontawesome-free-solid'
import AOS from 'aos'
import 'aos/dist/aos.css'

new AOS.init({
    offset: 70
})

fontawsome.library.add(faChevronLeft)
fontawsome.library.add(faSignOutAlt)
fontawsome.library.add(faSchool)
fontawsome.library.add(faChalkboardTeacher)