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
        var autoCompletesAreDirty = [false,false];
        function suggestionMouseHandler(e){
            console.log(this,e);
            if ( e.type === 'mouseenter' ){
                this.focus();
            }
            if ( e.type === 'click' ){
                console.log(this.parentNode.parentNode);
                this.parentNode.parentNode.focus();
            }
        }
        function revertToPrevious(index){ // this in the input element
            var currentStateAbbr = S.getState('compare.' + index) || initialCompare[index];
            var suggestions = this.parentNode.querySelectorAll('.autoComplete_results_list li');
            console.log(currentStateAbbr);
            this.value = src.find(s => s.code === currentStateAbbr).state;
            if ( suggestions[0] ){
                suggestions[0].parentNode.innerHTML = '';
            }
            autoCompletesAreDirty[index] = false;
        }
        
        

        function setMutationObserver(index){
            var target = document.querySelector('#autoComplete_wrapper-' + index + ' .autoComplete_results_list');
            var config = { attributes: false, childList: true, subtree: false };
            var callback = function(mutationList, observer){
                console.log(mutationList, observer);
                mutationList.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                            node.addEventListener('mouseenter', suggestionMouseHandler);
                            node.setAttribute('tabindex',0);
                    });
                });
            /*    if ( mutationList[mutationList.length - 1].target.children.length > 0 && !bodyHasEventListener ){
                    document.body.addEventListener('click', () => {
                        console.log('body click');
                        revertToPrevious.call(mutation.target.parentNode, index);
                    });
                }*/
            }
            var observer = new MutationObserver(callback);
            observer.observe(target, config);
        }
        [0,1].forEach(index => {
            var input = document.querySelector('#compare-input-' + index),
                wrapper = document.querySelector('#autoComplete_wrapper-' + index);
            input.addEventListener('click', function(e){
                e.stopPropagation();
            });
            document.body.addEventListener('click', function(){
                console.log(autoCompletesAreDirty);
                if (autoCompletesAreDirty[index]){
                    revertToPrevious.call(input, index);
                }
            }); 
            input.classList.add('autoComplete', s['autoComplete' + index]);
            wrapper.classList.add(s['autoComplete_wrapper-' + index]);
            
            input.addEventListener('keyup', function() {
                autoCompletesAreDirty[index] = true;
                var suggestions = this.parentNode.querySelectorAll('.autoComplete_results_list li');
                suggestions.forEach(suggestion => {
                    console.log(suggestion);

                    suggestion.addEventListener('mouseenter', suggestionMouseHandler);
                    suggestion.addEventListener('mouseleave', suggestionMouseHandler);
                });
            });
            input.addEventListener('keydown', function(e){
                console.log(e, this);
                

                var suggestions = this.parentNode.querySelectorAll('.autoComplete_results_list li');
                
                if ( e.keyCode === 9 && suggestions.length === 1 ) { // tab key
                    if ( this.value !== suggestions[0].dataset.result ){
                        e.preventDefault();
                        this.value = suggestions[0].dataset.result;
                    } else {
                        revertToPrevious.call(this, index);   
                    }

                }
                if ( e.keyCode === 9 && ( suggestions.length > 1  || suggestions.length === 0 ) ) { // tab key
                    revertToPrevious.call(this, index);   
                }
                if ( e.keyCode === 13 && suggestions.length === 1) { // enter key
                    this.value = suggestions[0].dataset.result;
                    S.setState('compare.' + index, src.find(s => s.state === this.value).code);
                    suggestions[0].parentNode.innerHTML = '';
                    autoCompletesAreDirty[index] = false;
                    //this.blur();

                }
            });

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
                        input.value = feedback.selection.state;
                        input.focus();
                        autoCompletesAreDirty[index] = false;
  //                      input.setAttribute('placeholder', feedback.selection.state);
                    },
                    placeHolder: 'Select state',
                    resultsList: {                       // Rendered results list object      | (Optional)
                        container: () => 'autoComplete_results_list',
                        destination: document.querySelector('#compare-input-' + index),
                        position: 'afterend'
                    },
                    searchEngine: "strict",              // Search Engine type/mode           | (Optional)
                    selector: '#compare-input-' + index,
                    threshold: 2,                        // Min. Chars length to start Engine | (Optional)
                    //maxResults: 5,                         /
                })
            );
            setMutationObserver(index);
            input.setAttribute('value', this.model.data.find(d => d.code === initialCompare[index]).state);
            //input.value = this.model.data.find(d => d.code === initialCompare[index]).state;
            console.log(this.children);
        });
    }
}