import Element from '@UI/element';
import s from './styles.scss';
import * as d3 from 'd3-collection';
import Bar from '@Project/components/bar';
import Selections from './selections';

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
        this.renderSelections();
        var charts = this.renderCharts('debt_percent_SPI');
        view.appendChild(charts);
       
        return view;
    }
    renderSelections(){
        var selections = this.parent.createComponent(this.model, Selections, `div.js-fifty-state-selections`, {parent: this});
        this.container.appendChild(selections.el);
        console.log(selections.el);
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
    init(){
        console.log('init fifty-state');
    }
    
}