import ImageUploadComponent from '../../../js/components/image-upload/component';
import ImageUploadTemplate from '../../../js/components/image-upload/template';
describe('ImageUploadComponent', () => {
    beforeAll(() => {
        let body = document.getElementsByTagName("body")[0]
        body.innerHTML = "<div id='image-upload'></div><div id='images'><div id='source-image'></div><div id='destination-image'></div></div>"
    });
    it('should load the template when initiated', () => {
        let component = new ImageUploadComponent();
        expect(document.getElementById("image-upload").innerHTML.replace(/"/g, "\'")).toBe(ImageUploadTemplate());
    });
    it("should invoke the loadImage click event.", function() {
      let component = new ImageUploadComponent();
      spyOn(component, 'loadImage');
      component.addEvents();
      document.getElementById("upload").click();
      expect(component.loadImage).toHaveBeenCalled();
    });
    it("should load image and set mosaic image when loaded", function(){
      //TODO don't know how to test.
    });
});
