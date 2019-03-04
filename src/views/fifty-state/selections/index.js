import Element from '@UI/element';
import s from './styles.scss';
import ThisDropdown from '@Project/components/dropdown';

export default class Selections extends Element {
    prerender(){
         //container
        var view = super.prerender(),
            dropdownData = [ // TODO: sotr fn needs to be DRYer, add to utils Array.prototype.sortAscending or st
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
        this.dropdowns = [];
        dropdownData.forEach(d => {
            this.dropdowns.push(this.parent.parent.createComponent(this.model, ThisDropdown, `select.js-dropdown-${d.label.cleanString()}`, {parent: this, data: d}));
        });
        this.children.push(...this.dropdowns);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }

        var dropdownWrapper = document.createElement('div');
        dropdownWrapper.classList.add(s.dropdownWrapper);
        dropdownData.forEach((d,i) => {
            var dropdownInner = document.createElement('div'),
                dropdownOuter = document.createElement('label'),
                dropdown = this.dropdowns[i];
            dropdownOuter.classList.add(s.dropdownOuter);
            dropdownOuter.innerText = d.label;
            dropdownInner.classList.add(s.dropdownInner);
            dropdownInner.appendChild(dropdown.el);
            dropdownOuter.appendChild(dropdownInner);
            dropdownWrapper.appendChild(dropdownOuter);
        });
        view.appendChild(dropdownWrapper);
        
        
        view.insertAdjacentHTML('beforeend', `
            <div class="flex">
                <p class="${s.label} ${s.labelSort} flex"><span>Sort by:</span> <span><a class="${s.sortBy}" data-sort="alpha" href="#">A–Z</a> | <a class="${s.sortBy}" data-sort="asc" href="#">Low–High</a> | <a class="${s.sortBy}" data-sort="desc" href="#">High–Low</a></span></p>
                <p class="${s.label} ${s.labelHighlight}">Select a state to highlight | <a id="clear-all-highlight" href="#">Clear all</a></p>
            </div>
        `);
        return view;
    }
    init(){
        this.children.forEach(child => {
            child.init();
        });
    }
    
}