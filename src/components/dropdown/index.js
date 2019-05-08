import s from './styles.scss';
import { Dropdown } from '@UI/inputs/inputs.js';
import { stateModule as S } from 'stateful-dead';
import { GTMPush } from '@Utils';

export default class ThisDropdown extends Dropdown {
    constructor(selector, options){
        var _data = [];
        var dropdownType = options.data.type;
        options.data.data.forEach(d => {
            /*if ( dropdownType === 'highlight' ){ // transform state data into form Dropdown can use
                console.log(d);
                _data.push({
                    value: d.code,
                    name: d.state
                });
            } else { // ie d.type is field or group */
                _data.push({
                    value: d.field,
                    name: isNaN(+d.label) ? d.label : 'Credit rating ' + d.label,
                    selected: d.isDefaultSelection ? true : false
                });
         //   }
        });
        
        options.data = _data.sort(function ascending(a, b) {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : a.name >= b.name ? 0 : NaN;
        });
        if ( dropdownType === 'group' ){
            options.data.unshift({value: null, name: '— None —', selected: true});
        }
        super(...arguments);
        this.dropdownType = dropdownType;
    }
    prerender(){
        //container
        var dropdown = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return dropdown; // if prerendered and no need to render (no data mismatch)
        }
        dropdown.classList.add(s.dropdown);
        //dropdown.setAttribute('aria-controls', 'fifty-state-view');
        //dropdown.setAttribute('multiple', true);
        return dropdown;
    }
    init(){
        super.init();
        /*console.log('init dropdown', this);
        this.el.addEventListener('change', e => {
            console.log(e, this);
            S.setState(this.dropdownType, e.target.value);
        });*/
    }
    onChange(){
        GTMPush(`StateDebt|FiftyState|${this.dropdownType}|${this.selectedOption.dataset.value}`);
        S.setState(this.dropdownType, this.selectedOption.dataset.value);
    }
    
}