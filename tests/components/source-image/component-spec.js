import SourceImageComponent from '../../../js/components/source-image/component';
import SourceImageTemplate from '../../../js/components/source-image/template';
describe('SourceImageComponent', () => {
    beforeAll(() => {
        let body = document.getElementsByTagName("body")[0]
        body.innerHTML = "<div id='image-upload'></div><div id='images'><div id='source-image'></div><div id='destination-image'></div></div>"
    });
    it('should load the template when initiated', () => {
        let component = new ImageUploadComponent();
        expect(document.getElementById("source-image").innerHTML.replace(/"/g, "\'")).toBe(SourceImageTemplate());
    });
    it("should invoke the loadImage click event.", function() {
      let component = new SourceImageComponent();
      spyOn(component, 'loadImage');
      component.addEvents();
      document.getElementById("upload").click();
      expect(component.loadImage).toHaveBeenCalled();
    });
    it("should load image and set mosaic image when loaded", function(){
      //TODO don't know how to test.
    });
});
