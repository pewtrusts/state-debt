import s from './styles.scss';
import Element from '@UI/element';

 export default class Bar extends Element {
    
    prerender(){
        var div = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return div;
        }
        div.classList.add(s.bar, s['barColor' + this.data.color]);
        div.style.transform = `scaleX(${this.linearScale(this.data.d, this.data.field)})`;

        return div;
    }
    linearScale(match, field){
        var typeObject = this.model.types.find(t => t.field === field),
            scale = ( match[field] - typeObject.min ) / typeObject.spread,
            adjusted = .01 + ( scale * .99 );

        return adjusted;
    }
    update(){
        // in development mode, this.el is a js object but does not refer to element rendered on the page
        //var el = process.env.NODE_ENV === 'development' ? document.querySelector(`.js-bar-compare-${this.data.field}-${index}`) : this.el;
        console.log(this);        
        this.el.style.transform = `scaleX(${this.linearScale(this.data.d, this.data.field)})`;
    }

}