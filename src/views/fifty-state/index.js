import Element from '@UI/element';
import s from './styles.scss';
import * as d3 from 'd3-collection';
import Bar from '@Project/components/bar';

export default class FiftyStateView extends Element {
    prerender(){
         //container
        var view = super.prerender();
        this.children = [];
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        this.groupBy = null; // TODO: should this be in the constructor?
        var groupByFn = this.groupBy !== null ? d => d[this.groupBy] : d => d !== null;
        this.nestedData = d3.nest().key(groupByFn).sortKeys(function ascending(a, b) {
              return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
            }).entries(this.model.data);

        console.log(this);
        var charts = this.renderCharts('debt_percent_SPI');
        view.appendChild(charts);
        /*this.model.groups.forEach((group, i) => {
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
        });*/
        return view;
    }
    renderCharts(field){
        var container = document.createElement('div');
        container.classList.add('js-fifty-chart-container');

        this.nestedData.forEach(group => {
            var groupDiv = document.createElement('div');
            groupDiv.classList.add(s.groupDiv);
            groupDiv.innerHTML = this.groupBy !== null ? `<h3 class="${s.groupHeader}">${this.model.dict[this.groupBy] !== undefined ? this.model.dict[this.groupBy][group.key] : group.key}</h3>` : '';
            group.values.forEach(d => {
                var barContainer = document.createElement('div');
                barContainer.classList.add(s.barContainer);
                var label = document.createElement('p');
                label.classList.add(s.barLabel);
                label.innerHTML = d.state;
                var bar = this.parent.createComponent(this.model, Bar, `div.js-bar-state-${d.code}`, {parent: this, data: {d,field, color:2}});
                barContainer.appendChild(label);
                barContainer.appendChild(bar.el);
                groupDiv.appendChild(barContainer);
            });
            container.appendChild(groupDiv);
        });

        return container;
    }
    
}