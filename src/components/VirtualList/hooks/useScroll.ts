import { onMounted, ref, Ref } from "vue";

type ScrollElements = {
    disabled?: boolean,
    viewportEl: Ref<HTMLDivElement | null>,
    contentEl: Ref<HTMLDivElement | null> ,
    scrollEl: Ref<HTMLDivElement | null>,
    thumbEl: Ref<HTMLDivElement | null>
}

export default function useScroll(options: ScrollElements) {
    const thumbHeight = ref(0);
    let mouseDown = false;

    const updateHeight = () => {
        if (options.disabled) return; 
        const { viewportEl, contentEl, scrollEl, thumbEl } = options;

        if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
            const viewportHeight = viewportEl.value.clientHeight;
            const contentHeight = contentEl.value.clientHeight;
            const scrollHeight = scrollEl.value.clientHeight;

            thumbHeight.value = Math.min((viewportHeight / contentHeight) * scrollHeight, scrollHeight);

            const maxSY = scrollEl.value.clientHeight - thumbHeight.value;
            const maxCY =  contentEl.value.clientHeight - viewportEl.value.clientHeight;

            thumbEl.value.style.transform = `translateY(${viewportEl.value.scrollTop / maxCY * maxSY}px)`;
        }
    }

    const mouseDownThumb = (event: MouseEvent) => {
        if (options.disabled) return; 
        mouseDown = true;
        event.preventDefault();
        event.stopPropagation();

        const { viewportEl, contentEl, scrollEl, thumbEl } = options;

        if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
            const minSY = 0;
            const minCY = 0;
            const maxSY = scrollEl.value.clientHeight - thumbEl.value.clientHeight;
            const maxCY =  contentEl.value.clientHeight - viewportEl.value.clientHeight;

            let translateStart = viewportEl.value.scrollTop;
            let isMove = true;
            let startY = event.clientY;
            let distance = 0;


            let timeStart = performance.now();

            const mouseMove = (event: MouseEvent) => {
                const { viewportEl, contentEl, scrollEl, thumbEl } = options;

                if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
                    const scrollDistance = event.clientY - startY;
                    distance = (scrollDistance / maxSY) * maxCY;
                }
            }

            const mouseUp = () => {
                document.removeEventListener('mousemove', mouseMove);
                document.removeEventListener('mouseup', mouseUp);
                isMove = false;
                mouseDown = false;
                fixScroll();
            }

            const move = (timeNow: number) => {
                const isMoveDown = (distance > 0 && translateStart < maxCY)
                const isMoveUp = (distance < 0 && translateStart > minCY)
                
                if (isMoveDown || isMoveUp) {
                    const step = 0.8 * (timeNow - timeStart);

                    if (isMoveDown) {
                        const oldDistance = distance;

                        distance = Math.max(distance - step, 0);
                        startY = distance === 0 ? startY - oldDistance / maxCY * maxSY : startY + step / maxCY * maxSY;
                        translateStart = Math.min(translateStart + step, maxCY);
                    } else if (translateStart > minCY) {
                        const oldDistance = distance;

                        distance = Math.min(distance + step, 0);
                        startY = distance === 0 ? startY + oldDistance / maxCY * maxSY : startY - step / maxCY * maxSY;
                        translateStart = Math.max(translateStart - step, minCY);
                    }

                    scroll(translateStart / maxCY);
                }


                timeStart = timeNow;

                if (isMove) requestAnimationFrame(move);
            }

            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
            requestAnimationFrame(move);
        }
    }

    const scroll = (percent: number, smooth = false) => {
        if (options.disabled) return; 
        const { viewportEl, contentEl, scrollEl, thumbEl } = options;

        if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
            const sHeight = scrollEl.value.clientHeight - thumbEl.value.clientHeight;
            const cHeight = contentEl.value.clientHeight - viewportEl.value.clientHeight;
 
            thumbEl.value.style.transform = `translateY(${sHeight * percent}px)`;
            viewportEl.value.scrollTo({ top: cHeight * percent, behavior: smooth ? "smooth" : "instant" });
        }
    }

    let timeoutToken: number | null = null;
    const fixScroll = () => {
        if (options.disabled) return; 
        if (mouseDown) return;

        if (timeoutToken) clearTimeout(timeoutToken);
        timeoutToken = setTimeout(() => {
            const { viewportEl, contentEl, scrollEl, thumbEl } = options;

            if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
                const cHeight = contentEl.value.clientHeight - viewportEl.value.clientHeight;
                const rest = viewportEl.value.scrollTop % 50;
                const count = Math.floor(viewportEl.value.scrollTop / 50);

                if (rest > 0) {
                    const scrollTop = (count + (rest > 50/2 ? 1 : 0)) * 50;
                    scroll(Math.min(Math.max(scrollTop, 0), cHeight) / cHeight, true);
                }
            }
        }, 100);
    }

    const wheel = (event: WheelEvent) => {
        if (options.disabled) return;
        event.preventDefault();
        event.stopPropagation();

        const { viewportEl, contentEl, scrollEl, thumbEl } = options;

        if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
            const cHeight = contentEl.value.clientHeight - viewportEl.value.clientHeight;
            const newScrollTop = viewportEl.value.scrollTop + Math.sign(event.deltaY) * 50;

            scroll(Math.min(Math.max(newScrollTop, 0), cHeight) / cHeight);
        }
    }

    onMounted(() => {
        if (options.disabled) return; 

        const { viewportEl, contentEl, scrollEl, thumbEl } = options;

        if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
            const observer = new ResizeObserver(updateHeight)
            observer.observe(viewportEl.value);
            observer.observe(contentEl.value);
            observer.observe(scrollEl.value);

            thumbEl.value.onmousedown = mouseDownThumb;
            viewportEl.value.onscrollend = fixScroll;
            viewportEl.value.onwheel = wheel;
        }
    })

    return { thumbHeight }
}