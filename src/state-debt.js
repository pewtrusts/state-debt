// app prototype
import PCTApp from '@App';
import sections from './partials/sections.html';
import footer from './partials/footer.html';

export default class StateDebt extends PCTApp {
    prerender(){
        console.log('prerender');
        document.querySelector('#pew-app').insertAdjacentHTML('beforeend', sections);
        document.querySelector('#pew-app').insertAdjacentHTML('beforeend', footer);
        /*this.wasPrerendered = false;
        getRuntimeData().then(() => {
            views.forEach(view => {
                this.container.appendChild(view.el);
            });
            this.container.classList.add('rendered');
        });*/
    }
    init(){
        console.log('init');
        super.init();

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
        /*getRuntimeData().then(() => {
            views.forEach(view => {
               view.init(this);                     // the views are all constructors (new keyword), so they are objects with methods, properties etc
            });
            //
            super.init(); // super init include fn that addss has-hover class to body when mouse is use, removes it when touch is used.
        });*/                                // STEP ONE:  index.js calls this init()
    }
}