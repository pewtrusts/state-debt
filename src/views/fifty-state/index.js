/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "ascending|descending" }] */

import Element from '@UI/element';
import s from './styles.scss';
import * as d3 from 'd3-collection';
import Bar from '@Project/components/bar';
import Selections from './selections';
import PS from 'pubsub-setter';

// partials
import centralization from '@Project/partials/centralization.md';
import credit2015 from '@Project/partials/credit-rating.md';
import credit2018 from '@Project/partials/credit-rating.md';
import debt_limit_type from '@Project/partials/debt-limit.md';
import debt_per_capita from '@Project/partials/debt-per-capita.md';
import debt_percent_SPI from '@Project/partials/debt-spi.md';
import ten_year_pop_growth from '@Project/partials/population-growth.md';
import revenue_volatility from '@Project/partials/revenue-volatility.md';
import state_local_division from '@Project/partials/state-local.md';

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
            
            return a < b ? 1 : a > b ? -1 : a >= b ? 0 : NaN;
        } :
        function(a,b){
            return a[key] < b[key] ? 1 : a[key] > b[key] ? -1 : a[key] >= b[key] ? 0 : NaN;
        }
}
export default class FiftyStateView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.field = 'debt_percent_SPI';
        this.bars = [];
        this.barContainers = [];
        this.lastPositions = {};
        this.highlightedBars = {};
        this.explainerText = {
            centralization,
            credit2015,
            credit2018,
            debt_limit_type,
            debt_per_capita,
            debt_percent_SPI,
            ten_year_pop_growth,
            revenue_volatility,
            state_local_division
        };
        this.groupByFn = this.groupBy !== null ? d => d[this.groupBy] : d => d !== null;
        this.selections = this.parent.createComponent(this.model, Selections, `div.js-fifty-state-selections`, {parent: this});
        this.sortValueKey = 'state';
        this.sortValuesFn = ascending;
        this.groupBy = 'null';
        this.nestData();        
        this.pushBars();
        
        this.children.push(this.selections, ...this.bars);

        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        
        this.renderSelections();
        this.updateExplainerText('field', this.field);
        
        var charts = this.renderCharts();
        view.appendChild(charts);
       
        return view;
    }
    nestData(){
        this.nestedData = d3.nest().key(this.groupByFn).sortKeys(ascending()).sortValues(this.sortValuesFn(this.sortValueKey)).entries(this.model.data);
    }
    pushBars(){
        this.bars.length = 0;
        this.barContainers.length = 0;

        this.nestedData.forEach(group => {
            group.values.forEach(d => {
                this.bars.push(this.parent.createComponent(this.model, Bar, `div.bar-state-${d.code}`, {parent: this, data: {d,field: this.field, color:2}}));
                this.barContainers.push(this.parent.createComponent(this.model, Element, `div#barContainer-${d.code}`));
            });
        }); 
        
    }
    renderSelections(){
        this.container.appendChild(this.selections.el);
    }
    renderCharts(){
        var container = document.createElement('div'),
            index = 0;
        container.classList.add('js-fifty-chart-container');

        this.nestedData.forEach(group => {
            var groupDiv = document.createElement('div');
            groupDiv.classList.add(s.groupDiv);
            groupDiv.innerHTML = this.groupBy !== 'null' ? `<h3 class="${s.groupHeader}">${this.model.dict[this.groupBy] !== undefined ? this.model.dict[this.groupBy][group.key] : group.key}</h3>` : '';
            group.values.forEach(d => {
                var barContainer = this.barContainers[index].el;
                
                barContainer.classList.add(s.barContainer);
                if ( this.highlightedBars[barContainer.id] ) {
                    barContainer.classList.add(s.isHighlighted);
                }
                
                var label = document.createElement('p');
                label.classList.add(s.barLabel);
                label.innerHTML = d.state;
                
                barContainer.appendChild(label);
                barContainer.appendChild(this.bars[index].el);
                groupDiv.appendChild(barContainer);
                
                index++;
            });
            container.appendChild(groupDiv);
        });

        return container;
    }
    invertPositions(){
        this.barContainers.forEach(barContainer => {
            var lastPosition = barContainer.el.getBoundingClientRect(),
                deltaY = this.firstPositions[barContainer.el.id].top - lastPosition.top;
            barContainer.el.style.transitionDuration = '0';
            barContainer.el.style.transform = `translateY(${deltaY}px)`;
            setTimeout(function(){ // transition won't happen w/o the settimeout trick
                barContainer.el.style.transitionDuration = '0.8s';
                barContainer.el.style.transform = 'translateY(0)';
            });
        });


    }
    init(){
        PS.setSubs([
            ['field', (msg,data) => {
                this.updateBars(msg,data);
                this.updateExplainerText(msg,data);
            }],
            ['group', (msg,data) => {
                this.updateGroups(msg,data);
                this.updateExplainerText(msg,data);
            }],
            ['sort', (msg,data) => {
                this.sortBars(msg,data);
            }]
        ]);
        
        this.children.forEach(child => {
            child.init();
        });

        this.initHighlightBars();
        this.initClearAllHighlights();
    }
    updateExplainerText(msg,data){
        console.log(msg,data);
        if ( msg === 'field' ) {
            this.field = data; // so that the order of subs doesn't matter
            let content = this.explainerText[this.field] || '';
            document.querySelector('#field-explainer').fadeInContent(content, 0.2);
        }
        if ( msg === 'group' ){
            this.groupBy = data; // so that the order of subs doesn't matter
            let content = this.explainerText[this.groupBy] || '';
            document.querySelector('#group-explainer').fadeInContent(content, 0.2);
        }
    }
    initHighlightBars(){
        document.querySelectorAll('.' + s.barContainer).forEach(barContainer => {
            barContainer.addEventListener('click', () => {
                this.highlightedBars[barContainer.id] = !this.highlightedBars[barContainer.id];
                barContainer.classList.toggle(s.isHighlighted);
            });
        });
    }
    initClearAllHighlights(){
        document.querySelector('#clear-all-highlight').addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.' + s.barContainer).forEach(barContainer => {
                barContainer.classList.remove(s.isHighlighted);
                this.highlightedBars = {};
            });
        });
    }
    updateBars(msg,data){
        this.field = data;
        this.bars.forEach(bar => {
            bar.data.field = data;
            bar.update();
        });
        console.log(this.sortValueKey);
        if ( this.sortValueKey !== 'state' ){
            this.sortValueKey = data;
            setTimeout(this.FLIP.bind(this),500);
        }
    }
    recordFirstPositions(){
        this.firstPositions = this.barContainers.reduce((acc, cur) => {
            
            acc[cur.el.id] = cur.el.getBoundingClientRect();
            return acc;
        },{});
        
    }
    FLIP(){
        this.recordFirstPositions();
        this.nestData();
        this.el.innerHTML = ''; 
        this.pushBars();        
        this.el.appendChild(this.renderCharts());
        this.initHighlightBars();
        this.invertPositions();
    }
    updateGroups(msg, data){
        this.groupBy = data;
        this.FLIP();
    }
    sortBars(msg, data){
        this.sortValueKey = data === 'alpha' ? 'state' : this.field;
        this.sortValuesFn = data === 'desc' ? descending : ascending;
        this.FLIP();    
    }
    
}