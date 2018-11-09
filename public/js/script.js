(function () {
    // The width and height of the captured photo. We will set the
    // width to the value defined here, but the height will be
    // calculated based on the aspect ratio of the input stream.

    var width = 320;    // We will scale the photo width to this
    var height = 0;     // This will be computed based on the input stream

    // |streaming| indicates whether or not we're currently streaming
    // video from the camera. Obviously, we start at false.

    var streaming = false;

    // The various HTML elements we need to configure or control. These
    // will be set by the startup() function.

    var video = null;
    var canvas = null;
    var photo = null;
    var fileInput = null;
    var startbutton = null;
    var form = null;
    const constraint = {
        video: true,
        audio: false
    }

    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');
        fileInput = document.getElementById('file_input');
        form = document.getElementById('form');

        navigator.getMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

            navigator.mediaDevices.getUserMedia(constraint)
            .then(function(stream) {
                console.log(stream)
                // if (navigator.mozGetUserMedia) {
                //     video.src = stream;
                // } else {
                var vendorURL = window.URL || window.webkitURL;
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => {
                console.log("An error occured! " + err);
            });

        video.addEventListener('canplay', function (ev) {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                // Firefox currently has a bug where the height can't be read from
                // the video, so we will make assumptions if this happens.

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        startbutton.addEventListener('click', function (ev) {
            takepicture();
            ev.preventDefault();
        }, false);

        clearphoto();
    }

    // Fill the photo with an indication that none has been
    // captured.

    function clearphoto() {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    }

    // Capture a photo by fetching the current contents of the video
    // and drawing it into a canvas, then converting that to a PNG
    // format data URL. By drawing it on an offscreen canvas and then
    // drawing that to the screen, we can change its size and/or apply
    // other changes before drawing it.

    function takepicture() {
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            const data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
            const blob = dataURItoBlob(data)
            console.log("blob", blob);
            fileInput.files[0] = blob;
            form.submit();
            //readBlob(blob).then(console.log).catch(console.error);

        } else {
            clearphoto();
        }
    }

    // Set up our event listener to run the startup process
    // once loading is complete.
    window.addEventListener('load', startup, false);

    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
    
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
    
        return new Blob([ia], {type:mimeString});
    }

    function readBlob(blob){
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.addEventListener("loadend", function() {
                // reader.result contient le contenu du
                // blob sous la forme d'un tableau typé
                resolve(reader.result)
            });
            reader.readAsArrayBuffer(blob);
        })
    }
})();
