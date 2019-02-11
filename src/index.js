/*eslint no-debugger: 0 */
/* global process */
import StateDebt from './state-debt.js';
import './css/styles.scss';


const container = '#pew-app';
const App = new StateDebt(container, {
	needsRouter: false
});
if ( process.env.NODE_ENV === 'development' || window.IS_PRERENDERING ){ // process development means using WebPack dev server. window is prerendering means in
	App.prerender();
}
App.init();
/*
function toggleSection(){
	console.log(this.parentNode);
	this.parentNode.querySelector('.js-inner-content').classList.toggle('pct-hide');
	this.classList.toggle('pct-is-closed');
	this.blur();
}

document.querySelector('#pew-app').insertAdjacentHTML('beforeend', embed);
document.querySelector('#pew-app').insertAdjacentHTML('beforeend', footer);

document.querySelectorAll('#pew-app section > h2').forEach(heading => {
	heading.addEventListener('click', toggleSection);
	heading.addEventListener('keyup', function(e){
		if (e.keyCode === 13){
			toggleSection.call(this);
		}
	});
});*/