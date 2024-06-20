document.addEventListener('DOMContentLoaded', function() {
    if (typeof JSZip === 'undefined') {
        console.error('JSZip not loaded!');
        return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "countImages" },
            function(response) {
                if (!response || !response.images) {
                    console.error('No images found or response is invalid.');
                    return;
                }

                console.log('Total images found:', response.images.length);

                let options = `<option value="all">all (${response.images.length})</option>`;
                const imageMap = response.images.reduce((acc, img) => {
                    if (img.width && img.height) {
                        const sizeKey = `${img.width}x${img.height}`;
                        if (!acc[sizeKey]) {
                            acc[sizeKey] = [];
                        }
                        acc[sizeKey].push(img);

                        if (!acc['all']) {
                            acc['all'] = [];
                        }
                        acc['all'].push(img);
                    }
                    return acc;
                }, {});

                for (const [key, value] of Object.entries(imageMap)) {
                    if (key !== 'all') {
                        options += `<option value="${key}">${key} (${value.length})</option>`;
                    }
                }

                document.getElementById('size').insertAdjacentHTML("beforeend", options);
                document.getElementById('count_all').innerText = 'In this page: ' + response.count + ' images';

                document.getElementById('download').addEventListener('click', function() {
                    const selectedSize = document.getElementById('size').value;
                    const imagesToDownload = imageMap[selectedSize];
                    if (imagesToDownload && imagesToDownload.length > 0) {
                        console.log(`Downloading ${imagesToDownload.length} images of size ${selectedSize}`);
                        downloadImagesAsZip(imagesToDownload, selectedSize);
                    } else {
                        console.log('No images to download for selected size:', selectedSize);
                    }
                });

                document.getElementById('form_filter').addEventListener('submit', function(event) {
                    event.preventDefault();
                    console.log(typeof event.target.height,event.target.height)
                    const minWidth = parseInt(event.target.width.value);
                    const minHeight = event.target.height.value?parseInt(event.target.height.value):0;
                    console.log(minWidth,minHeight)
                    const filteredImages = response.images.filter(img => img.width >= minWidth && img.height >= minHeight);
                    if (filteredImages.length > 0) {
                        console.log(`Downloading ${filteredImages.length} images with dimensions >= ${minWidth}x${minHeight}`);
                        downloadImagesAsZip(filteredImages, `for${minWidth}x${minHeight}`);
                    } else {
                        console.log('No images to download for the specified dimensions.');
                        handleError();
                    }
                });
            }
        );
    });

    function downloadImagesAsZip(images, sizeKey) {
        const zip = new JSZip();
        const imgFolder = zip.folder(sizeKey);
        let addedImagesCount = 0;

        const imagePromises = images.map((img, index) => {
            let url = img.src || img.dataset.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
            if (url && url.startsWith('/')) {
                url = new URL(url, window.location.origin).href;
            }
            console.log(`Processing image (${index + 1}/${images.length}): ${url}`);
            if (!url) {
                console.warn(`No URL found for image ${index + 1}`);
                return Promise.resolve();
            }
            if (url.startsWith('data:')) {
                // Обробка Data URL
                const formatMatch = url.match(/^data:image\/(png|jpeg|gif|bmp|svg\+xml|webp|jpg);/);
                const format = formatMatch ? formatMatch[1] : 'png'; // Витягування формату зображення з Data URL
                const imgName = `image${index + 1}_${Math.random().toString(36).substring(7)}.${format}`;
                const base64Data = url.split(',')[1];
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                imgFolder.file(imgName, byteArray);
                console.log(`Added data URL image: ${imgName}`);
                addedImagesCount++;
                return Promise.resolve();
            } else {
                // Обробка звичайного URL
                return fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            console.error(`Error fetching image: ${url} - status: ${response.status}`);
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.blob().then(blob => {
                            const contentType = response.headers.get('content-type');
                            const format = contentType ? contentType.split('/')[1] : 'png';
                            const imgName = `image${index + 1}_${Math.random().toString(36).substring(7)}.${format}`;
                            imgFolder.file(imgName, blob);
                            console.log(`Added fetched image: ${imgName}`);
                            addedImagesCount++;
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching image:', error);
                        return Promise.reject(error);
                    });
            }
        });

        Promise.all(imagePromises).then(() => {
            console.log('Total images added to ZIP:', addedImagesCount);
            zip.generateAsync({ type: "blob" }).then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = `${sizeKey}.zip`;
                link.click();
                console.log('Download started for ZIP file:', `${sizeKey}.zip`);
            }).catch(error => console.error('Error generating zip:', error));
        }).catch(error => console.error('Error in Promise.all:', error));
    }
});

function handleError() {
    const errorMessage = document.querySelector('.error')
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 2000);
}
