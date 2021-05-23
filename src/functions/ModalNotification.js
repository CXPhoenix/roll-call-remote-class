import Modal from 'bootstrap/js/dist/modal.js'

const alertModal = `
<div class="modal fade" id="alertModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="alertModalTitle" aria-hidden="true">
  <div class="modal-dialog modal-sm  modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="alertModalTitle">Modal title</h5>
      </div>
      <div class="modal-body">
        <p id="alertModalBody">Modal Body</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-dark border-0" id="alertComfirm">OK!</button>
      </div>
    </div>
  </div>
</div>
`

export function notificationAlert(message, canDismissNothing = false, options = { title: 'Welcome', comfirm: 'OK!'}) {
    const modal = document.createElement('alertNotification')
    modal.innerHTML = alertModal
    const modalTitle = modal.querySelector('#alertModalTitle')
    const modalBody = modal.querySelector('#alertModalBody')
    const modalComfirm = modal.querySelector('#alertComfirm')
    document.body.insertBefore(modal, document.querySelector('header'))
    const notification = new Modal(document.querySelector('#alertModal'), {
        keyboard: false,
        backdrop: 'static'
    })
    if (canDismissNothing) {
        modal.querySelector('.modal-header').innerHTML += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
    }
    modalTitle.innerText = options.title
    modalBody.innerHTML = message
    modalComfirm.innerText = options.comfirm
    modalComfirm.addEventListener('click', () => {
        notification.hide()
        modal.dispatchEvent(new CustomEvent('comfirm'))
    })
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(document.querySelector('alertNotification'))
    })
    notification.show()

    const afterComfirm = new Promise((resolve, reject) => {
        modal.addEventListener('comfirm', resolve)
    })
    return afterComfirm
}