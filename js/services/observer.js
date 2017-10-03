//This is observer implementation.
//Observer is fired when toggleValue is set
//whenever toggleValue is set, it checks for the value inside dependableKey.
//dependableObj consists of keys and values where keys are dependableKeys which guides which observer to fire and value is an array. Each element of array is an object which have three values: callback function, context, arguments.
let ObserverObj = new Proxy({
  toggleValue: false,
  dependableKey: null,
  dependableObj: {},
  toggleProperty(){
    this.toggleValue = !this.toggleValue;
  }
}, {
  set(target, key, value){
    target[key] = value;
    if(key=="toggleValue"){
      for(var k in target.dependableObj){
        if(k==target.dependableKey){
          let dependables = target.dependableObj[k];
          dependables.forEach((dependable) => {
            dependable.callback.call(dependable.context, dependable.args);
          });
          break;
        }
      }
    }
    return true;
  }
});
export default ObserverObj;
