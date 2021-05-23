const route = window.location.href.split('#')
export function routing() {
    if (route.length < 2) {
        return false
    }
    const theTarget = route[route.length-1].split('/')
    return theTarget.filter((routes) => routes)
}
