export function loadThePage(page, record = true, customMsg = '', root = '#app') {
    const rootElement = document.querySelector(root)
    fetch(page).then((res) => {
        if (res.ok) {
            return res.text()
        }
    }).then((html) => {
        const div = document.createElement('div')
        div.innerHTML = html
        const thePage = div.querySelector('template')
        rootElement.innerHTML = thePage.innerHTML
        if (record) {
            storageNowPage(thePage.id, page)
        }
        window.history.pushState({page: page}, null)
        rootElement.dispatchEvent(new CustomEvent(thePage.id, {
            detail: {
                name: thePage.id,
                filePath: page,
                msg: customMsg,
            }
        }))
    }).catch((e) => {
        console.log(e)
    })
}

export function onMount(name, root = '#app') {
    const mounted = new Promise((resolve, reject) => {
        document.querySelector(root).addEventListener(name, resolve)
    })
    return mounted
}

function storageNowPage(name, filePath) {
    window.sessionStorage.setItem('name', name)
    window.sessionStorage.setItem('filePath', filePath)
}