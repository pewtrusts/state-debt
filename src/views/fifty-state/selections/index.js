import Element from '@UI/element';
import s from './styles.scss';

export default class FiftyStateView extends Element {
    prerender(){
         //container
        var view = super.prerender();
        this.children = [];
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        var dropdownWrapper = document.createElement('div');
        dropdownWrapper.classList.add(s.dropdownWrapper);
        [1,2,3].forEach(() => {
            var dropdownInner = document.createElement('div');
            dropdownInner.classList.add(s.dropdownInner);
            dropdownWrapper.appendChild(dropdownInner);
        });
        view.appendChild(dropdownWrapper);
        return view;
    }
    
}