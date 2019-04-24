/* global PUBLICPATH process module */
//utils
import * as d3 from 'd3-collection';
import Papa from 'papaparse';
import { stateModule as S } from 'stateful-dead';
//import PS from 'pubsub-setter';
import { publishWindowResize } from '@Utils';

//data ( CSVs loaded by file-loader for use by Papaparse at build and runtime. that's set in webpack.common.js )
import data from './data/data.csv';
import groups from './data/groups.json';
import types from './data/types.json';
import dict from './data/dictionary.json';

//views
import ComparisonView from './views/state-comparison/';
import FiftyStateView from './views/fifty-state/';

// app prototype
import PCTApp from '@App';

//static content
import sections from './partials/sections.html';
import footer from './partials/footer.html';

publishWindowResize(S);

const model = {
    groups,
    types,
    dict
};

const views = [];

var scrollPosition = 0;

function getRuntimeData(){
    var publicPath = '';
    if ( process.env.NODE_ENV === 'production' && !window.IS_PRERENDERING ){ // production build needs to know the public path of assets
                                                                             // for dev and preview, assets are a child of root; for build they
                                                                             // are in some distant path on sitecore
        publicPath = PUBLICPATH; // TODO: set PUBLICPATH using define plugin in webpack.build.js
    }
    return new Promise((resolve, reject) => {
        var appContainer = this.el;
        Papa.parse(publicPath + data, {
            download: true,
            dynamicTyping: true,
            header: true,
            fastMode: true, // no string escapes
            skipEmptyLines: true,
            beforeFirstChunk(chunk){ // on prerender, do simple hash of CSV contents and append as attribute of the app container
                                     // at runtime, do same hash of csv contents and compare to original. if hashes match, app will
                                     // continue normally. if mismatched, app will rerender all components based on the new data.
                                     // this allows for `hot` updating of the main data file without rebuilding the dist/ folder.
                                     // `model.isMismatch` will be set to `true` and the prerendering functions will check that value
                                     // and respond accordingly

                var dataHash = chunk.hashCode(); // hashCode is helper function from utils, imported and IIFE'd in index.js
                if ( window.IS_PRERENDERING ){
                    appContainer.setAttribute('data-data-hash', dataHash);
                } else if ( process.env.NODE_ENV !== 'development' && dataHash.toString() !== appContainer.getAttribute('data-data-hash') ){
                    appContainer.setAttribute('data-data-mismatch',true);
                    console.log('data mismatch');
                    model.isMismatched = true; // set so that components can access this value 
                }
            },
            complete: response => { // arrow function here to keep `this` context as StateDebt
                
                views.length = 0;  // HERE YOU NEED TO NEST BY USING THE THE GROUP THAT THE VALUE MAPS TO
                var data = response.data;
                /* complete model based on fetched data */
                model.data = data;
                model.types.forEach(type => {
                    if ( type.type !== 'text'){
                        let dataArray = data.map(d => d[type.field]).filter(d => d !== null); 
                        type.max = Math.max(...dataArray);
                        type.min = Math.min(...dataArray);
                        type.spread = type.max - type.min;
                        type.crossesZero = type.max * type.min <= 0;
                    }
                });
                model.typesNested = d3.nest().key(d => d.group).entries(model.types);
                console.log(model);
                // ....
               
                /* push views now that model is complete */
                
                views.push(
                    this.createComponent(model, ComparisonView, 'div#comparison-view', {renderToSelector: '#section-comparison .js-inner-content', rerenderOnDataMismatch: true, parent: this}),  
                    this.createComponent(model, FiftyStateView, 'div#fifty-state-view', {renderToSelector: '#section-states .js-inner-content', rerenderOnDataMismatch: true, parent: this})  
                );
                
                resolve(true);
            },
            error: function(error){
                reject(error);
            }
        });
    });
}

export default class StateDebt extends PCTApp {
    prerender(){
        console.log('prerender');
        this.el.insertAdjacentHTML('beforeend', sections);
        this.el.insertAdjacentHTML('beforeend', footer);
        //this.wasPrerendered = false;
        getRuntimeData.call(this).then(() => { // bind StateDebt as context `this` for getRuntimeData so that it can acceess this.el, etc
            console.log(model);
            
            views.forEach(view => {
                view.container.appendChild(view.el); // different here from CapeTown: views aren't appended to app container; some static content
                                                     // is present already. views appended to *their* containers
            });
            //this.container.classList.add('rendered');
        });
    }
    init(){
        console.log('init');
        super.init();
        this.attachSectionOpenClose();
        this.initStaticAnchorLinks();
        getRuntimeData.call(this).then(() => {
            views.forEach(view => {
               view.init(this);                    
            });
        });                                

        if ( module.hot ){
            let that = this;
            module.hot.accept('./views/state-comparison', () => {
                console.log('accept!', arguments, that);
                document.querySelector('#section-comparison .js-inner-content').innerHTML = '';
                var replacement = that.createComponent(model, ComparisonView, 'div#comparison-view', {renderToSelector: '#section-comparison .js-inner-content', rerenderOnDataMismatch: true});
                console.log(replacement);
                replacement.container.appendChild(replacement.el);

            });
        }
    }
    initStaticAnchorLinks(){
        var links = document.querySelectorAll('.pct-static-anchor');
        links.forEach(link => {
            var target = document.querySelector('#' + link.href.split('#')[1]);
            link.addEventListener('click', function(e){
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            });

        });
    }
    attachSectionOpenClose(){
        function toggleSection(){
            console.log(this.parentNode);
            this.parentNode.querySelector('.js-inner-content').classList.toggle('pct-hide');
            this.classList.toggle('pct-is-closed');
            this.blur();
        }
        document.querySelectorAll('#pew-app section > h2').forEach(heading => {
            heading.addEventListener('click', toggleSection);
            heading.addEventListener('keyup', function(e){
                if (e.keyCode === 13){
                    toggleSection.call(this);
                }
            });
        });
    }
    returnMoreLink(field){
        console.log(field);
        function scrollBack(){
            window.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
            });
            this.removeEventListener('click', scrollBack);
            this.classList.remove('showGoBack');
        }
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
            document.querySelectorAll('.showGoBack').forEach(function(each){
                each.classList.remove('showGoBack');
            });
            header.classList.add('showGoBack');
            header.addEventListener('click', scrollBack);
        });
        return link;
    }
}