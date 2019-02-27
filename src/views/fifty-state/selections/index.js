import Element from '@UI/element';
import s from './styles.scss';
import ThisDropdown from '@Project/components/dropdown';

export default class FiftyStateView extends Element {
    prerender(){
         //container
        var view = super.prerender();
        this.children = [];
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        var dropdownData = [ // TODO: sotr fn needs to be DRYer, add to utils Array.prototype.sortAscending or st
            {
                label: 'Select field:',
                data: this.model.types.filter(t => t.type !== 'text'), 
                type: 'field'
            },{
                label: 'Group by:', // AGHG TODO: do the sort under the compnent
                data: this.model.types.filter(t => t.type === 'text'),
                type: 'group'
            }/*,{
                label: 'Highlight:',
                data: this.model.data.map(d => {
                    console.log(d);
                    return {
                        code: d.code,
                        state: d.state
                    }
                }),
                type: 'highlight'
            }*/
        ];

        var dropdownWrapper = document.createElement('div');
        dropdownWrapper.classList.add(s.dropdownWrapper);
        dropdownData.forEach(d => {
            var dropdownInner = document.createElement('div'),
                dropdownOuter = document.createElement('label'),
                dropdown = this.parent.parent.createComponent(this.model, ThisDropdown, `select.js-dropdown-${d.label.cleanString()}`, {parent: this, data: d});
            dropdownOuter.classList.add(s.dropdownOuter);
            dropdownOuter.innerText = d.label;
            dropdownInner.classList.add(s.dropdownInner);
            dropdownInner.appendChild(dropdown.el);
            dropdownOuter.appendChild(dropdownInner);
            dropdownWrapper.appendChild(dropdownOuter);
        });
        view.appendChild(dropdownWrapper);
        return view;
    }
    
}