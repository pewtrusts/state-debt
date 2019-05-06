import Element from '@UI/element';
import s from './styles.scss';
import ThisDropdown from '@Project/components/dropdown';
import { stateModule as S } from 'stateful-dead';

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
            this.dropdowns.push(this.parent.parent.createComponent(this.model, ThisDropdown, `div.js-dropdown-${d.label.cleanString()}`, {parent: this, data: d}));
        });
        this.children.push(...this.dropdowns);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }

        var dropdownWrapper = document.createElement('div');
        dropdownWrapper.classList.add(s.dropdownWrapper);
        dropdownData.forEach((d,i) => {
            console.log(d);
            var dropdownInner = document.createElement('div'),
                dropdownOuter = document.createElement('div'),
                dropdownLabel = document.createElement('label'),
                dropdown = this.dropdowns[i];
            dropdown.el.setAttribute('aria-labelledby', 'label-dropdown-' + d.type );
            dropdownOuter.classList.add(s.dropdownOuter);
            dropdownLabel.innerText = d.label;
            dropdownLabel.setAttribute('id', 'label-dropdown-' + d.type);
            dropdownInner.classList.add(s.dropdownInner);
            dropdownInner.appendChild(dropdown.el);
            dropdownOuter.appendChild(dropdownLabel);
            dropdownOuter.appendChild(dropdownInner);
            dropdownWrapper.appendChild(dropdownOuter);
        });
        view.appendChild(dropdownWrapper);
        
        
        view.insertAdjacentHTML('beforeend', `
            <div id="explainer-wrapper">
                <div id="field-explainer"></div>
                <div id="group-explainer"></div>
            </div>
            <div class="flex">
                <p class="${s.label} ${s.labelSort} flex"><span>Sort by:</span> <span><a class="${s.sortBy} ${s.sortActive}" data-sort="alpha" href="#">A–Z</a> | <a class="${s.sortBy}" data-sort="asc" href="#">Low–High</a> | <a class="${s.sortBy}" data-sort="desc" href="#">High–Low</a></span></p>
                <p class="${s.label} ${s.labelHighlight}">Select a state to highlight | <a id="clear-all-highlight" href="#">Clear all</a></p>
            </div>
        `);
        return view;
    }
    init(){
        this.children.forEach(child => {
            child.init();
        });
        document.querySelectorAll('.' + s.sortBy).forEach(each => {
            each.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('.' + s.sortActive).classList.remove(s.sortActive);
                each.classList.add(s.sortActive);
                S.setState('sort', each.dataset.sort);
            });
        });
    }
}