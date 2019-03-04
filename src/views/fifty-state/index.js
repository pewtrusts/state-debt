/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "ascending|descending" }] */

import Element from '@UI/element';
import s from './styles.scss';
import * as d3 from 'd3-collection';
import Bar from '@Project/components/bar';
import Selections from './selections';
import PS from 'pubsub-setter';

function ascending(key = null) {
    return key === null ? 
        function(a,b){
            return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
        } :
        function(a,b){
            return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : a[key] >= b[key] ? 0 : NaN;
        }
}
function descending(key = null) {
    return key === null ? 
        function(a,b){
            console.log(a);
            return a < b ? 1 : a > b ? -1 : a >= b ? 0 : NaN;
        } :
        function(a,b){
            return a[key] < b[key] ? 1 : a[key] > b[key] ? -1 : a[key] >= b[key] ? 0 : NaN;
        }
}
export default class FiftyStateView extends Element {
    
    prerender(){
         //container
        var view = super.prerender(),
            field = 'debt_percent_SPI';
        this.bars = [];
        this.groupByFn = this.groupBy !== null ? d => d[this.groupBy] : d => d !== null;
        this.selections = this.parent.createComponent(this.model, Selections, `div.js-fifty-state-selections`, {parent: this});
        this.groupBy = null; // TODO: should this be in the constructor?
        this.nestedData = d3.nest().key(this.groupByFn).sortKeys(ascending()).entries(this.model.data);
        console.log(this.nestedData);
        this.nestedData.forEach(group => {
            group.values.forEach(d => {
                this.bars.push(this.parent.createComponent(this.model, Bar, `div.bar-state-${d.code}`, {parent: this, data: {d,field, color:2}}));
            });
        });
        this.children.push(this.selections, ...this.bars);

        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        
        this.renderSelections();
        
        var charts = this.renderCharts();
        view.appendChild(charts);
       
        return view;
    }
    renderSelections(){
        this.container.appendChild(this.selections.el);
    }
    renderCharts(){
        var container = document.createElement('div');
        container.classList.add('js-fifty-chart-container');

        this.nestedData.forEach(group => {
            var groupDiv = document.createElement('div');
            groupDiv.classList.add(s.groupDiv);
            groupDiv.innerHTML = this.groupBy !== null ? `<h3 class="${s.groupHeader}">${this.model.dict[this.groupBy] !== undefined ? this.model.dict[this.groupBy][group.key] : group.key}</h3>` : '';
            group.values.forEach((d,i) => {
                var barContainer = document.createElement('div');
                barContainer.classList.add(s.barContainer);
                var label = document.createElement('p');
                label.classList.add(s.barLabel);
                label.innerHTML = d.state;
                
                barContainer.appendChild(label);
                barContainer.appendChild(this.bars[i].el);
                groupDiv.appendChild(barContainer);
            });
            container.appendChild(groupDiv);
        });

        return container;
    }
    init(){
        PS.setSubs([
            ['field', (msg,data) => {
                this.update(msg,data);
            }]
        ]);
        console.log('init FiftyStateView', this);
        this.children.forEach(child => {
            child.init();
        });
    }
    update(msg,data){
        this.bars.forEach(bar => {
            bar.data.field = data;
            bar.update();
        });
    }
    
}