//import s from './styles.scss';
import { Dropdown } from '@UI/inputs/inputs.js';

export default class ThisDropdown extends Dropdown {
    constructor(selector, options){
        var _data = [];

        options.data.data.forEach(d => {
            if ( options.data.type === 'highlight' ){ // transform state data into form Dropdown can use
                console.log(d);
                _data.push({
                    value: d.code,
                    name: d.state
                });
            } else { // ie d.type is field or group
                _data.push({
                    value: d.field,
                    name: isNaN(+d.label) ? d.label : 'Credit rating' + d.label
                });
            }
        });
        
        options.data = _data;
        super(...arguments);

    }
    prerender(){
        //container
        var dropdown = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return dropdown; // if prerendered and no need to render (no data mismatch)
        }
        
        return dropdown;
    }
    
}