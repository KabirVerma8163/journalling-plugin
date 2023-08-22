export class CollapsibleObject {
  containerEl: HTMLElement
  headerEl: HTMLElement
  collapsibleParentEl: HTMLElement
  collapsibleEl: HTMLElement
  containerId: string
  isShowing: boolean

  constructor(containerId: string, headerText: string, getShowBinding: () => boolean, setShowBinding: (show: boolean) => void) {
    this.containerId = containerId
    this.containerEl = document.createElement('div')
    this.isShowing = getShowBinding()

    this.headerEl = document.createElement('p')
    this.headerEl.id = `${containerId}-header`
    this.headerEl.textContent = headerText

    this.collapsibleParentEl = document.createElement('div')
    this.collapsibleParentEl.id = `${containerId}-collapsible`
    this.collapsibleEl = document.createElement('div')
    this.collapsibleEl.className = "collapsible-container"
    this.collapsibleParentEl.appendChild(this.collapsibleEl)

    this.containerEl.appendChild(this.headerEl)
    this.containerEl.appendChild(this.collapsibleParentEl)

    let toggleButton = document.createElement('button')
    toggleButton.className = 'collapse-toggle'
    toggleButton.textContent = ''
    let arrowIcon = document.createElement('i')

    this.headerEl.addClass('collapsible-container-header')
    this.headerEl.appendChild(toggleButton)
    toggleButton.appendChild(arrowIcon)
    toggleButton.style.display = 'flex'
    toggleButton.style.alignItems = 'center'
    toggleButton.style.justifyContent = 'space-between'

    arrowIcon.className = 'arrow-left'

    if (this.isShowing) {
      this.collapsibleEl.classList.remove('display-none')
      arrowIcon.classList.add('arrow-down')
    } else {
      this.collapsibleEl.classList.add('display-none')
      arrowIcon.classList.remove('arrow-down')
    }

    toggleButton.addEventListener('click', () => {
      if (this.isShowing) {
        this.collapsibleEl.classList.add('disappear-with-transition')
        setTimeout(() => {
          this.collapsibleEl.classList.add('display-none')
          arrowIcon.classList.toggle('arrow-down')
        }, 150)
      } else {
        this.collapsibleEl.classList.remove('display-none')
        setTimeout(() => {
          this.collapsibleEl.classList.remove('disappear-with-transition')
          arrowIcon.classList.toggle('arrow-down')
        }, 150)
      }
      this.isShowing = !this.isShowing
      setShowBinding(this.isShowing)
    })
  }
}