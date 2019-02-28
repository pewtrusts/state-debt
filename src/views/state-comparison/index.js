import Element from '@UI/element';
import '@AutoComplete/css/autoComplete.css';
import s from './styles.scss';
import ComparisonText from '@Project/components/comparison/text';
import ComparisonChart from '@Project/components/comparison/chart';
import AutoComplete from '@AutoComplete/js/autoComplete.js';

const initialCompare = ['US','AL'];

export default class Comparison extends Element {
    prerender(){
         //container
        var view = super.prerender();
        this.children = [];
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        // ******** NOTE this will need to be in init() bc has to happen at runtime unless there is a way to render it now and hydrate it later
        var src = this.model.data.map(d => d.state);
        console.log(src);
        [0,1].forEach(index => {
            var container = document.querySelector('#compare-input-' + index);
            container.classList.add('autoComplete', s['autoComplete' + index]);
            this.children.push(
                new AutoComplete({
                    data: {
                        src
                    },
                    selector: '#compare-input-' + index,
                    placeHolder: this.model.data.find(d => d.code === initialCompare[index]).state,
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
                        console.log(feedback);
                    }
                })
            );
        });
     /*   const autoCompletejs = new autoComplete({
            data: {
                src: async () => {
                    // Loading placeholder text
                    document.querySelector(".autoComplete").setAttribute("placeholder", "Loading...");
                    // Fetch External Data Source
                    const source = await fetch("./db/generic.json");
                    const data = await source.json();
                    // Returns Fetched data
                    return data;
                },
                key: "food"
            },
            placeHolder: "Food & Drinks",
            selector: "#autoComplete-0",
            threshold: 0,
            searchEngine: "strict",
            highlight: true,
            maxResults: Infinity,
            resultsList: {
                container: source => {
                    resultsListID = "autoComplete_results_list";
                    return resultsListID;
                },
                destination: document.querySelector(".autoComplete"),
                position: "afterend"
            },
            resultItem: (data, source) => {
                return `${data.match}`;
            },
            onSelection: feedback => {
                const selection = feedback.selection.food;
                // Render selected choice to selection div
                document.querySelector(".selection").innerHTML = selection;
                // Clear Input
                document.querySelector(".autoComplete").value = "";
                // Change placeholder with the selected value
                document.querySelector(".autoComplete").setAttribute("placeholder", selection);
                // Concole log autoComplete data feedback
                console.log(feedback);
            }
        });
*/
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