import Element from '@UI/element';
import s from './styles.scss';
import ComparisonText from '@Project/components/comparison/text';
import ComparisonChart from '@Project/components/comparison/chart';

const initialCompare = ['MD','NH'];

export default class Comparison extends Element {
    prerender(){
         //container
        var view = super.prerender();
        this.children = [];
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        console.log(this);
        this.model.groups.forEach((group, i) => {
            var groupDiv = document.createElement('div');
            groupDiv.classList.add(s[group.cleanString()]);
            groupDiv.insertAdjacentHTML('afterbegin', `<h3 class="${s.groupHeader}">${group}</h3>`);
            var typeContainer = document.createElement('div');
            typeContainer.classList.add(s.typeContainer, s[group.cleanString()]);
            this.model.typesNested[i].values.forEach(value => {
                var typeDiv = document.createElement('div'); 
                typeDiv.classList.add(s.typeDiv, s[value.field]);
                typeDiv.insertAdjacentHTML('afterbegin', `<h4 class="${s.typeHeader}">${value.label}</h4>`);
                if ( value.type === 'text' ){
                    let child = this.parent.createComponent(this.model, ComparisonText, `div.js-text-compare-${value.field}`, {rerenderOnDataMismatch: true, parent: this, data: {comparison: initialCompare, field: value.field}});
                    typeDiv.appendChild(child.el);
                    this.children.push(child);
                } else {
                    let child = this.parent.createComponent(this.model, ComparisonChart, `div.js-text-compare-${value.field}`, {rerenderOnDataMismatch: true, parent: this, data: {comparison: initialCompare, field: value.field}});
                    typeDiv.appendChild(child.el);
                    this.children.push(child);
                }
                typeContainer.appendChild(typeDiv);
            });
            groupDiv.appendChild(typeContainer);
            view.appendChild(groupDiv);
        });
        return view;
    }
}