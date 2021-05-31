export function checkToken() {
    if (!window.sessionStorage.getItem('token')) {
        alert('請務必要從首頁登入！')
        window.location.replace('./index.html')
    }
}