import { onMounted, ref, Ref } from "vue";

type ScrollElements = {
    viewportEl: Ref<HTMLDivElement | null>,
    contentEl: Ref<HTMLDivElement | null> ,
    scrollEl: Ref<HTMLDivElement | null>,
    thumbEl: Ref<HTMLDivElement | null>
}

export default function useScroll(options: ScrollElements) {
    const thumbHeight = ref(0);

    const updateHeight = () => {
        const { viewportEl, contentEl, scrollEl, thumbEl } = options;

        if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
            const viewportHeight = viewportEl.value.clientHeight;
            const contentHeight = contentEl.value.clientHeight;
            const scrollHeight = scrollEl.value.clientHeight;

            thumbHeight.value = (viewportHeight / contentHeight) * scrollHeight;
        }
    }

    const mouseDownThumb = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const { viewportEl, contentEl, scrollEl, thumbEl } = options;

        if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
            const minY = 0;
            const maxY = scrollEl.value.clientHeight - thumbEl.value.clientHeight;

            const transformStr = thumbEl.value.style.transform;
            let translateStart = Number(transformStr ? transformStr.replace(/[^\d.]/g, '') : 0);
            let isMove = true;
            let startY = event.clientY;
            let endY = startY;
            let distance = 0;


            let timeStart = performance.now();

            const mouseMove = (event: MouseEvent) => {
                endY = event.clientY;
                distance = event.clientY - startY;
            }

            const mouseUp = () => {
                document.removeEventListener('mousemove', mouseMove);
                document.removeEventListener('mouseup', mouseUp);
                isMove = false;
            }

            const move = (timeNow: number) => {
                if (distance !== 0) {
                    const step = 0.2 * (timeNow - timeStart);


                    if (distance > 0 && translateStart !== maxY) {
                        const oldDistance = distance;

                        distance = Math.max(distance - step, 0);
                        startY = distance === 0 ? startY - oldDistance : startY + step;
                        translateStart = Math.min(translateStart + step, maxY);
                    } else if (translateStart !== minY) {
                        const oldDistance = distance;

                        distance = Math.min(distance + step, 0);
                        startY = distance === 0 ? startY + oldDistance : startY - step;
                        translateStart = Math.max(translateStart - step, minY);
                    }

    
                    if (thumbEl.value) 
                        thumbEl.value.style.transform = `translateY(${translateStart}px)`;
                }


                timeStart = timeNow;

                if (isMove) requestAnimationFrame(move);
            }

            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('mouseup', mouseUp);
            requestAnimationFrame(move);
        }
    }

    onMounted(() => {
        const { viewportEl, contentEl, scrollEl, thumbEl } = options;

        if (viewportEl.value && contentEl.value && scrollEl.value && thumbEl.value) {
            const observer = new ResizeObserver(updateHeight)
            observer.observe(viewportEl.value);
            observer.observe(contentEl.value);
            observer.observe(scrollEl.value);

            thumbEl.value.onmousedown = mouseDownThumb;
        }
    })

    return { thumbHeight }
}