import { ScrollConfig } from './_type';
import { inRange, toRange } from './helpers';
import ScrollProgress from './ScrollProgress';

export default class ScrollCore {
  private block_height: number = 0;
  private scroll_active: boolean = false;

  private viewport_el: HTMLDivElement = document.createElement('div');
  private content_el: HTMLDivElement = document.createElement('div');
  private scroll_el: HTMLDivElement = document.createElement('div');
  private thumb_el: HTMLDivElement = document.createElement('div');

  private onFastScrolling: (flag: boolean) => void = () => {};
  private timeoutToken: number | null = null;

  private get maxCY() {
    return this.content_el.clientHeight - this.viewport_el.clientHeight;
  }

  private get maxSY() {
    return this.scroll_el.clientHeight - this.thumb_el.clientHeight;
  }

  setConfig(config: ScrollConfig) {
    this.block_height = config.block_height ?? 0;

    if (config.viewport_el) this.viewport_el = config.viewport_el;
    if (config.content_el) this.content_el = config.content_el;
    if (config.scroll_el) this.scroll_el = config.scroll_el;
    if (config.thumb_el) this.thumb_el = config.thumb_el;

    this.thumb_el.addEventListener('mousedown', this.mouseDown.bind(this));
    this.viewport_el.addEventListener('scroll', this.checkScroll.bind(this));
    this.viewport_el.onscrollend = this.fixScroll.bind(this);
    this.viewport_el.onwheel = this.wheel.bind(this);
    this.scroll_el.addEventListener('wheel', this.wheel.bind(this));
    this.scroll_el.addEventListener('click', this.click.bind(this));

    let prevHeight: number | null = null;
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const height = entries[0].borderBoxSize?.[0].blockSize;

      if (typeof height === 'number' && height !== prevHeight) {
        prevHeight = height;
        this.updateHeight();
      }
    });

    observer.observe(this.viewport_el);
    observer.observe(this.content_el);
    observer.observe(this.scroll_el);
  }

  setOnFastScrolling(callback: (flag: boolean) => void) {
    this.onFastScrolling = callback;
  }

  private updateHeight() {
    const scrollTop = this.viewport_el.scrollTop;
    const vH = this.viewport_el.clientHeight;
    const cH = this.content_el.clientHeight;
    const sH = this.scroll_el.clientHeight;
    const tH = inRange((vH / cH) * sH, 20, sH);

    this.thumb_el.style.height = `${tH}px`;
    this.thumb_el.style.transform = `translateY(${(scrollTop / this.maxCY) * this.maxSY}px)`;

    if (tH >= sH) this.scroll_el.style.width = '0px';
    else this.scroll_el.style.width = '6px';
  }

  private scroll(scrollTop: number, smooth = false) {
    this.viewport_el.scrollTo({
      top: inRange(scrollTop, 0, this.maxCY),
      behavior: smooth ? 'smooth' : 'instant',
    });
  }

  private click(event: MouseEvent) {
    const thumbHeight = this.thumb_el.clientHeight;
    console.log(event)
    const position = inRange(event.offsetY - thumbHeight / 2, 0, this.maxSY);
    this.scroll(toRange(position, 0, this.maxSY, 0, this.maxCY));
  }

  private mouseDown(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.scroll_el.style.pointerEvents = 'none';
    document.body.className = document.body.className + ' sm-pointer-cursor';

    const speed = 0.65;
    let timeStart = performance.now();

    this.scroll_active = true;
    this.onFastScrolling(true);

    const thumbPosition = this.thumb_el.getBoundingClientRect().y;
    const scrollPosition = this.scroll_el.getBoundingClientRect().y;

    const config = {
      offset: event.clientY - thumbPosition,
      scrollTop: this.viewport_el.scrollTop,
      minSY: 0,
      minCY: 0,
      maxSY: this.maxSY,
      maxCY: this.maxCY,
    };

    const scrollProgress = new ScrollProgress(config);

    const move = (event: MouseEvent) => {
      scrollProgress.setEndPoint(event.clientY - scrollPosition);
    };

    const up = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      this.scroll_el.style.pointerEvents = 'auto';
      document.body.className = document.body.className.replace(
        ' sm-pointer-cursor',
        '',
      );

      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);

      this.scroll_active = false;
      this.onFastScrolling(false);
      this.fixScroll();
    };

    const process = (timeNow: number) => {
      if (scrollProgress.canMove()) {
        const coefficient = scrollProgress.getCoefficient();
        const step = speed * (timeNow - timeStart) * coefficient;
        scrollProgress.move(step);
      }

      timeStart = timeNow;
      if (this.scroll_active) requestAnimationFrame(process);
    };

    const update = () => {
      this.scroll(scrollProgress.getPositionC());
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    scrollProgress.setOnUpdate(update);
    requestAnimationFrame(process);
  }

  private wheel(event: WheelEvent) {
    event.preventDefault();
    event.stopPropagation();

    const oldScrollTop = this.viewport_el.scrollTop;
    const step = Math.sign(event.deltaY) * this.block_height;

    this.scroll(oldScrollTop + step);
  }

  private checkScroll() {
    const scrollTop = this.viewport_el.scrollTop;
    const position = toRange(scrollTop, 0, this.maxCY, 0, this.maxSY);

    this.thumb_el.style.transform = `translateY(${position}px)`;
  }

  private fixScroll() {
    if (this.scroll_active) return;

    if (this.timeoutToken) clearTimeout(this.timeoutToken);
    this.timeoutToken = setTimeout(() => {
      if (this.maxCY === this.viewport_el.scrollTop) return;

      const rest = this.viewport_el.scrollTop % this.block_height;
      const count = Math.floor(this.viewport_el.scrollTop / this.block_height);

      if (rest > 0) {
        const additionBlock = rest > this.block_height / 2 ? 1 : 0;
        const scrollTop = (count + additionBlock) * this.block_height;

        this.scroll(scrollTop, true);
      }
    }, 100);
  }
}
