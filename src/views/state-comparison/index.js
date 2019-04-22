import Element from '@UI/element';
import '@AutoComplete/css/autoComplete.css';
import s from './styles.scss';
import './tippy-styles.scss';
import { stateModule as S } from 'stateful-dead';
import ComparisonText from '@Project/components/comparison/text';
import ComparisonChart from '@Project/components/comparison/chart';
import AutoComplete from '@AutoComplete/js/autoComplete.js';
import PS from 'pubsub-setter';
import tippy from 'tippy.js';

const initialCompare = ['US','AL'];
var scrollPosition = 0;

export default class Comparison extends Element {
    prerender(){ // this prerender is called as part of the super constructor
        this.comparisons = [];
        // first loop through to instantiate the Comparisons. if prerendered, comparison.el will be the renders html. if not, it will be created
        this.model.groups.forEach((group, i) => {
            this.model.typesNested[i].values.forEach(value => {
              var comparison;
                if ( value.type === 'text' ){
                    comparison = this.parent.createComponent(this.model, ComparisonText, `div.js-text-compare-${value.field}`, {rerenderOnDataMismatch: true, parent: this, data: {comparison: initialCompare, field: value.field}});
                } else {
                    comparison = this.parent.createComponent(this.model, ComparisonChart, `div.js-text-compare-${value.field}`, {rerenderOnDataMismatch: true, parent: this, data: {comparison: initialCompare, field: value.field}});
                }
                this.comparisons.push(comparison);
            });
        });
        this.children.push(...this.comparisons);

        //then either return the prendered DOM element or create it, appending the DOM elements from the comparisons instantiated above 

        //container
        var view = super.prerender();
        //this.children = []; already set as part of createComponent method
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        
        var compoundIndex = 0;
        this.model.groups.forEach((group, i) => {
            var groupDiv = document.createElement('div');
            groupDiv.classList.add(s[group.cleanString()]);
            groupDiv.insertAdjacentHTML('afterbegin', `<h3 class="${s.groupHeader}">${group}</h3>`);
            var typeContainer = document.createElement('div');
            typeContainer.classList.add(s.typeContainer, s[group.cleanString()]);
            this.model.typesNested[i].values.forEach(value => {
                var typeDiv = document.createElement('div'); 
                typeDiv.classList.add(s.typeDiv, s[value.field]);
                typeDiv.insertAdjacentHTML('afterbegin', `<h4 class="${s.typeHeader} ${ value.tooltip ? s.withTooltip : 'withoutTooltip' }" data-field="${value.field}" data-content="${value.tooltip ? value.tooltip : ''}">${value.label}</h4>`);
                typeDiv.appendChild(this.comparisons[compoundIndex].el);
                compoundIndex++;
                typeContainer.appendChild(typeDiv);
            });

            groupDiv.appendChild(typeContainer);
            view.appendChild(groupDiv);
        });
        return view;
    }
    init(){
        this.initializeAutocompletes();
        this.initializeTooltips();
        PS.setSubs([
            ['compare', (msg,data) => {
                
                this.update(msg, data);                

            }]
        ]);
    }
    initializeTooltips(){
        var els = document.querySelectorAll('.' + s.withTooltip);
        function scrollBack(){
            window.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
            });
            this.removeEventListener('click', scrollBack);
            this.classList.remove(s.showGoBack);
        }
        function returnMoreLink(field){
            var link = document.createElement('a');
            if ( field === 'credit2015' || field === 'credit2018' ){
                field = 'credit_rating';
            }
            link.innerText = 'more';
            link.href = '#' + field;
            link.addEventListener('click', function(e){
                e.preventDefault();
                scrollPosition = window.pageYOffset;
                var header = document.querySelector('.js-' + field);
                header.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                document.querySelectorAll('.' + s.showGoBack).forEach(function(each){
                    each.classList.remove(s.showGoBack);
                });
                header.classList.add(s.showGoBack);
                header.addEventListener('click', scrollBack);
            });
            return link;
        }
        tippy(els,{
            interactive: true,
            content(reference){
                var div = document.createElement('div');
                div.textContent = reference.dataset.content + ' ';
                div.appendChild(returnMoreLink(reference.dataset.field));
                return div;
            }
        });
    }
    update(msg,data){
        console.log(this);
        this.comparisons.forEach(comparison => {
            comparison.update(msg, data);
        });
    }
    initializeAutocompletes(){
        var src = this.model.data.map(d => {
                return {
                    state: d.state,
                    code: d.code
                };
            }),
            key = 'state';

        console.log(src);
        [0,1].forEach(index => {
            var input = document.querySelector('#compare-input-' + index),
                wrapper = document.querySelector('#autoComplete_wrapper-' + index);
            input.classList.add('autoComplete', s['autoComplete' + index]);
            wrapper.classList.add(s['autoComplete_wrapper-' + index]);
            this.children.push(
                new AutoComplete({
                    data: {
                        src,
                        key
                    },
                    highlight: true,                       // Highlight matching results      | (Optional)
                    onSelection: feedback => {             // Action script onSelection event | (Optional)
                        console.log(feedback, this);
                        S.setState('compare.' + index, feedback.selection.code);
                        input.value = '';
                        input.setAttribute('placeholder', feedback.selection.state);
                    },
                    placeHolder: 'Select state',
                    resultsList: {                       // Rendered results list object      | (Optional)
                        container: () => 'autoComplete_results_list',
                        destination: document.querySelector('#compare-input-' + index),
                        position: 'afterend'
                    },
                    searchEngine: "strict",              // Search Engine type/mode           | (Optional)
                    selector: '#compare-input-' + index,
                    threshold: 3,                        // Min. Chars length to start Engine | (Optional)
                    //maxResults: 5,                         // Max. number of rendered results | (Optional)
                })
            );
            input.setAttribute('placeHolder', this.model.data.find(d => d.code === initialCompare[index]).state);
            //input.value = this.model.data.find(d => d.code === initialCompare[index]).state;
            console.log(this.children);
        });
    }
}