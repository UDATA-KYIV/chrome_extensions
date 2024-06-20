chrome.runtime.onMessage.addListener(function (data, sender, sendResponse) {
    if (data.action == "countImages") {
        // Видаляємо атрибут lazy-loading
        document.querySelectorAll('img[loading="lazy"]').forEach(img => img.removeAttribute('loading'));

        const imageElements = document.querySelectorAll('img');
        const imagePromises = [...imageElements].map(img => {
            return new Promise((resolve) => {
                let src = img.src;
                if (!src || src.startsWith('data:')) {
                    src = img.dataset.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
                    if (src && src.startsWith('/')) {
                        src = new URL(src, window.location.origin).href;
                    }
                }

                const tempImg = new Image();
                tempImg.src = src;
                tempImg.style.display = 'none';
                document.body.appendChild(tempImg);

                tempImg.onload = () => {
                    resolve({
                        src: tempImg.src,
                        width: tempImg.naturalWidth,
                        height: tempImg.naturalHeight,
                    });
                    document.body.removeChild(tempImg);
                };

                tempImg.onerror = () => {
                    resolve({
                        src: tempImg.src,
                        width: 0,
                        height: 0,
                    });
                    document.body.removeChild(tempImg);
                };
            });
        });

        Promise.all(imagePromises).then(imageInfo => {
            console.log(imageInfo);
            sendResponse({ count: imageElements.length, images: imageInfo });
        });

        return true;
    }
});
