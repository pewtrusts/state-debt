
import Element from '@UI/element';
import s from './styles.scss';

export default class Comparison extends Element {
    prerender(){
         //container
        var view = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.comparisonView);
        console.log(this);
        this.model.groups.forEach(group => {
            var groupDiv = document.createElement('div');
            groupDiv.classList.add(s.group);
            groupDiv.insertAdjacentHTML('afterbegin', `<h3>${group}</h3>`)
            view.appendChild(groupDiv);
        });
        return view;
    }
}