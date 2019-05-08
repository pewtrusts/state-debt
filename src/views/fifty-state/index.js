/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "ascending|descending" }] */

import Element from '@UI/element';
import s from './styles.scss';
import * as d3 from 'd3-collection';
import Bar from '@Project/components/bar';
import Selections from './selections';
import PS from 'pubsub-setter';
import { GTMPush } from '@Utils';

import { formatValue } from '@Project/methods';

// partials

function ascending(key = null) {
    return key === null ? 
        function(a,b){
            console.log(a,b);
            a = a === 'N/A' ? '!' : a; // this ensures n/a is always first
            b = b === 'N/A' ? '!' : b;
            a = !isNaN(+a) ? +a : a; // coercing stringified numbers into numbers so that correct order can be taken
            b = !isNaN(+b) ? +b : b;
            var rtn = a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
            return rtn;
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
        this.name = 'FiftyStateView';
        this.field = 'debt_percent_SPI';
        this.bars = [];
        this.barContainers = [];
        this.lastPositions = {};
        this.highlightedBars = {};
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
        this.explainerWrapper = document.querySelector('#explainer-wrapper');
        this.fieldExplainer = document.querySelector('#field-explainer');
        this.groupExplainer = document.querySelector('#group-explainer');
        this.updateExplainerText('field', this.field, true);
        
        var charts = this.renderCharts();
        view.appendChild(charts);
       
        return view;
    }
    nestData(){
        this.nestedData = d3.nest().key(this.groupByFn).sortKeys(ascending()).sortValues(this.sortValuesFn(this.sortValueKey)).entries(this.model.data);
        console.log(this.nestedData);
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
                
                var label = document.createElement('p'),
                    placeHolder = document.createElement('div'),
                    barInnerContainer = document.createElement('div');
                barInnerContainer.classList.add(s.barInnerContainer);
                label.classList.add(s.barLabel);
                label.innerHTML = d.state;
                placeHolder.classList.add(s.placeHolder);
                barContainer.appendChild(label);
                barInnerContainer.appendChild(this.bars[index].el);
                barContainer.appendChild(barInnerContainer);
                barContainer.appendChild(placeHolder);
                barContainer.insertAdjacentHTML('beforeend', this.returnDataLabel(index));
                groupDiv.appendChild(barContainer);
                
                index++;
            });
            container.appendChild(groupDiv);
        });

        this.bars.forEach(bar => {
            bar.checkIfZero();
        });
        return container;
    }
    returnDataLabel(index){
        return `<div class="${s.dataLabel}" style="transform: translateX(${this.returnTranslateValue(index)})">
                    ${this.formatValue(this.bars[index].data.d, this.bars[index].data.field).replace('-','–')}
                </div>`;
    }
    returnTranslateValue(index){
        if ( this.bars[index].data.d[this.bars[index].data.field] < 0 && this.model.types.find(t => t.field === this.bars[index].data.field).crossesZero ){
            return `${(this.bars[index].placeZero(this.bars[index].data.field) * 100).toFixed(1)}%`;
        } else {
            return `${( ( this.bars[index].linearScale(this.bars[index].data.d, this.bars[index].data.field) + this.bars[index].placeZero(this.bars[index].data.field) ) * 100).toFixed(1) }%`;
        }
    }
    formatValue(){
        return formatValue.apply(this, arguments);
    }
    invertPositions(){
        this.barContainers.forEach(barContainer => {
            var lastPosition = barContainer.el.getBoundingClientRect(),
                deltaY = this.firstPositions[barContainer.el.id].top - lastPosition.top;
            barContainer.el.style.transitionDuration = '0';
            barContainer.el.style.transform = `translateY(${deltaY}px)`;
            window.requestAnimationFrame(() => {
                barContainer.el.style.transitionDuration = '0.8s';
                barContainer.el.style.transform = 'translateY(0)';
            });
        });


    }
    init(){
        PS.setSubs([
            ['field', (msg,data) => {
                this.updateBars(msg,data);
                this.updateDataLabels(msg,data);
                this.updateExplainerText(msg,data);
            }],
            ['group', (msg,data) => {
                this.updateGroups(msg,data);
                this.updateExplainerText(msg,data);
            }],
            ['sort', (msg,data) => {
                this.sortBars(msg,data);
            }],
            ['resize', () => {
                this.adjustExplainerTextHeight();
            }]
        ]);
        
        this.children.forEach(child => {
            child.init();
        });
        this.explainerWrapper = document.querySelector('#explainer-wrapper');
        this.fieldExplainer = document.querySelector('#field-explainer');
        this.groupExplainer = document.querySelector('#group-explainer');
        this.initHighlightBars();
        this.initClearAllHighlights();
    }
    updateExplainerText(msg,data, calledFromPrerender){
        console.log(msg,data, this);
        var match = this.model.types.find(t => t.field === data),
            content = match ? `<p><strong>${!isNaN(match.label) ? 'Credit rating ' + match.label : match.label }.</strong> ${match.tooltip} </p>` : '',
            el;
        if ( msg === 'field' ) {
            this.field = data; // so that the order of subs doesn't matter
            el = this.fieldExplainer;
        }
        if ( msg === 'group' ){
            this.groupBy = data; // so that the order of subs doesn't matter
            el = this.groupExplainer;
        }
        if ( !calledFromPrerender ) {
            this.explainerWrapper.style.height = this.explainerWrapper.offsetHeight + 'px';       
        }
        el.fadeInContent(content).then(() => {
            var link = this.parent.returnMoreLink(data);
            if ( link ) {
                link.classList.add(s.moreLink);
                el.lastChild.appendChild(link);
            }
            this.adjustExplainerTextHeight();
            console.log(el.lastChild);
        });
    }
    adjustExplainerTextHeight(){
        var innerHeight = [this.fieldExplainer, this.groupExplainer].reduce((acc, cur) => {
            var el = cur.querySelector('p');
            var computedStyles = el ? window.getComputedStyle(cur.querySelector('p')) : null;
            return computedStyles ? +acc + el.offsetHeight + parseInt(computedStyles['margin-top']) + parseInt(computedStyles['margin-bottom']) : +acc;
        },0);
        this.explainerWrapper.style.height = innerHeight + 'px';
    }
    initHighlightBars(){
        document.querySelectorAll('.' + s.barContainer).forEach(barContainer => {
            barContainer.addEventListener('click', () => {
                this.highlightedBars[barContainer.id] = !this.highlightedBars[barContainer.id];
                if ( this.highlightedBars[barContainer.id] ){
                    GTMPush(`StateDebt|FiftyState|Highlight|${barContainer.id}`);
                }
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
            GTMPush('StateDebt|FiftyState|RemoveHighlights');
        });
    }
    updateDataLabels(){
        this.barContainers.forEach((barContainer, index) => {
            var dataLabel = barContainer.el.querySelector('.' + s.dataLabel);
            dataLabel.fadeInContent(this.formatValue(this.bars[index].data.d, this.bars[index].data.field).replace('-','–'));
            window.requestAnimationFrame(() => {
                console.log(this.bars[index].data.d);
                dataLabel.style.transform = `translateX(${this.returnTranslateValue(index)})`;
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
        console.log(this.groupBy);
        this.FLIP();
    }
    sortBars(msg, data){
        this.sortValueKey = data === 'alpha' ? 'state' : this.field;
        this.sortValuesFn = data === 'desc' ? descending : ascending;
        this.FLIP();    
    }
    
}