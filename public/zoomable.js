;(function () {
  function createOverlay(src, alt) {
    var overlay = document.createElement('div')
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;cursor:pointer;'

    var bg = document.createElement('div')
    bg.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.8);'
    overlay.appendChild(bg)

    var wrapper = document.createElement('div')
    wrapper.style.cssText =
      'position:relative;z-index:1;max-height:90vh;max-width:95vw;overflow:auto;'

    var btn = document.createElement('button')
    btn.textContent = '\u00d7'
    btn.style.cssText =
      'position:sticky;top:8px;float:right;z-index:2;width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;font-size:20px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;'
    wrapper.appendChild(btn)

    var img = document.createElement('img')
    img.src = src
    img.alt = alt || ''
    img.style.cssText = 'display:block;max-width:none;'
    wrapper.appendChild(img)

    overlay.appendChild(wrapper)

    function close() {
      document.body.style.overflow = ''
      overlay.remove()
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === bg || e.target === btn) {
        close()
      }
    })

    document.addEventListener(
      'keydown',
      function onKey(e) {
        if (e.key === 'Escape') {
          close()
          document.removeEventListener('keydown', onKey)
        }
      }
    )

    document.body.style.overflow = 'hidden'
    document.body.appendChild(overlay)
  }

  document.addEventListener('click', function (e) {
    var img = e.target.closest ? e.target.closest('img[data-zoomable]') : null
    if (img) {
      e.preventDefault()
      createOverlay(img.src, img.alt)
    }
  })
})()
