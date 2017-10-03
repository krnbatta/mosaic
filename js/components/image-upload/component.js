import template from './template';
import Store from '../../services/store';
class ImageUploadComponent {
    constructor() {
        document.getElementById("image-upload").innerHTML = template();
    }
    //When the submit button is clicked, the file(if uploaded), is uploaded in source image canvas.
    addEvents() {
        document.getElementById("upload").addEventListener("click", this.loadImage);
    }

    loadImage() {
        var mosaicImage = Store.getRecord('mosaicImage');
        var files = document.getElementById("image").files;
        if (FileReader && files && files.length) {
            var fr = new FileReader();
            fr.onload = function() {
                mosaicImage.node.src = fr.result;
            }
            fr.onerror = function(stuff) {
                console.log("error", stuff)
                console.log(stuff.getMessage())
            }
            fr.readAsDataURL(files[0]);
        }
    }
}
export default ImageUploadComponent;
