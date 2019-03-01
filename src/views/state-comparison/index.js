import Element from '@UI/element';
import '@AutoComplete/css/autoComplete.css';
import s from './styles.scss';
import { stateModule as S } from 'stateful-dead';
//import PS from 'pubsub-setter';
import ComparisonText from '@Project/components/comparison/text';
import ComparisonChart from '@Project/components/comparison/chart';
import AutoComplete from '@AutoComplete/js/autoComplete.js';

const initialCompare = ['US','AL'];

export default class Comparison extends Element {
    prerender(){ // this prerender is called as part of the super constructor
         //container
        var view = super.prerender();
        this.children = [];
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
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
    init(){
        console.log('init Comparison');
        this.initializeAutocompletes();
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
                    selector: '#compare-input-' + index,
                    placeHolder: 'Select state',
                    //threshold: 0,                        // Min. Chars length to start Engine | (Optional)
                    searchEngine: "strict",              // Search Engine type/mode           | (Optional)
                    resultsList: {                       // Rendered results list object      | (Optional)
                        container: () => 'autoComplete_results_list',
                        destination: document.querySelector('#compare-input-' + index),
                        position: 'afterend'
                    },
                    highlight: true,                       // Highlight matching results      | (Optional)
                    //maxResults: 5,                         // Max. number of rendered results | (Optional)
                    onSelection: feedback => {             // Action script onSelection event | (Optional)
                        console.log(feedback, this);
                        S.setState('compare' + index, feedback.selection.code);
                        input.value = feedback.selection.state;
                      //  input.setAttribute('placeholder', feedback.selection.state);
                    }
                })
            );
            input.value = this.model.data.find(d => d.code === initialCompare[index]).state;
        });
    }
}