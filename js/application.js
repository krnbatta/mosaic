//Components are initiated as soon as the dom is loaded.
//Each element which has a component shall have same id as component name.
//The component have template and component. When initiated, events are binded according to the component.
import components from './components';
document.addEventListener('DOMContentLoaded', init, false);
function init(){
  components().forEach((component) => {
    let comp = new component();
    comp.addEvents();
  })
};
