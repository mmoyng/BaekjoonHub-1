const ToastType = {
  Danger: '#eb3b5a',
  Warning: '#fdcb6e',
  Succes: '#00b894',
};

class Toast {
  constructor(message, color, time) {
    log('Constructor', message);
    this.message = message;
    this.color = color;
    this.time = time;
    this.element = null;
    const element = document.createElement('div');
    element.className = 'toast-notification';
    this.element = element;
    const countElements = document.getElementsByClassName('toast-notification');

    element.style.opacity = 0.8;

    element.style.marginBottom = `${countElements.length * 55}px`;

    element.style.backgroundColor = this.color;

    var message = document.createElement('div');
    message.className = 'message-container';
    message.textContent = this.message;

    element.appendChild(message);

    const close = document.createElement('div');
    close.className = 'close-notification';

    const icon = document.createElement('i');
    icon.className = 'lni lni-close';

    close.appendChild(icon);

    element.append(close);

    document.body.appendChild(element);

    setTimeout(function () {
      element.remove();
    }, this.time);

    element.addEventListener('click', () => {
      element.remove();
    });
    log('Closed');
  }

  static burnToast(message, duration = 5000) {
    return new Toast(message, ToastType.Danger, duration);
  }

  static raiseToast(message, duration = 5000) {
    return new Toast(message, ToastType.Succes, duration);
  }
}

export { Toast }