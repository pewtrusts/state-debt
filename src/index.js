/*eslint no-debugger: 0 */
import './css/styles.scss';
import embed from './embed.html';
import footer from './footer.html';

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
});